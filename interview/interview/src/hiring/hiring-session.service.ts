import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  OnModuleInit,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { LessThanOrEqual, Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import Groq from 'groq-sdk';
import pdf from 'pdf-parse-fork';
import { Cron, CronExpression } from '@nestjs/schedule';

import { HiringSession, HiringSessionStatus } from './entity/hiring-session.entity';
import { HiringCandidate, CandidateInterviewStatus } from './entity/hiring-candidate.entity';
import { HiringUser } from './entity/hiring-user.entity';
import { QuestionBank } from '../question/entity/question-bank.entity';
import { Question } from '../question/entity/question.entity';
import { MailService } from '../mail/mail.service';

@Injectable()
export class HiringSessionService implements OnModuleInit {
  private groq: any;

  constructor(
    private readonly configService: ConfigService,
    @InjectRepository(HiringSession)
    private readonly sessionRepo: Repository<HiringSession>,
    @InjectRepository(HiringCandidate)
    private readonly candidateRepo: Repository<HiringCandidate>,
    @InjectRepository(HiringUser)
    private readonly hiringUserRepo: Repository<HiringUser>,
    @InjectRepository(QuestionBank)
    private readonly bankRepo: Repository<QuestionBank>,
    @InjectRepository(Question)
    private readonly questionRepo: Repository<Question>,
    private readonly mailService: MailService,
  ) {}

  onModuleInit() {
    const apiKey = this.configService.get<string>('GROQ_API_KEY');
    if (apiKey) {
      this.groq = new Groq({ apiKey });
    }
  }

  // ───────────── CRON: Auto-expire sessions ─────────────

  @Cron(CronExpression.EVERY_MINUTE)
  async handleExpiredSessions() {
    const now = new Date();
    await this.sessionRepo
      .createQueryBuilder()
      .update(HiringSession)
      .set({ status: HiringSessionStatus.EXPIRED })
      .where('status = :status', { status: HiringSessionStatus.ACTIVE })
      .andWhere('"expiresAt" <= :now', { now })
      .execute();
  }

  // ───────────── Dashboard Analytics ─────────────

  async getDashboardStats(hiringUserId: string) {
    const sessions = await this.sessionRepo.find({
      where: { hiringUser: { id: hiringUserId } },
      relations: ['candidates'],
    });

    const activeSessions = sessions.filter((s) => s.status === HiringSessionStatus.ACTIVE).length;
    const totalSessions = sessions.length;
    const totalCandidates = sessions.reduce((sum, s) => sum + (s.candidates?.length || 0), 0);
    const evaluatedCandidates = sessions.reduce(
      (sum, s) =>
        sum +
        (s.candidates?.filter((c) => c.interviewStatus === CandidateInterviewStatus.EVALUATED)
          .length || 0),
      0,
    );

    const allScores = sessions.flatMap(
      (s) =>
        s.candidates
          ?.filter((c) => c.totalScore != null)
          .map((c) => c.totalScore) || [],
    );
    const avgScore =
      allScores.length > 0
        ? Math.round((allScores.reduce((a, b) => a + b, 0) / allScores.length) * 10) / 10
        : 0;

    const completionRate =
      totalCandidates > 0
        ? Math.round((evaluatedCandidates / totalCandidates) * 100)
        : 0;

    return {
      activeSessions,
      totalSessions,
      totalCandidates,
      evaluatedCandidates,
      avgScore,
      completionRate,
    };
  }

  // ───────────── Session CRUD (Hiring User) ─────────────

  async createSession(
    hiringUserId: string,
    dto: {
      title: string;
      bankId?: string;
      customQuestions?: any[];
      maxCandidates: number;
      durationDays: number;
      jobDescription?: string;
    },
  ) {
    const validLimits = [5, 20, 50, 100, 300, 500, 1000];
    const validDurations = [1, 3, 10];

    if (!validLimits.includes(dto.maxCandidates)) {
      throw new BadRequestException('Invalid candidate limit. Choose from: 5, 20, 50, 100, 300, 500, 1000');
    }
    if (!validDurations.includes(dto.durationDays)) {
      throw new BadRequestException('Invalid duration. Choose from: 1, 3, or 10 days');
    }

    let bank: QuestionBank | null = null;
    if (dto.bankId) {
      bank = await this.bankRepo.findOne({ where: { id: dto.bankId } });
      if (!bank) throw new NotFoundException('Question bank not found');
    }

    if (!dto.bankId && (!dto.customQuestions || dto.customQuestions.length === 0)) {
      throw new BadRequestException('Either a question bank or custom questions are required');
    }

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + dto.durationDays);

    const session = this.sessionRepo.create({
      hiringUser: { id: hiringUserId } as HiringUser,
      title: dto.title,
      bank: bank || undefined,
      customQuestions: dto.customQuestions || null,
      maxCandidates: dto.maxCandidates,
      durationDays: dto.durationDays,
      expiresAt,
      jobDescription: dto.jobDescription || null,
      status: HiringSessionStatus.ACTIVE,
    });

    const saved = await this.sessionRepo.save(session);

    return {
      sessionId: saved.id,
      title: saved.title,
      maxCandidates: saved.maxCandidates,
      durationDays: saved.durationDays,
      expiresAt: saved.expiresAt,
      shareLink: `/hire/${saved.id}`,
    };
  }

  async getSessions(hiringUserId: string) {
    const sessions = await this.sessionRepo.find({
      where: { hiringUser: { id: hiringUserId } },
      relations: ['bank', 'candidates'],
      order: { createdAt: 'DESC' },
    });

    return sessions.map((s) => ({
      id: s.id,
      title: s.title,
      bankName: s.bank?.name || 'Custom Questions',
      maxCandidates: s.maxCandidates,
      completedCandidates: s.completedCandidates,
      candidatesJoined: s.candidates?.length || 0,
      durationDays: s.durationDays,
      expiresAt: s.expiresAt,
      status: s.status,
      createdAt: s.createdAt,
      shareLink: `/hire/${s.id}`,
    }));
  }

  async getSessionDetail(sessionId: string, hiringUserId: string) {
    const session = await this.sessionRepo.findOne({
      where: { id: sessionId, hiringUser: { id: hiringUserId } },
      relations: ['bank', 'candidates', 'hiringUser'],
    });
    if (!session) throw new NotFoundException('Session not found');

    return {
      id: session.id,
      title: session.title,
      bankName: session.bank?.name || 'Custom Questions',
      bankId: session.bank?.id || null,
      maxCandidates: session.maxCandidates,
      completedCandidates: session.completedCandidates,
      durationDays: session.durationDays,
      expiresAt: session.expiresAt,
      status: session.status,
      jobDescription: session.jobDescription,
      createdAt: session.createdAt,
      shareLink: `/hire/${session.id}`,
      candidates: (session.candidates || []).map((c) => {
        const iScore = c.totalScore ?? null;
        const rScore = c.resumeAnalysis?.overallScore ?? null;
        const combined = iScore != null && rScore != null ? Math.round(iScore * 0.85 + rScore * 0.15) : iScore;
        const grade = combined != null ? (combined >= 90 ? 'A+' : combined >= 80 ? 'A' : combined >= 70 ? 'B+' : combined >= 60 ? 'B' : combined >= 50 ? 'C' : combined >= 40 ? 'D' : 'F') : null;
        return {
          id: c.id,
          name: c.name,
          email: c.email,
          interviewStatus: c.interviewStatus,
          resumeScore: rScore,
          interviewScore: iScore,
          combinedScore: combined,
          grade,
          totalScore: c.totalScore,
          completedAt: c.completedAt,
          createdAt: c.createdAt,
        };
      }),
    };
  }

  async getCandidateDetail(candidateId: string, hiringUserId: string) {
    const candidate = await this.candidateRepo.findOne({
      where: { id: candidateId },
      relations: ['hiringSession', 'hiringSession.hiringUser'],
    });
    if (!candidate) throw new NotFoundException('Candidate not found');
    if (candidate.hiringSession.hiringUser.id !== hiringUserId) {
      throw new NotFoundException('Candidate not found');
    }

    return {
      id: candidate.id,
      name: candidate.name,
      email: candidate.email,
      resumeFileName: candidate.resumeFileName,
      resumeAnalysis: candidate.resumeAnalysis,
      interviewStatus: candidate.interviewStatus,
      evaluation: candidate.evaluation,
      totalScore: candidate.totalScore,
      transcript: candidate.transcript,
      answers: candidate.answers,
      startedAt: candidate.startedAt,
      completedAt: candidate.completedAt,
      createdAt: candidate.createdAt,
    };
  }

  async getCandidateResume(candidateId: string, hiringUserId: string) {
    const candidate = await this.candidateRepo.findOne({
      where: { id: candidateId },
      relations: ['hiringSession', 'hiringSession.hiringUser'],
    });
    if (!candidate) throw new NotFoundException('Candidate not found');
    if (candidate.hiringSession.hiringUser.id !== hiringUserId) {
      throw new NotFoundException('Candidate not found');
    }
    if (!candidate.resumeBase64) {
      throw new NotFoundException('No resume uploaded');
    }

    return {
      base64: candidate.resumeBase64,
      fileName: candidate.resumeFileName || 'resume.pdf',
    };
  }

  async deactivateSession(sessionId: string, hiringUserId: string) {
    const session = await this.sessionRepo.findOne({
      where: { id: sessionId, hiringUser: { id: hiringUserId } },
    });
    if (!session) throw new NotFoundException('Session not found');

    session.status = HiringSessionStatus.CLOSED;
    await this.sessionRepo.save(session);
    return { message: 'Session closed', status: session.status };
  }

  async deleteSession(sessionId: string, hiringUserId: string) {
    const session = await this.sessionRepo.findOne({
      where: { id: sessionId, hiringUser: { id: hiringUserId } },
    });
    if (!session) throw new NotFoundException('Session not found');
    await this.sessionRepo.remove(session);
    return { message: 'Session deleted' };
  }

  // ───────────── Custom Question Bank (Hiring User) ─────────────

  async getAvailableBanks(hiringUserId: string) {
    // Return admin-created published banks + this hiring user's own banks
    const rows = await this.bankRepo
      .createQueryBuilder('bank')
      .leftJoin('bank.questions', 'q')
      .leftJoin('bank.createdBy', 'creator')
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
      .andWhere(
        '(creator.role = :adminRole OR bank."hiringCreatedById" = :hiringUserId)',
        { adminRole: 'admin', hiringUserId },
      )
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

  async getBankQuestions(bankId: string) {
    const bank = await this.bankRepo.findOne({ where: { id: bankId }, relations: ['questions'] });
    if (!bank) throw new NotFoundException('Bank not found');
    return {
      id: bank.id,
      name: bank.name,
      description: bank.description,
      category: bank.category,
      questions: (bank.questions || []).map((q) => ({
        id: q.id,
        text: q.text,
        category: q.category,
        subcategory: q.subcategory,
        difficulty: q.difficulty,
      })),
    };
  }

  async createCustomBank(
    hiringUserId: string,
    dto: {
      name: string;
      category: string;
      questions: Array<{ question: string; difficulty?: string; category?: string }>;
    },
  ) {
    if (!dto.questions || dto.questions.length === 0) {
      throw new BadRequestException('At least one question is required');
    }

    const diffCounts: Record<string, number> = { easy: 0, medium: 0, hard: 0 };
    for (const q of dto.questions) {
      const d = (q.difficulty || 'medium').toLowerCase();
      diffCounts[d] = (diffCounts[d] || 0) + 1;
    }
    const total = dto.questions.length;
    const parts: string[] = [];
    if (diffCounts.easy > 0) parts.push(`${diffCounts.easy} Easy`);
    if (diffCounts.medium > 0) parts.push(`${diffCounts.medium} Medium`);
    if (diffCounts.hard > 0) parts.push(`${diffCounts.hard} Hard`);
    const description = `${total} questions — ${parts.join(', ')}`;

    // Link to hiring user so only they (and admin) can see it
    const bank = this.bankRepo.create({
      name: dto.name,
      description,
      category: dto.category || 'General',
      isPublished: true, // Published so the session can reference it
      createdBy: undefined,
      hiringCreatedBy: { id: hiringUserId } as any,
    });
    const savedBank = await this.bankRepo.save(bank);

    const questions = dto.questions.map((q, i) =>
      this.questionRepo.create({
        text: q.question,
        category: q.category || dto.category || 'General',
        difficulty: q.difficulty || 'medium',
        orderIndex: i,
        bank: savedBank,
      }),
    );
    await this.questionRepo.save(questions);

    return {
      id: savedBank.id,
      name: savedBank.name,
      description: savedBank.description,
      category: savedBank.category,
      questionsUploaded: questions.length,
    };
  }

  // ───────────── PUBLIC: Candidate Flow ─────────────

  /**
   * Get session info for the public landing page.
   */
  async getPublicSessionInfo(sessionId: string) {
    const session = await this.sessionRepo.findOne({
      where: { id: sessionId },
      relations: ['hiringUser', 'bank'],
    });
    if (!session) throw new NotFoundException('Session not found');

    // Check if session is still active
    if (session.status !== HiringSessionStatus.ACTIVE) {
      return {
        active: false,
        status: session.status,
        title: session.title,
        companyName: session.hiringUser?.companyName || session.hiringUser?.fullName || 'Company',
      };
    }

    // Check if expired
    if (new Date() > session.expiresAt) {
      session.status = HiringSessionStatus.EXPIRED;
      await this.sessionRepo.save(session);
      return {
        active: false,
        status: 'expired',
        title: session.title,
        companyName: session.hiringUser?.companyName || session.hiringUser?.fullName || 'Company',
      };
    }

    // Check if full
    if (session.completedCandidates >= session.maxCandidates) {
      session.status = HiringSessionStatus.FULL;
      await this.sessionRepo.save(session);
      return {
        active: false,
        status: 'full',
        title: session.title,
        companyName: session.hiringUser?.companyName || session.hiringUser?.fullName || 'Company',
      };
    }

    return {
      active: true,
      status: session.status,
      title: session.title,
      companyName: session.hiringUser?.companyName || session.hiringUser?.fullName || 'Company',
      jobDescription: session.jobDescription,
    };
  }

  /**
   * Candidate joins a session — submits name, email, resume.
   */
  async joinSession(
    sessionId: string,
    dto: { name: string; email: string },
    resumeFile?: Express.Multer.File,
  ) {
    const session = await this.sessionRepo.findOne({
      where: { id: sessionId },
      relations: ['hiringUser', 'bank'],
    });
    if (!session) throw new NotFoundException('Session not found');

    if (session.status !== HiringSessionStatus.ACTIVE) {
      throw new BadRequestException('This session is no longer accepting candidates');
    }
    if (new Date() > session.expiresAt) {
      throw new BadRequestException('This session has expired');
    }
    if (session.completedCandidates >= session.maxCandidates) {
      throw new BadRequestException('This session has reached its candidate limit');
    }

    // Duplicate prevention
    const existingCandidate = await this.candidateRepo.findOne({
      where: { hiringSession: { id: sessionId }, email: dto.email },
    });
    if (existingCandidate) {
      throw new BadRequestException("You've already applied to this position.");
    }

    let resumeText: string | null = null;
    let resumeBase64: string | null = null;
    let resumeFileName: string | null = null;
    let resumeAnalysis: any = null;

    if (resumeFile) {
      resumeBase64 = resumeFile.buffer.toString('base64');
      resumeFileName = resumeFile.originalname;

      // Extract text from PDF
      try {
        const data = await pdf(resumeFile.buffer);
        resumeText = data.text;
      } catch (e) {
        console.error('PDF parse failed:', e.message);
      }

      // Analyze resume if we have text and a job description
      if (resumeText && resumeText.trim().length > 20 && this.groq) {
        try {
          resumeAnalysis = await this.analyzeResume(
            resumeText,
            session.jobDescription || session.title,
          );
        } catch (e) {
          console.error('Resume analysis failed:', e.message);
        }
      }
    }

    const candidate = this.candidateRepo.create({
      hiringSession: session,
      name: dto.name,
      email: dto.email,
      resumeText,
      resumeBase64,
      resumeFileName,
      resumeAnalysis,
      interviewStatus: CandidateInterviewStatus.NOT_STARTED,
    });

    const saved = await this.candidateRepo.save(candidate);

    return {
      candidateId: saved.id,
      sessionId: session.id,
      title: session.title,
    };
  }

  /**
   * Get questions for a candidate's interview (public).
   */
  async getCandidateQuestions(sessionId: string, candidateId: string) {
    const candidate = await this.candidateRepo.findOne({
      where: { id: candidateId, hiringSession: { id: sessionId } },
      relations: ['hiringSession', 'hiringSession.bank'],
    });
    if (!candidate) throw new NotFoundException('Candidate not found');

    const session = candidate.hiringSession;

    // If using a question bank from DB
    if (session.bank) {
      const questions = await this.questionRepo.find({
        where: { bank: { id: session.bank.id } },
      });

      // Use deterministic shuffle based on candidateId
      const seed = Array.from(candidateId).reduce((acc, c) => acc + c.charCodeAt(0), 0);
      let currentSeed = seed;
      const seededRandom = () => {
        currentSeed = (currentSeed * 9301 + 49297) % 233280;
        return currentSeed / 233280;
      };
      const shuffle = <T,>(arr: T[]): T[] => {
        const a = [...arr];
        for (let i = a.length - 1; i > 0; i--) {
          const j = Math.floor(seededRandom() * (i + 1));
          [a[i], a[j]] = [a[j], a[i]];
        }
        return a;
      };

      const easy = shuffle(questions.filter((q) => q.difficulty === 'easy'));
      const medium = shuffle(questions.filter((q) => q.difficulty === 'medium'));
      const hard = shuffle(questions.filter((q) => q.difficulty === 'hard'));
      const mid = Math.ceil(medium.length / 2);
      const sequenced = [...easy, ...medium.slice(0, mid), ...hard, ...medium.slice(mid)];

      // Update status
      if (candidate.interviewStatus === CandidateInterviewStatus.NOT_STARTED) {
        candidate.interviewStatus = CandidateInterviewStatus.IN_PROGRESS;
        candidate.startedAt = new Date();
        await this.candidateRepo.save(candidate);
      }

      return sequenced.map((q, idx) => ({
        id: q.id,
        text: q.text,
        category: q.category,
        subcategory: q.subcategory,
        difficulty: q.difficulty,
        orderIndex: idx + 1,
      }));
    }

    // If using custom questions
    if (session.customQuestions && session.customQuestions.length > 0) {
      if (candidate.interviewStatus === CandidateInterviewStatus.NOT_STARTED) {
        candidate.interviewStatus = CandidateInterviewStatus.IN_PROGRESS;
        candidate.startedAt = new Date();
        await this.candidateRepo.save(candidate);
      }

      return session.customQuestions.map((q: any, idx: number) => ({
        id: `custom-${idx}`,
        text: q.question || q.text,
        category: q.category || 'General',
        difficulty: q.difficulty || 'medium',
        orderIndex: idx + 1,
      }));
    }

    throw new BadRequestException('No questions configured for this session');
  }

  /**
   * Candidate submits an answer (public).
   */
  async submitCandidateAnswer(
    sessionId: string,
    candidateId: string,
    dto: { questionId: string; questionText: string; answerText: string; difficulty?: string; questionOrder?: number },
  ) {
    const candidate = await this.candidateRepo.findOne({
      where: { id: candidateId, hiringSession: { id: sessionId } },
    });
    if (!candidate) throw new NotFoundException('Candidate not found');

    const existingAnswers = candidate.answers || [];
    // Update if already answered
    const idx = existingAnswers.findIndex((a: any) => a.questionId === dto.questionId);
    if (idx >= 0) {
      existingAnswers[idx].answerText = dto.answerText;
    } else {
      existingAnswers.push({
        questionId: dto.questionId,
        questionText: dto.questionText,
        answerText: dto.answerText,
        difficulty: dto.difficulty || 'medium',
        questionOrder: dto.questionOrder || existingAnswers.length + 1,
      });
    }

    candidate.answers = existingAnswers;
    await this.candidateRepo.save(candidate);

    return { message: 'Answer saved', answersCount: existingAnswers.length };
  }

  /**
   * End candidate interview — evaluate with AI (public).
   */
  async endCandidateInterview(sessionId: string, candidateId: string) {
    const candidate = await this.candidateRepo.findOne({
      where: { id: candidateId, hiringSession: { id: sessionId } },
      relations: ['hiringSession', 'hiringSession.hiringUser'],
    });
    if (!candidate) throw new NotFoundException('Candidate not found');

    if (
      candidate.interviewStatus === CandidateInterviewStatus.COMPLETED ||
      candidate.interviewStatus === CandidateInterviewStatus.EVALUATED
    ) {
      throw new BadRequestException('Interview already ended');
    }

    const answers = candidate.answers || [];

    // Build transcript
    const transcript = {
      candidateId: candidate.id,
      candidateName: candidate.name,
      candidateEmail: candidate.email,
      sessionTitle: candidate.hiringSession.title,
      date: new Date().toISOString(),
      totalQuestions: answers.length,
      questions: answers.map((a: any) => ({
        order: a.questionOrder || 0,
        questionId: a.questionId,
        question: a.questionText,
        difficulty: a.difficulty || 'medium',
        answer: a.answerText,
      })),
    };

    // AI Evaluation
    const evaluation = await this.evaluateWithAI(transcript);

    // Compute overall grade
    const interviewScore = evaluation.overallScore || 0;
    const resumeScore = candidate.resumeAnalysis?.overallScore || 0;
    const combinedScore = resumeScore > 0 ? Math.round(interviewScore * 0.85 + resumeScore * 0.15) : interviewScore;
    const gradeMap = (s: number) => s >= 90 ? 'A+' : s >= 80 ? 'A' : s >= 70 ? 'B+' : s >= 60 ? 'B' : s >= 50 ? 'C' : s >= 40 ? 'D' : 'F';
    evaluation.overallGrade = gradeMap(combinedScore);
    evaluation.combinedScore = combinedScore;
    evaluation.atsScore = resumeScore;

    candidate.interviewStatus = CandidateInterviewStatus.EVALUATED;
    candidate.completedAt = new Date();
    candidate.transcript = transcript;
    candidate.evaluation = evaluation;
    candidate.totalScore = evaluation.overallScore;
    await this.candidateRepo.save(candidate);

    // Increment counter on session
    const session = candidate.hiringSession;
    session.completedCandidates += 1;
    if (session.completedCandidates >= session.maxCandidates) {
      session.status = HiringSessionStatus.FULL;
    }
    await this.sessionRepo.save(session);

    // Send email notification to hiring user
    try {
      await this.sendCandidateCompletionEmail(
        session.hiringUser,
        candidate,
        evaluation,
      );
    } catch (e) {
      console.error('Failed to send notification email:', e.message);
    }

    return { message: 'Interview completed. Thank you!' };
  }

  // ───────────── AI Evaluation ─────────────

  private async evaluateWithAI(transcript: any): Promise<any> {
    if (!this.groq) {
      return this.fallbackEvaluation(transcript);
    }

    try {
      const qaBlock = transcript.questions
        .map(
          (q: any) =>
            `[${q.difficulty}]\nQ: ${q.question}\nA: ${q.answer || '(no answer)'}`,
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
      "score": <number>,
      "maxScore": <5 for easy, 8 for medium, 10 for hard>,
      "correctAnswer": "The ideal answer in 2-4 sentences",
      "feedback": "1-2 sentence specific feedback"
    }
  ]
}

SCORING:
- Easy questions: 0-5 (max 5)
- Medium questions: 0-8 (max 8)
- Hard questions: 0-10 (max 10)

overallScore = (total earned / total possible) * 100.
Be fair and professional. Output ONLY the raw JSON object.`,
          },
          {
            role: 'user',
            content: `Candidate: ${transcript.candidateName}\nDate: ${transcript.date}\nTotal Questions: ${transcript.totalQuestions}\n\n${qaBlock}`,
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

        const safePerQuestion = Array.isArray(parsed.perQuestion)
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
          : [];

        let totalEarned = 0;
        let totalPossible = 0;
        safePerQuestion.forEach((q: any) => {
          totalEarned += q.score;
          totalPossible += q.maxScore;
        });

        const calculatedOverallScore =
          totalPossible > 0 ? Math.round((totalEarned / totalPossible) * 100) : 0;

        return {
          overallScore: calculatedOverallScore,
          summary: typeof parsed.summary === 'string' ? parsed.summary : 'Evaluation completed.',
          strengths: Array.isArray(parsed.strengths) ? parsed.strengths.slice(0, 5) : [],
          weaknesses: Array.isArray(parsed.weaknesses) ? parsed.weaknesses.slice(0, 5) : [],
          recommendations: Array.isArray(parsed.recommendations) ? parsed.recommendations.slice(0, 5) : [],
          perQuestion: safePerQuestion,
        };
      } catch (_) {
        console.error('Failed to parse evaluation response:', raw);
        return this.fallbackEvaluation(transcript);
      }
    } catch (error: any) {
      console.error('Groq evaluation error:', error?.message);
      return this.fallbackEvaluation(transcript);
    }
  }

  private fallbackEvaluation(transcript: any) {
    return {
      overallScore: 0,
      summary: 'AI evaluation could not be completed.',
      perQuestion: (transcript.questions || []).map((q: any) => ({
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

  // ───────────── Resume Analysis ─────────────

  private async analyzeResume(resumeText: string, jobDescription: string): Promise<any> {
    const chatCompletion = await this.groq.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: `You are a professional ATS analyzer. Return ONLY a valid JSON object.
          Format:
          {
            "overallScore": number,
            "summary": "string",
            "strengths": ["string"],
            "gaps": ["string"],
            "suggestions": ["string"]
          }`,
        },
        {
          role: 'user',
          content: `Job Description: ${jobDescription}\n\nResume Content: ${resumeText}`,
        },
      ],
      model: 'llama-3.3-70b-versatile',
      response_format: { type: 'json_object' },
      temperature: 0.1,
    });

    const rawResponse = chatCompletion.choices[0]?.message?.content || '{}';
    return JSON.parse(rawResponse);
  }

  // ───────────── Email Notification ─────────────

  private async sendCandidateCompletionEmail(
    hiringUser: HiringUser,
    candidate: HiringCandidate,
    evaluation: any,
  ) {
    const html = `
      <html>
      <body style="font-family: Arial, sans-serif; color: #333; line-height: 1.6;">
        <div style="max-width: 600px; margin: auto; border: 1px solid #eee; padding: 20px; border-radius: 10px;">
          <h2 style="color: #c4a052; text-align: center;">Hire-Craft — New Interview Completed</h2>
          <p>Hello <b>${hiringUser.fullName}</b>,</p>
          <p>A candidate has completed their interview:</p>
          <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; margin: 15px 0;">
            <p><strong>Candidate:</strong> ${candidate.name}</p>
            <p><strong>Email:</strong> ${candidate.email}</p>
            <p><strong>Interview Score:</strong> ${evaluation.overallScore}/100</p>
            <p><strong>Resume Score:</strong> ${candidate.resumeAnalysis?.overallScore ?? 'N/A'}/100</p>
          </div>
          <p>Log in to your Hiring Ease dashboard to view the full analysis.</p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
          <p style="font-size: 12px; color: #888; text-align: center;">Hire-Craft Hiring Ease</p>
        </div>
      </body>
      </html>
    `;

    await this.mailService.sendGenericMail(
      hiringUser.email,
      'New Interview Completed — Hire-Craft',
      html,
    );
  }
}
