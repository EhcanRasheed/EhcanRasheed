import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
} from 'typeorm';
import { InterviewSession } from './interview-session.entity';
import { Question } from '../../question/entity/question.entity';

@Entity('session_answer')
export class SessionAnswer {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => InterviewSession, (s) => s.answers, { onDelete: 'CASCADE' })
  session: InterviewSession;

  @ManyToOne(() => Question, { onDelete: 'SET NULL', nullable: true })
  question: Question;

  @Column({ type: 'text' })
  answerText: string;

  @Column({ default: 0 })
  questionOrder: number;

  @CreateDateColumn()
  answeredAt: Date;
}
