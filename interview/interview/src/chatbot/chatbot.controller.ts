import { Controller, Post, Body, HttpException, HttpStatus } from '@nestjs/common';
import { ChatbotService } from './chatbot.service';

@Controller('chatbot')
export class ChatbotController {
  constructor(private readonly chatbotService: ChatbotService) {}

  @Post('chat')
  async chat(@Body() body: { message: string; history?: any[] }) {
    const { message, history = [] } = body;

    if (!message) {
      throw new HttpException('Message is required', HttpStatus.BAD_REQUEST);
    }

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
}