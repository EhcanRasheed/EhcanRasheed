import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { QuestionController } from './question.controller';
import { QuestionService } from './question.service';
import { Question } from './entity/question.entity';
import { QuestionBank } from './entity/question-bank.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Question, QuestionBank])],
  controllers: [QuestionController],
  providers: [QuestionService],
  exports: [TypeOrmModule],
})
export class QuestionModule {}
