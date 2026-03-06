import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { InterviewController } from './interview.controller';
import { InterviewService } from './interview.service';
import { InterviewSession } from './entity/interview-session.entity';
import { SessionAnswer } from './entity/session-answer.entity';
import { InterviewSessionController } from './interview-session.controller';
import { InterviewSessionService } from './interview-session.service';
import { QuestionBank } from '../question/entity/question-bank.entity';
import { Question } from '../question/entity/question.entity';
import { BankFeedback } from '../question/entity/bank-feedback.entity';
import { UsageModule } from '../common/usage.module';

@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forFeature([InterviewSession, SessionAnswer, QuestionBank, Question, BankFeedback]),
    UsageModule,
  ],
  controllers: [InterviewController, InterviewSessionController],
  providers: [InterviewService, InterviewSessionService],
})
export class InterviewModule {}
