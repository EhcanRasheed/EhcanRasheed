import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Throttle } from '@nestjs/throttler';
import { HiringSessionService } from './hiring-session.service';

/**
 * Public endpoints for candidates — NO auth required.
 * Rate-limited to prevent abuse.
 */
@Controller('hire')
export class HiringPublicController {
  constructor(private readonly hiringService: HiringSessionService) {}

  /**
   * Get session info for the landing page
   */
  @Get(':sessionId/info')
  @Throttle({ default: { limit: 30, ttl: 60000 } })
  async getSessionInfo(@Param('sessionId') sessionId: string) {
    return this.hiringService.getPublicSessionInfo(sessionId);
  }

  /**
   * Candidate joins — submits name, email, resume (multipart)
   */
  @Post(':sessionId/join')
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  @UseInterceptors(FileInterceptor('resume', { limits: { fileSize: 25 * 1024 * 1024 } }))
  async joinSession(
    @Param('sessionId') sessionId: string,
    @Body() dto: { name: string; email: string },
    @UploadedFile() resume?: Express.Multer.File,
  ) {
    return this.hiringService.joinSession(sessionId, dto, resume);
  }

  /**
   * Get interview questions for candidate
   */
  @Get(':sessionId/candidate/:candidateId/questions')
  @Throttle({ default: { limit: 30, ttl: 60000 } })
  async getQuestions(
    @Param('sessionId') sessionId: string,
    @Param('candidateId') candidateId: string,
  ) {
    return this.hiringService.getCandidateQuestions(sessionId, candidateId);
  }

  /**
   * Submit an answer
   */
  @Post(':sessionId/candidate/:candidateId/answer')
  @Throttle({ default: { limit: 60, ttl: 60000 } })
  async submitAnswer(
    @Param('sessionId') sessionId: string,
    @Param('candidateId') candidateId: string,
    @Body() dto: {
      questionId: string;
      questionText: string;
      answerText: string;
      difficulty?: string;
      questionOrder?: number;
    },
  ) {
    return this.hiringService.submitCandidateAnswer(sessionId, candidateId, dto);
  }

  /**
   * End interview — triggers AI evaluation
   */
  @Post(':sessionId/candidate/:candidateId/end')
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  async endInterview(
    @Param('sessionId') sessionId: string,
    @Param('candidateId') candidateId: string,
  ) {
    return this.hiringService.endCandidateInterview(sessionId, candidateId);
  }
}
