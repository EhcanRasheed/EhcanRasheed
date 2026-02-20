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
            content: `You are the HireCraft AI Interview Coach. You MUST respond with a valid JSON object only, no other text.

Response format (strict):
{"intro": "Your greeting and context in plain text, e.g. Hello! I'm ready to help you prepare for your Senior C++ Developer interview. Let's get started with a technical question:", "question": "The actual interview question only, e.g. Can you explain the difference between a pointer and a reference in C++, and provide an example of when you would use each?"}

Rules:
- "intro": short greeting/context only (e.g. "Hello! I'm ready to help... Let's get started with a question:") 
only at the first response don't repeat it again and again.
 And when a user asks an irrelevant question simply say "I am only designed to answer questions related to your 
 interview. No asterisks.
- "question": the single interview question you are asking. No asterisks inside the JSON.
- Output ONLY the JSON object, no markdown code block, no extra text. Also evaluate the answers`,
          },
          ...history.map((h) => ({
            role: h.role === 'user' ? 'user' : 'assistant',
            content: h.content || '',
          })),
          { role: 'user', content: message },
        ],
        model: 'llama-3.3-70b-versatile',
        temperature: 0.4,
      };

      const chatCompletion = await this.groq.chat.completions.create(payload);
      const raw = chatCompletion.choices[0]?.message?.content?.trim() || '';

      // Parse JSON: intro (plain) + question (we will bold on frontend)
      try {
        const cleaned = raw.replace(/^```(?:json)?\s*|\s*```$/g, '').trim();
        const parsed = JSON.parse(cleaned);
        const intro = typeof parsed.intro === 'string' ? parsed.intro : '';
        const question = typeof parsed.question === 'string' ? parsed.question : '';
        if (intro || question) {
          return question ? `${intro}\n\n**${question}**` : intro || 'No response from AI.';
        }
      } catch (_) {
        // Not JSON: return as-is and let frontend handle ** if present
      }
      return raw || 'No response from AI.';

    } catch (error: any) {
      console.error('--- GROQ API ERROR ---', error?.message);
      throw new InternalServerErrorException('AI Coach is temporarily unavailable.');
    }
  }
}