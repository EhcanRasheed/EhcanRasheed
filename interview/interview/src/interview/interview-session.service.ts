import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import Groq from 'groq-sdk';
import { InterviewSession } from './entity/interview-session.entity';
import { SessionAnswer } from './entity/session-answer.entity';
import { QuestionBank } from '../question/entity/question-bank.entity';
import { Question } from '../question/entity/question.entity';
import { BankFeedback } from '../question/entity/bank-feedback.entity';
import { Profile } from '../profile/entity/profile.entity';
import { UsageService } from '../common/usage.service';

@Injectable()
export class InterviewSessionService implements OnModuleInit {
  private groq: any;

  constructor(
    private readonly configService: ConfigService,
    @InjectRepository(InterviewSession)
    private readonly sessionRepo: Repository<InterviewSession>,
    @InjectRepository(SessionAnswer)
    private readonly answerRepo: Repository<SessionAnswer>,
    @InjectRepository(QuestionBank)
    private readonly bankRepo: Repository<QuestionBank>,
    @InjectRepository(Question)
    private readonly questionRepo: Repository<Question>,
    @InjectRepository(BankFeedback)
    private readonly feedbackRepo: Repository<BankFeedback>,
    private readonly usageService: UsageService,
  ) {}

  onModuleInit() {
    const apiKey = this.configService.get<string>('GROQ_API_KEY');
    if (!apiKey) {
      console.error('⚠️ GROQ_API_KEY missing — interview evaluation will not work');
      return;
    }
    this.groq = new Groq({ apiKey });
  }

  /** List all available question banks (only published ones for users) — single optimised query */
  async getAvailableBanks() {
    const rows = await this.bankRepo
      .createQueryBuilder('bank')
      .leftJoin('bank.questions', 'q')
      .select([
        'bank.id         AS id',
        'bank.name       AS name',
        'bank.description AS description',
        'bank.category   AS category',
        'bank.createdAt  AS "createdAt"',
        'COUNT(q.id)::int                                          AS "questionCount"',
        "COUNT(q.id) FILTER (WHERE q.difficulty = 'easy')::int     AS \"easyCount\"",
        "COUNT(q.id) FILTER (WHERE q.difficulty = 'medium')::int   AS \"mediumCount\"",
        "COUNT(q.id) FILTER (WHERE q.difficulty = 'hard')::int     AS \"hardCount\"",
      ])
      .where('bank.isPublished = :pub', { pub: true })
      .groupBy('bank.id')
      .orderBy('bank.createdAt', 'DESC')
      .getRawMany();

    return rows.map((r) => ({
      id: r.id,
      name: r.name,
      description: r.description,
      category: r.category,
      questionCount: r.questionCount ?? 0,
      easyCount: r.easyCount ?? 0,
      mediumCount: r.mediumCount ?? 0,
      hardCount: r.hardCount ?? 0,
      createdAt: r.createdAt,
    }));
  }

  /** Start a new interview session */
  async startSession(userId: number, bankId: string) {
    await this.usageService.checkAndIncrement(userId, 'interviews');
    const bank = await this.bankRepo.findOne({ where: { id: bankId } });
    if (!bank) throw new NotFoundException('Question Bank not found');

    const questionCount = await this.questionRepo.count({ where: { bank: { id: bankId } } });
    if (questionCount === 0) {
      throw new BadRequestException('This question bank has no questions');
    }

    const session = this.sessionRepo.create({
      user: { id: userId } as Profile,
      bank,
      status: 'in-progress',
      startedAt: new Date(),
    });

    const saved = await this.sessionRepo.save(session);
    return { sessionId: saved.id, bankName: bank.name, questionCount };
  }

  /** Get all questions for a session's question bank — smart sequencing */
  async getSessionQuestions(sessionId: string, userId: number) {
    const session = await this.sessionRepo.findOne({
      where: { id: sessionId, user: { id: userId } },
      relations: ['bank'],
    });
    if (!session) throw new NotFoundException('Session not found');

    const questions = await this.questionRepo.find({
      where: { bank: { id: session.bank.id } },
    });

    // Smart sequencing: warm-up → build → peak → cool-down
    const shuffle = <T,>(arr: T[]): T[] => {
      const a = [...arr];
      for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
      }
      return a;
    };

    const easy = shuffle(questions.filter((q) => q.difficulty === 'easy'));
    const medium = shuffle(questions.filter((q) => q.difficulty === 'medium'));
    const hard = shuffle(questions.filter((q) => q.difficulty === 'hard'));

    // Split medium into build-up and cool-down halves
    const midpoint = Math.ceil(medium.length / 2);
    const mediumBuild = medium.slice(0, midpoint);
    const mediumCoolDown = medium.slice(midpoint);

    // Sequence: easy (warm-up) → medium first half (build) → hard (peak) → medium second half (cool-down)
    const sequenced = [...easy, ...mediumBuild, ...hard, ...mediumCoolDown];

    return sequenced.map((q, idx) => ({
      id: q.id,
      text: q.text,
      category: q.category,
      subcategory: q.subcategory,
      difficulty: q.difficulty,
      orderIndex: idx + 1,
    }));
  }

  /** Submit an answer for a specific question in a session */
  async submitAnswer(
    sessionId: string,
    userId: number,
    dto: { questionId: string; answerText: string; questionOrder: number },
  ) {
    const session = await this.sessionRepo.findOne({
      where: { id: sessionId, user: { id: userId } },
    });
    if (!session) throw new NotFoundException('Session not found');
    if (session.status !== 'in-progress') {
      throw new BadRequestException('Session is no longer active');
    }

    // Check if this question was already answered in this session
    const existing = await this.answerRepo.findOne({
      where: { session: { id: sessionId }, question: { id: dto.questionId } },
    });
    if (existing) {
      // Update existing answer
      existing.answerText = dto.answerText;
      return this.answerRepo.save(existing);
    }

    const answer = this.answerRepo.create({
      session,
      question: { id: dto.questionId } as Question,
      answerText: dto.answerText,
      questionOrder: dto.questionOrder,
    });
    return this.answerRepo.save(answer);
  }

  /** End the interview — build transcript, evaluate, store results */
  async endSession(sessionId: string, userId: number) {
    const session = await this.sessionRepo.findOne({
      where: { id: sessionId, user: { id: userId } },
      relations: ['bank', 'user'],
    });
    if (!session) throw new NotFoundException('Session not found');
    if (session.status !== 'in-progress') {
      throw new BadRequestException('Session already ended');
    }

    // Get all answers with question details
    const answers = await this.answerRepo.find({
      where: { session: { id: sessionId } },
      relations: ['question'],
      order: { questionOrder: 'ASC' },
    });

    // Build transcript
    const transcript = {
      sessionId: session.id,
      user: session.user.fullName || session.user.email,
      bank: session.bank.name,
      category: session.bank.category,
      date: new Date().toISOString(),
      totalQuestions: answers.length,
      questions: answers.map((a) => ({
        order: a.questionOrder,
        questionId: a.question?.id,
        question: a.question?.text || 'Unknown',
        category: a.question?.category || '',
        subcategory: a.question?.subcategory || '',
        difficulty: a.question?.difficulty || '',
        answer: a.answerText,
        answeredAt: a.answeredAt,
      })),
    };

    // Build evaluation payload (send to AI API)
    // For now, we generate a placeholder evaluation.
    // Replace this with actual API call to your AI evaluation service.
    const evaluation = await this.evaluateWithAI(transcript);

    // Update session
    session.status = 'evaluated';
    session.endedAt = new Date();
    session.transcript = transcript;
    session.evaluation = evaluation;
    session.totalScore = evaluation.overallScore;

    await this.sessionRepo.save(session);

    return {
      sessionId: session.id,
      bankId: session.bank?.id || null,
      status: 'evaluated',
      totalScore: evaluation.overallScore,
      evaluation,
      transcript,
    };
  }

  /**
   * Evaluate the interview using Groq AI (same provider as the Chatbot).
   */
  private async evaluateWithAI(transcript: any): Promise<any> {
    if (!this.groq) {
      console.error('Groq not initialized — returning fallback evaluation');
      return this.fallbackEvaluation(transcript);
    }

    try {
      // Build a readable Q&A block for the LLM
      const qaBlock = transcript.questions
        .map(
          (q: any) =>
            `[${q.category}${q.subcategory ? '/' + q.subcategory : ''} | ${q.difficulty}]\nQ: ${q.question}\nA: ${q.answer || '(no answer)'}`,
        )
        .join('\n\n');

      const payload = {
        messages: [
          {
            role: 'system',
            content: `You are an expert interview evaluator. You will receive a candidate's interview transcript consisting of questions and answers.

You MUST respond with a valid JSON object only, no other text.

Response format (strict JSON, no markdown code blocks):
{
  "overallScore": <number 0-100>,
  "summary": "2-3 sentence overall assessment",
  "strengths": ["strength 1", "strength 2"],
  "weaknesses": ["weakness 1", "weakness 2"],
  "recommendations": ["recommendation 1", "recommendation 2"],
  "perQuestion": [
    {
      "questionId": "<id or null>",
      "question": "<the question text>",
      "score": <number — max depends on difficulty>,
      "maxScore": <5 for easy, 8 for medium, 10 for hard>,
      "correctAnswer": "The ideal/correct answer to this question in 2-4 sentences",
      "feedback": "1-2 sentence specific feedback for this answer"
    }
  ]
}

BALANCED WEIGHTED SCORING (important):
- Easy questions: score 0-5 (max 5 points)
- Medium questions: score 0-8 (max 8 points)
- Hard questions: score 0-10 (max 10 points)

PARTIAL CREDIT POLICY:
- For hard questions, be generous with partial credit — a reasonable attempt that shows understanding of the concept should earn at least 50% even if the answer is incomplete.
- For easy questions, expect a complete answer — partial credit should only be given when the core idea is present.
- For medium questions, apply standard partial credit.

CORRECT ANSWER REQUIREMENT:
- For EVERY question, you MUST provide a "correctAnswer" field containing the ideal answer in 2-4 clear sentences. This helps candidates learn from their mistakes.

Per-question scoring guide (scale relative to maxScore):
- 0-20%: No answer or completely wrong
- 20-40%: Partially correct, major gaps
- 40-60%: Acceptable with some gaps
- 60-80%: Good answer, minor improvements possible
- 80-100%: Excellent, comprehensive answer

overallScore should be 0-100 and represent the total earned points divided by total possible points, times 100.
Be encouraging but honest. Plain text only in all string values — no markdown, no asterisks.
Output ONLY the raw JSON object.`,
          },
          {
            role: 'user',
            content: `Interview: ${transcript.bank} (${transcript.category})\nCandidate: ${transcript.user}\nDate: ${transcript.date}\nTotal Questions: ${transcript.totalQuestions}\n\n${qaBlock}`,
          },
        ],
        model: 'llama-3.3-70b-versatile',
        temperature: 0.3,
      };

      const chatCompletion = await this.groq.chat.completions.create(payload);
      const raw = chatCompletion.choices[0]?.message?.content?.trim() || '';

      try {
        const cleaned = raw.replace(/^```(?:json)?\s*|\s*```$/g, '').trim();
        const parsed = JSON.parse(cleaned);

        return {
          overallScore: Math.min(100, Math.max(0, Math.round(Number(parsed.overallScore) || 0))),
          summary: typeof parsed.summary === 'string' ? parsed.summary : 'Evaluation completed.',
          strengths: Array.isArray(parsed.strengths) ? parsed.strengths.slice(0, 5) : [],
          weaknesses: Array.isArray(parsed.weaknesses) ? parsed.weaknesses.slice(0, 5) : [],
          recommendations: Array.isArray(parsed.recommendations) ? parsed.recommendations.slice(0, 5) : [],
          perQuestion: Array.isArray(parsed.perQuestion)
            ? parsed.perQuestion.map((pq: any) => {
                const maxScore = [5, 8, 10].includes(Number(pq.maxScore)) ? Number(pq.maxScore) : 8;
                return {
                  questionId: pq.questionId || null,
                  question: pq.question || '',
                  score: Math.min(maxScore, Math.max(0, Math.round(Number(pq.score) || 0))),
                  maxScore,
                  correctAnswer: typeof pq.correctAnswer === 'string' ? pq.correctAnswer : '',
                  feedback: typeof pq.feedback === 'string' ? pq.feedback : '',
                };
              })
            : [],
        };
      } catch (_) {
        console.error('Failed to parse Groq evaluation response:', raw);
        return this.fallbackEvaluation(transcript);
      }
    } catch (error: any) {
      console.error('--- GROQ EVALUATION ERROR ---', error?.message);
      return this.fallbackEvaluation(transcript);
    }
  }

  private fallbackEvaluation(transcript: any) {
    return {
      overallScore: 0,
      summary: 'AI evaluation could not be completed. Please try again or check the GROQ_API_KEY.',
      perQuestion: transcript.questions.map((q: any) => ({
        questionId: q.questionId,
        question: q.question,
        score: 0,
        maxScore: 8,
        correctAnswer: '',
        feedback: 'Evaluation unavailable.',
      })),
      strengths: [],
      weaknesses: [],
      recommendations: [],
    };
  }

  /** Get interview history for a user (only sessions whose bank still exists) */
  async getUserHistory(userId: number) {
    // Clean up orphaned sessions (bank was deleted before CASCADE was added)
    await this.sessionRepo
      .createQueryBuilder()
      .delete()
      .where('"bankId" IS NULL')
      .andWhere('"userId" = :userId', { userId })
      .execute();

    const sessions = await this.sessionRepo.find({
      where: { user: { id: userId } },
      relations: ['bank'],
      order: { createdAt: 'DESC' },
    });

    // Extra safety: only return sessions with a valid bank
    return sessions
      .filter((s) => s.bank != null)
      .map((s) => ({
        id: s.id,
        bankName: s.bank.name,
        category: s.bank.category || '',
        status: s.status,
        totalScore: s.totalScore,
        startedAt: s.startedAt,
        endedAt: s.endedAt,
        createdAt: s.createdAt,
      }));
  }

  /** Get a single session with full details (evaluation + transcript) */
  async getSessionDetail(sessionId: string, userId: number) {
    const session = await this.sessionRepo.findOne({
      where: { id: sessionId, user: { id: userId } },
      relations: ['bank'],
    });
    if (!session) throw new NotFoundException('Session not found');

    return {
      id: session.id,
      bankId: session.bank?.id || null,
      bankName: session.bank?.name || 'Deleted Bank',
      category: session.bank?.category || '',
      status: session.status,
      totalScore: session.totalScore,
      startedAt: session.startedAt,
      endedAt: session.endedAt,
      evaluation: session.evaluation,
      transcript: session.transcript,
    };
  }

  /** Delete a session (only if it belongs to the user) */
  async deleteSession(sessionId: string, userId: number) {
    const session = await this.sessionRepo.findOne({
      where: { id: sessionId, user: { id: userId } },
    });
    if (!session) throw new NotFoundException('Session not found');
    await this.sessionRepo.remove(session);
    return { message: 'Session deleted' };
  }

  // ───────────── Bank Feedback ─────────────

  /** Submit feedback for a question bank */
  async submitFeedback(
    userId: number,
    bankId: string,
    dto: { rating: number; comment?: string },
  ) {
    const bank = await this.bankRepo.findOne({ where: { id: bankId } });
    if (!bank) throw new NotFoundException('Question Bank not found');

    const rating = Math.min(5, Math.max(1, Math.round(dto.rating || 5)));

    // Check if user already submitted feedback for this bank — update it
    let existing = await this.feedbackRepo.findOne({
      where: { bank: { id: bankId }, user: { id: userId } },
    });
    if (existing) {
      existing.rating = rating;
      existing.comment = dto.comment || existing.comment;
      await this.feedbackRepo.save(existing);
      return { message: 'Feedback updated', feedback: existing };
    }

    const feedback = this.feedbackRepo.create({
      bank,
      user: { id: userId } as Profile,
      rating,
      comment: dto.comment || null,
    });
    const saved = await this.feedbackRepo.save(feedback);
    return { message: 'Feedback submitted', feedback: saved };
  }

  /** Get feedback summary for a bank (anyone can see avg rating) */
  async getBankFeedbackSummary(bankId: string) {
    const feedbacks = await this.feedbackRepo.find({
      where: { bank: { id: bankId } },
    });
    if (feedbacks.length === 0) return { count: 0, avgRating: 0 };
    const avg = feedbacks.reduce((sum, f) => sum + f.rating, 0) / feedbacks.length;
    return { count: feedbacks.length, avgRating: Math.round(avg * 10) / 10 };
  }
}
