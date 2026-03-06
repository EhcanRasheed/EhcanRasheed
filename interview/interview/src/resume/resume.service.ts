import { Injectable, InternalServerErrorException, NotFoundException, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import pdf from 'pdf-parse-fork'; // ✅ Modern ESM-compatible import
import Groq from 'groq-sdk';
import { ResumeAnalysis } from './entity/resume-analysis.entity';

@Injectable()
export class ResumeService implements OnModuleInit {
  private groq: any;

  constructor(
    private configService: ConfigService,
    @InjectRepository(ResumeAnalysis) private analysisRepo: Repository<ResumeAnalysis>,
  ) {}

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
              "overallScore": number (0 to 100),
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

RESPONSE FORMAT RULES:
1. Start with a ONE-SENTENCE overview of your advice.
2. Then give **3-5 bullet points** using markdown "- " prefix. Each bullet must be specific and actionable.
3. Bold the key skills or keywords with **double asterisks**.
4. End with one short sentence of encouragement or a next-step.
5. NEVER give generic advice like "use action verbs" or "fix font size". Every bullet must reference a SPECIFIC gap or strength from the analysis data.
6. Keep each bullet to 1-2 sentences max.

Example format:
Here's how to boost your match score:

- Add **Kubernetes** and **Docker** to your skills section — the job lists these as required and your resume doesn't mention them.
- Rewrite your second project bullet to highlight **CI/CD pipeline** experience since the role emphasizes deployment automation.
- Your **Python** background is strong — mention it alongside **data analysis** to align with the job's analytics requirements.

Make these changes and your score should jump significantly.` 
      },
      ...history.map((h: any) => ({
        role: h.role === 'user' ? 'user' : 'assistant',
        content: h.content
      })),
      { role: 'user', content: message }
    ],
    model: 'llama-3.3-70b-versatile',
    temperature: 0.5,
  });

  return { reply: chatCompletion.choices[0]?.message?.content };
}

  async saveAnalysis(userId: number, data: { fileName: string; jobDescription: string; overallScore: number; summary?: string; strengths?: string[]; gaps?: string[]; chatMessages?: any[] }) {
    const analysis = Object.assign(new ResumeAnalysis(), {
      userId,
      fileName: data.fileName,
      jobDescription: data.jobDescription,
      overallScore: data.overallScore,
      summary: data.summary ?? null,
      strengths: data.strengths ?? null,
      gaps: data.gaps ?? null,
      chatMessages: data.chatMessages ?? null,
    });
    return this.analysisRepo.save(analysis);
  }

  async listAnalyses(userId: number) {
    return this.analysisRepo.find({
      where: { userId },
      order: { createdAt: 'DESC' },
      select: ['id', 'fileName', 'jobDescription', 'overallScore', 'createdAt'],
    });
  }

  async getAnalysis(userId: number, id: number) {
    const analysis = await this.analysisRepo.findOne({ where: { id, userId } });
    if (!analysis) throw new NotFoundException('Analysis not found');
    return analysis;
  }

  async deleteAnalysis(userId: number, id: number) {
    const analysis = await this.analysisRepo.findOne({ where: { id, userId } });
    if (!analysis) throw new NotFoundException('Analysis not found');
    await this.analysisRepo.remove(analysis);
    return { deleted: true };
  }

  async updateAnalysis(userId: number, id: number, data: { chatMessages?: any[] }) {
    const analysis = await this.analysisRepo.findOne({ where: { id, userId } });
    if (!analysis) throw new NotFoundException('Analysis not found');
    if (data.chatMessages !== undefined) analysis.chatMessages = data.chatMessages;
    return this.analysisRepo.save(analysis);
  }
}