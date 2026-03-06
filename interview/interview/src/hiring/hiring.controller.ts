import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { HiringSessionService } from './hiring-session.service';
import { HiringJwtAuthGuard } from './guards/hiring-auth.guard';
import { CurrentHiringUser } from './guards/hiring-user.decorator';

@Controller('hiring')
@UseGuards(HiringJwtAuthGuard)
export class HiringController {
  constructor(private readonly hiringService: HiringSessionService) {}

  // ───────────── Dashboard ─────────────

  @Get('dashboard')
  async getDashboard(@CurrentHiringUser() user: any) {
    return this.hiringService.getDashboardStats(user.id);
  }

  // ───────────── Question Banks ─────────────

  @Get('banks')
  async getAvailableBanks(@CurrentHiringUser() user: any) {
    return this.hiringService.getAvailableBanks(user.id);
  }

  @Get('banks/:id')
  async getBankQuestions(@Param('id') id: string) {
    return this.hiringService.getBankQuestions(id);
  }

  @Post('banks')
  async createCustomBank(
    @CurrentHiringUser() user: any,
    @Body() dto: {
      name: string;
      category: string;
      questions: Array<{ question: string; difficulty?: string; category?: string }>;
    },
  ) {
    return this.hiringService.createCustomBank(user.id, dto);
  }

  // ───────────── Sessions ─────────────

  @Post('sessions')
  async createSession(
    @CurrentHiringUser() user: any,
    @Body() dto: {
      title: string;
      bankId?: string;
      customQuestions?: any[];
      maxCandidates: number;
      durationDays: number;
      jobDescription?: string;
    },
  ) {
    return this.hiringService.createSession(user.id, dto);
  }

  @Get('sessions')
  async getSessions(@CurrentHiringUser() user: any) {
    return this.hiringService.getSessions(user.id);
  }

  @Get('sessions/:id')
  async getSessionDetail(
    @Param('id') id: string,
    @CurrentHiringUser() user: any,
  ) {
    return this.hiringService.getSessionDetail(id, user.id);
  }

  @Patch('sessions/:id/deactivate')
  async deactivateSession(
    @Param('id') id: string,
    @CurrentHiringUser() user: any,
  ) {
    return this.hiringService.deactivateSession(id, user.id);
  }

  @Delete('sessions/:id')
  async deleteSession(
    @Param('id') id: string,
    @CurrentHiringUser() user: any,
  ) {
    return this.hiringService.deleteSession(id, user.id);
  }

  // ───────────── Candidates ─────────────

  @Get('candidates/:id')
  async getCandidateDetail(
    @Param('id') id: string,
    @CurrentHiringUser() user: any,
  ) {
    return this.hiringService.getCandidateDetail(id, user.id);
  }

  @Get('candidates/:id/resume')
  async getCandidateResume(
    @Param('id') id: string,
    @CurrentHiringUser() user: any,
  ) {
    return this.hiringService.getCandidateResume(id, user.id);
  }
}
