import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';

@Entity('chatbot_session')
export class ChatbotSession {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  userId: number;

  @Column({ nullable: true })
  title: string;

  @Column({ type: 'jsonb' })
  messages: { role: string; content: string; time: string }[];

  @Column({ nullable: true })
  questionCount: number;

  @Column({ type: 'float', nullable: true })
  score: number;

  @Column({ type: 'jsonb', nullable: true })
  evaluation: { score: number; strengths: string[]; improvements: string[]; summary: string };

  @Column({ nullable: true })
  durationMinutes: number;

  @CreateDateColumn()
  createdAt: Date;
}
