import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { Profile } from '../profile/entity/profile.entity';
import { QuestionBank } from '../question/entity/question-bank.entity';
import { Question } from '../question/entity/question.entity';
import { BankFeedback } from '../question/entity/bank-feedback.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Profile, QuestionBank, Question, BankFeedback])],
  controllers: [AdminController],
  providers: [AdminService],
})
export class AdminModule {}
