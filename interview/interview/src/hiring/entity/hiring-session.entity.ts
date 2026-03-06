import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  CreateDateColumn,
} from 'typeorm';
import { HiringUser } from './hiring-user.entity';
import { QuestionBank } from '../../question/entity/question-bank.entity';
import { HiringCandidate } from './hiring-candidate.entity';

export enum HiringSessionStatus {
  ACTIVE = 'active',
  EXPIRED = 'expired',
  FULL = 'full',
  CLOSED = 'closed',
}

@Entity('hiring_session')
export class HiringSession {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => HiringUser, { onDelete: 'CASCADE' })
  hiringUser: HiringUser;

  @Column()
  title: string;

  @ManyToOne(() => QuestionBank, { nullable: true, onDelete: 'SET NULL' })
  bank: QuestionBank;

  @Column({ type: 'jsonb', nullable: true })
  customQuestions: any; // Array of { text, difficulty, category }

  @Column({ type: 'int' })
  maxCandidates: number; // 5, 20, 50, 100, 300, 500, 1000

  @Column({ type: 'int', default: 0 })
  completedCandidates: number;

  @Column({ type: 'timestamp' })
  expiresAt: Date;

  @Column({ type: 'int' })
  durationDays: number; // 1, 3, 10

  @Column({
    type: 'enum',
    enum: HiringSessionStatus,
    default: HiringSessionStatus.ACTIVE,
  })
  status: HiringSessionStatus;

  @Column({ type: 'text', nullable: true })
  jobDescription: string | null;

  @OneToMany(() => HiringCandidate, (c) => c.hiringSession, { cascade: true })
  candidates: HiringCandidate[];

  @CreateDateColumn()
  createdAt: Date;
}
