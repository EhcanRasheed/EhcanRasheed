import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ChatbotController } from './chatbot.controller';
import { ChatbotService } from './chatbot.service';

@Module({
  imports: [ConfigModule], // Required to read your GROQ_API_KEY from .env
  controllers: [ChatbotController],
  providers: [ChatbotService],
})
export class ChatbotModule {}