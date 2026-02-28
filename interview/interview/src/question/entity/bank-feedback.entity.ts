import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
} from 'typeorm';
import { Profile } from '../../profile/entity/profile.entity';
import { QuestionBank } from './question-bank.entity';

@Entity('bank_feedback')
export class BankFeedback {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => QuestionBank, { onDelete: 'CASCADE' })
  bank: QuestionBank;

  @ManyToOne(() => Profile, { onDelete: 'CASCADE' })
  user: Profile;

  @Column({ type: 'int', default: 5 })
  rating: number; // 1-5 stars

  @Column({ type: 'text', nullable: true })
  comment: string | null;

  @CreateDateColumn()
  createdAt: Date;
}
