import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
} from 'typeorm';
import { HiringSession } from './hiring-session.entity';

export enum CandidateInterviewStatus {
  NOT_STARTED = 'not_started',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  EVALUATED = 'evaluated',
}

@Entity('hiring_candidate')
export class HiringCandidate {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => HiringSession, (s) => s.candidates, { onDelete: 'CASCADE' })
  hiringSession: HiringSession;

  @Column()
  name: string;

  @Column()
  email: string;

  @Column({ type: 'text', nullable: true })
  resumeText: string | null; // Extracted text from PDF

  @Column({ type: 'text', nullable: true })
  resumeBase64: string | null; // Original PDF as base64 for download

  @Column({ type: 'text', nullable: true })
  resumeFileName: string | null;

  @Column({ type: 'jsonb', nullable: true })
  resumeAnalysis: any; // { overallScore, summary, strengths[], gaps[], suggestions[] }

  @Column({
    type: 'enum',
    enum: CandidateInterviewStatus,
    default: CandidateInterviewStatus.NOT_STARTED,
  })
  interviewStatus: CandidateInterviewStatus;

  @Column({ type: 'jsonb', nullable: true })
  answers: any; // Array of { questionId, questionText, answerText, difficulty }

  @Column({ type: 'jsonb', nullable: true })
  evaluation: any; // Full AI evaluation same as interview module

  @Column({ type: 'float', nullable: true })
  totalScore: number;

  @Column({ type: 'jsonb', nullable: true })
  transcript: any;

  @Column({ type: 'timestamp', nullable: true })
  startedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  completedAt: Date;

  @CreateDateColumn()
  createdAt: Date;
}
