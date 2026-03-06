import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChatbotController } from './chatbot.controller';
import { ChatbotService } from './chatbot.service';
import { ChatbotSession } from './entity/chatbot-session.entity';
import { UsageModule } from '../common/usage.module';

@Module({
  imports: [ConfigModule, TypeOrmModule.forFeature([ChatbotSession]), UsageModule],
  controllers: [ChatbotController],
  providers: [ChatbotService],
})
export class ChatbotModule {}