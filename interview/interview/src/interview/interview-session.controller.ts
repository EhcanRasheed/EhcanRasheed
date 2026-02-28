import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { InterviewSessionService } from './interview-session.service';
import { JwtAuthGuard } from '../common/guards/auth.guard';
import { CurrentUser } from '../common/decorators/user.decorator';

@Controller('interview-sessions')
@UseGuards(JwtAuthGuard)
export class InterviewSessionController {
  constructor(private readonly sessionService: InterviewSessionService) {}

  /** Get all available question banks for the user to pick from */
  @Get('banks')
  async getAvailableBanks() {
    return this.sessionService.getAvailableBanks();
  }

  // ───────────── Bank Feedback (must be before :id routes) ─────────────

  /** Submit feedback for a question bank */
  @Post('banks/:bankId/feedback')
  async submitFeedback(
    @Param('bankId') bankId: string,
    @CurrentUser() user: any,
    @Body() dto: { rating: number; comment?: string },
  ) {
    return this.sessionService.submitFeedback(user.id, bankId, dto);
  }

  /** Get feedback summary for a bank */
  @Get('banks/:bankId/feedback')
  async getBankFeedbackSummary(@Param('bankId') bankId: string) {
    return this.sessionService.getBankFeedbackSummary(bankId);
  }

  /** Start a new interview session */
  @Post('start')
  async startSession(
    @CurrentUser() user: any,
    @Body() dto: { bankId: string },
  ) {
    return this.sessionService.startSession(user.id, dto.bankId);
  }

  /** Get user's interview history */
  @Get('history/me')
  async getMyHistory(@CurrentUser() user: any) {
    return this.sessionService.getUserHistory(user.id);
  }

  /** Get questions for a session */
  @Get(':id/questions')
  async getSessionQuestions(
    @Param('id') id: string,
    @CurrentUser() user: any,
  ) {
    return this.sessionService.getSessionQuestions(id, user.id);
  }

  /** Submit an answer */
  @Post(':id/answer')
  async submitAnswer(
    @Param('id') id: string,
    @CurrentUser() user: any,
    @Body() dto: { questionId: string; answerText: string; questionOrder: number },
  ) {
    return this.sessionService.submitAnswer(id, user.id, dto);
  }

  /** End the interview and get evaluation */
  @Post(':id/end')
  async endSession(
    @Param('id') id: string,
    @CurrentUser() user: any,
  ) {
    return this.sessionService.endSession(id, user.id);
  }

  /** Get detailed result for a specific session */
  @Get(':id/detail')
  async getSessionDetail(
    @Param('id') id: string,
    @CurrentUser() user: any,
  ) {
    return this.sessionService.getSessionDetail(id, user.id);
  }

  /** Delete a session (user can only delete their own) */
  @Delete(':id')
  async deleteSession(
    @Param('id') id: string,
    @CurrentUser() user: any,
  ) {
    return this.sessionService.deleteSession(id, user.id);
  }
}
