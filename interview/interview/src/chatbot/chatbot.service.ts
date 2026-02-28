import { Injectable, InternalServerErrorException, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Groq from 'groq-sdk';

@Injectable()
export class ChatbotService implements OnModuleInit {
  private groq: any;

  constructor(private configService: ConfigService) {}

  onModuleInit() {
    const apiKey = this.configService.get<string>('GROQ_API_KEY');
    if (!apiKey) {
      console.error('❌ ERROR: GROQ_API_KEY is missing from .env');
      return;
    }
    this.groq = new Groq({ apiKey });
  }

  async generateResponse(history: any[], message: string): Promise<string> {
    if (!this.groq) {
      throw new InternalServerErrorException('Chatbot setup failed.');
    }

    try {
      const payload = {
        messages: [
          {
            role: 'system',
            content: `You are the HireCraft AI Interview Coach — a senior technical interviewer conducting a realistic mock interview. You MUST respond with a valid JSON object only, no other text.

Response format (strict JSON, no markdown code blocks):
{"feedback": "...", "question": "..."}

Field rules:
- "feedback": Your evaluation of the user's PREVIOUS answer (skip this field or set to "" on the very first message when no answer was given yet). Be specific and constructive:
  • State whether the answer was correct, partially correct, or incorrect.
  • Explain what was good and what was missing or wrong.
  • Provide the ideal concise answer or key points the user should have mentioned.
  Keep feedback to 2-4 sentences max. Be encouraging but honest.

- "question": The NEXT interview question. Adapt difficulty based on the user's performance:
  • If they answered well → ask a harder or deeper follow-up on the same topic.
  • If they struggled → ask a simpler related question to build understanding, or move to a different topic.
  • Mix question types: conceptual, scenario-based, coding/design, behavioral.
  Keep the question clear and concise (1-2 sentences).

Conversation flow:
1. First message from user typically states their target role/domain (e.g. "React developer", "Data Analyst"). Greet them briefly in the "feedback" field (e.g. "Great, let's start your React interview!") and ask the first question.
2. Every subsequent message is the user's answer to your last question. Evaluate it in "feedback", then ask the next question.
3. If the user asks something off-topic or irrelevant, set "feedback" to "I'm designed to help with interview preparation only. Let's stay focused!" and repeat or ask a new interview question.
4. NEVER use asterisks, markdown, or formatting inside the JSON values. Plain text only.
5. Output ONLY the raw JSON object. No wrapping, no code fences, no extra text before or after.`,
          },
          ...history.map((h) => ({
            role: h.role === 'user' ? 'user' : 'assistant',
            content: (h.content || '').replace(/\*\*/g, ''),
          })),
          { role: 'user', content: message },
        ],
        model: 'llama-3.3-70b-versatile',
        temperature: 0.4,
      };

      const chatCompletion = await this.groq.chat.completions.create(payload);
      const raw = chatCompletion.choices[0]?.message?.content?.trim() || '';

      // Parse JSON: feedback + question
      try {
        const cleaned = raw.replace(/^```(?:json)?\s*|\s*```$/g, '').trim();
        const parsed = JSON.parse(cleaned);
        const feedback = typeof parsed.feedback === 'string' ? parsed.feedback.trim() : '';
        const question = typeof parsed.question === 'string' ? parsed.question.trim() : '';
        const parts: string[] = [];
        if (feedback) parts.push(feedback);
        if (question) parts.push(`**${question}**`);
        if (parts.length) return parts.join('\n\n') || 'No response from AI.';
      } catch (_) {
        // Not valid JSON — try to extract and bold the question from raw text
        const stripped = raw.replace(/\*\*/g, '').replace(/^```(?:json)?\s*|\s*```$/g, '').trim();
        // Heuristic: find the last sentence ending with '?' — that's the question
        const sentences = stripped.split(/(?<=[.!?])\s+/);
        const qIdx = sentences.findLastIndex((s: string) => s.trim().endsWith('?'));
        if (qIdx >= 0) {
          const before = sentences.slice(0, qIdx).join(' ').trim();
          const question = sentences.slice(qIdx).join(' ').trim();
          const parts: string[] = [];
          if (before) parts.push(before);
          if (question) parts.push(`**${question}**`);
          return parts.join('\n\n');
        }
        // No question mark found — return as-is
      }
      return raw || 'No response from AI.';

    } catch (error: any) {
      console.error('--- GROQ API ERROR ---', error?.message);
      throw new InternalServerErrorException('AI Coach is temporarily unavailable.');
    }
  }

  async evaluateSession(history: any[]): Promise<{ score: number; strengths: string[]; improvements: string[]; summary: string }> {
    if (!this.groq) {
      throw new InternalServerErrorException('Chatbot setup failed.');
    }

    try {
      const conversationText = history
        .map((h) => `${h.role === 'user' ? 'Candidate' : 'Interviewer'}: ${(h.content || '').replace(/\*\*/g, '')}`)
        .join('\n');

      const payload = {
        messages: [
          {
            role: 'system',
            content: `You are an expert interview evaluator. Given the following mock interview conversation, evaluate the candidate's overall performance.

You MUST respond with a valid JSON object only, no other text.

Response format (strict JSON, no markdown code blocks):
{"score": <number 1-10>, "strengths": ["...", "..."], "improvements": ["...", "..."], "summary": "..."}

Field rules:
- "score": An integer from 1 to 10 representing overall performance (1=terrible, 5=average, 8=strong, 10=exceptional).
- "strengths": Array of 2-4 short bullet points highlighting what the candidate did well. Plain text, no markdown.
- "improvements": Array of 2-4 short bullet points on areas to improve. Plain text, no markdown.
- "summary": A 2-3 sentence overall assessment. Be encouraging but honest. Plain text only.

Output ONLY the raw JSON object. No wrapping, no code fences, no extra text.`,
          },
          {
            role: 'user',
            content: `Here is the interview conversation:\n\n${conversationText}`,
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
          score: Math.min(10, Math.max(1, Math.round(Number(parsed.score) || 5))),
          strengths: Array.isArray(parsed.strengths) ? parsed.strengths.slice(0, 4) : [],
          improvements: Array.isArray(parsed.improvements) ? parsed.improvements.slice(0, 4) : [],
          summary: typeof parsed.summary === 'string' ? parsed.summary : 'Session evaluation completed.',
        };
      } catch (_) {
        return { score: 5, strengths: [], improvements: [], summary: raw || 'Could not parse evaluation.' };
      }
    } catch (error: any) {
      console.error('--- GROQ EVALUATE ERROR ---', error?.message);
      throw new InternalServerErrorException('AI evaluation is temporarily unavailable.');
    }
  }
}