import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { QuestionBank } from './question-bank.entity';

@Entity('question')
export class Question {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'text' })
  text: string;

  @Column()
  category: string;

  @Column({ nullable: true })
  subcategory: string;

  @Column({ default: 'medium' })
  difficulty: string;

  @Column({ default: 0 })
  orderIndex: number;

  @ManyToOne(() => QuestionBank, (bank) => bank.questions, { onDelete: 'CASCADE' })
  bank: QuestionBank;
}