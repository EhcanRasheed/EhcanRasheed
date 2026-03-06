import { Controller, Post, Get, Delete, Body, Param, Req, UseGuards, HttpException, HttpStatus } from '@nestjs/common';
import { ChatbotService } from './chatbot.service';
import { JwtAuthGuard } from '../common/guards/auth.guard';
import { UsageService } from '../common/usage.service';

@Controller('chatbot')
export class ChatbotController {
  constructor(
    private readonly chatbotService: ChatbotService,
    private readonly usageService: UsageService,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Post('chat')
  async chat(@Req() req, @Body() body: { message: string; history?: any[] }) {
    const { message, history = [] } = body;

    if (!message) {
      throw new HttpException('Message is required', HttpStatus.BAD_REQUEST);
    }

    const userId = req.user.id ?? req.user.sub;
    await this.usageService.checkAndIncrement(userId, 'chatbot');

    try {
      const result = await this.chatbotService.generateResponse(history, message);
      return {
        success: true,
        response: result,
      };
    } catch (error: any) {
      console.error('Controller Error:', error.message);
      throw new HttpException(error.message || 'Internal Server Error', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post('evaluate')
  async evaluate(@Body() body: { history?: any[] }) {
    const { history = [] } = body;

    if (!history.length) {
      throw new HttpException('Conversation history is required', HttpStatus.BAD_REQUEST);
    }

    try {
      const result = await this.chatbotService.evaluateSession(history);
      return { success: true, ...result };
    } catch (error: any) {
      console.error('Evaluate Error:', error.message);
      throw new HttpException(error.message || 'Internal Server Error', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @UseGuards(JwtAuthGuard)
  @Post('sessions')
  async saveSession(@Req() req, @Body() body: { messages: any[]; questionCount: number; score?: number; evaluation?: any; durationMinutes?: number }) {
    const userId = req.user.id ?? req.user.sub;
    return this.chatbotService.saveSession(userId, body);
  }

  @UseGuards(JwtAuthGuard)
  @Get('sessions')
  async listSessions(@Req() req) {
    const userId = req.user.id ?? req.user.sub;
    return this.chatbotService.listSessions(userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('sessions/:id')
  async getSession(@Req() req, @Param('id') id: string) {
    const userId = req.user.id ?? req.user.sub;
    return this.chatbotService.getSession(userId, +id);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('sessions/:id')
  async deleteSession(@Req() req, @Param('id') id: string) {
    const userId = req.user.id ?? req.user.sub;
    return this.chatbotService.deleteSession(userId, +id);
  }
}