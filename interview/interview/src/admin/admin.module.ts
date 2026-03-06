import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { Profile } from '../profile/entity/profile.entity';
import { QuestionBank } from '../question/entity/question-bank.entity';
import { Question } from '../question/entity/question.entity';
import { BankFeedback } from '../question/entity/bank-feedback.entity';
import { PaymentRequest } from './entity/payment.entity';
import { PaymentController } from './payment.controller';
import { Session } from '../auth/entity/session.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Profile, QuestionBank, Question, BankFeedback, PaymentRequest, Session])],
  controllers: [AdminController, PaymentController],
  providers: [AdminService],
})
export class AdminModule {}
