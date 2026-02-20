import { Controller, Post, UseInterceptors, UploadedFile, Body } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ResumeService } from './resume.service';

@Controller('resume')
export class ResumeController {
  constructor(private readonly resumeService: ResumeService) {}

  @Post('analyze')
  @UseInterceptors(FileInterceptor('resume'))
  async analyzeResume(@UploadedFile() file: Express.Multer.File, @Body('key') jobDescription: string) {
    return this.resumeService.analyze(file, jobDescription);
  }

  @Post('chat')
  async chatAboutResume(@Body() chatData: any) {
    return this.resumeService.chat(chatData);
  }
}