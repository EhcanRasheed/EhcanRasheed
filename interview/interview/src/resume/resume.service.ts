import { Injectable, InternalServerErrorException, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import pdf from 'pdf-parse-fork'; // ✅ Modern ESM-compatible import
import Groq from 'groq-sdk';

@Injectable()
export class ResumeService implements OnModuleInit {
  private groq: any;

  constructor(private configService: ConfigService) {}

  onModuleInit() {
    const apiKey = this.configService.get<string>('GROQ_API_KEY');
    if (apiKey) {
      this.groq = new Groq({ apiKey });
    }
  }

  async analyze(file: Express.Multer.File, jobDescription: string) {
    if (!this.groq) throw new InternalServerErrorException('AI Service not initialized.');
    if (!file || !file.buffer) throw new InternalServerErrorException('No file uploaded.');

    try {
      // ✅ pdf-parse-fork works directly with the standard call signature
      const data = await pdf(file.buffer);
      const resumeText = data.text;

      if (!resumeText || resumeText.trim().length < 20) {
        throw new Error('PDF is unreadable or empty.');
      }

      console.log('✅ Extraction successful for HireCraft. Length:', resumeText.length);

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
            }`
          },
          {
            role: 'user',
            content: `Job Description: ${jobDescription}\n\nResume Content: ${resumeText}`
          }
        ],
        model: 'llama-3.3-70b-versatile',
        response_format: { type: "json_object" }, 
        temperature: 0.1,
      });

      const rawResponse = chatCompletion.choices[0]?.message?.content || '{}';
      return JSON.parse(rawResponse);

    } catch (error) {
      console.error('--- HIRECRAFT SYSTEM ERROR ---', error);
      throw new InternalServerErrorException('Analysis failed: ' + error.message);
    }
  }

 async chat(chatData: any) {
  const { message, history, analysis, key } = chatData;
  
  // Extract specific gaps and strengths from the previous analysis
  const gaps = analysis?.gaps?.length > 0 ? analysis.gaps.join(', ') : 'general alignment';
  const strengths = analysis?.strengths?.length > 0 ? analysis.strengths.join(', ') : 'your background';

  const chatCompletion = await this.groq.chat.completions.create({
    messages: [
      { 
        role: 'system', 
        content: `You are the HireCraft AI Career Coach. Your goal is to help the user bridge the gap between their resume and the target role: "${key}".

        CONTEXT:
        - User's Match Score: ${analysis?.overallScore}%
        - Missing Keywords/Gaps: ${gaps}
        - Top Strengths to Leverage: ${strengths}

        RESPONSE RULES:
        1. Be a COACH, not a list-maker. Instead of "do this," say "Since the job requires X and you have Y, try rephrasing Z."
        2. NO GENERIC ADVICE. Don't mention "font size" or "action verbs" unless it's a specific issue.
        3. FOCUS ON THE DATA. Use the "Missing Keywords" from the analysis to tell the user exactly what to add.
        4. STAY CONCISE. Short, high-impact paragraphs. Use **bolding** for specific skills or keywords.` 
      },
      ...history.map((h: any) => ({
        role: h.role === 'user' ? 'user' : 'assistant',
        content: h.content
      })),
      { role: 'user', content: message }
    ],
    model: 'llama-3.3-70b-versatile',
    temperature: 0.6, // Balanced for professional yet natural conversation
  });

  return { reply: chatCompletion.choices[0]?.message?.content };
}
}