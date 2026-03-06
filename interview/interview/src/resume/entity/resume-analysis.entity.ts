import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';

@Entity('resume_analysis')
export class ResumeAnalysis {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  userId: number;

  @Column()
  fileName: string;

  @Column({ type: 'text' })
  jobDescription: string;

  @Column({ type: 'float' })
  overallScore: number;

  @Column({ type: 'text', nullable: true })
  summary: string;

  @Column({ type: 'jsonb', nullable: true })
  strengths: string[];

  @Column({ type: 'jsonb', nullable: true })
  gaps: string[];

  @Column({ type: 'jsonb', nullable: true })
  chatMessages: { role: string; content: string }[];

  @CreateDateColumn()
  createdAt: Date;
}
