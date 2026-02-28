import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  CreateDateColumn,
} from 'typeorm';
import { Profile } from '../../profile/entity/profile.entity';
import { QuestionBank } from '../../question/entity/question-bank.entity';
import { SessionAnswer } from './session-answer.entity';

@Entity('interview_session')
export class InterviewSession {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Profile, { onDelete: 'CASCADE' })
  user: Profile;

  @ManyToOne(() => QuestionBank, { onDelete: 'CASCADE' })
  bank: QuestionBank;

  @Column({ type: 'varchar', default: 'in-progress' })
  status: string; // 'in-progress' | 'completed' | 'evaluated'

  @Column({ type: 'timestamp', nullable: true })
  startedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  endedAt: Date;

  @Column({ type: 'float', nullable: true })
  totalScore: number;

  @Column({ type: 'jsonb', nullable: true })
  evaluation: any;

  @Column({ type: 'jsonb', nullable: true })
  transcript: any;

  @OneToMany(() => SessionAnswer, (sa) => sa.session, { cascade: true })
  answers: SessionAnswer[];

  @CreateDateColumn()
  createdAt: Date;
}
