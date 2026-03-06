import { Controller, Post, Get, Delete, Patch, Param, Req, UseGuards, UseInterceptors, UploadedFile, Body } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ResumeService } from './resume.service';
import { JwtAuthGuard } from '../common/guards/auth.guard';
import { UsageService } from '../common/usage.service';

@Controller('resume')
export class ResumeController {
  constructor(
    private readonly resumeService: ResumeService,
    private readonly usageService: UsageService,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Post('analyze')
  @UseInterceptors(FileInterceptor('resume'))
  async analyzeResume(@Req() req, @UploadedFile() file: Express.Multer.File, @Body('key') jobDescription: string) {
    const userId = req.user.id ?? req.user.sub;
    await this.usageService.checkAndIncrement(userId, 'resumes');
    return this.resumeService.analyze(file, jobDescription);
  }

  @Post('chat')
  async chatAboutResume(@Body() chatData: any) {
    return this.resumeService.chat(chatData);
  }

  @UseGuards(JwtAuthGuard)
  @Post('sessions')
  async saveAnalysis(@Req() req, @Body() body: any) {
    const userId = req.user.id ?? req.user.sub;
    return this.resumeService.saveAnalysis(userId, body);
  }

  @UseGuards(JwtAuthGuard)
  @Get('sessions')
  async listAnalyses(@Req() req) {
    const userId = req.user.id ?? req.user.sub;
    return this.resumeService.listAnalyses(userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('sessions/:id')
  async getAnalysis(@Req() req, @Param('id') id: string) {
    const userId = req.user.id ?? req.user.sub;
    return this.resumeService.getAnalysis(userId, +id);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('sessions/:id')
  async deleteAnalysis(@Req() req, @Param('id') id: string) {
    const userId = req.user.id ?? req.user.sub;
    return this.resumeService.deleteAnalysis(userId, +id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('sessions/:id')
  async updateAnalysis(@Req() req, @Param('id') id: string, @Body() body: any) {
    const userId = req.user.id ?? req.user.sub;
    return this.resumeService.updateAnalysis(userId, +id, body);
  }
}