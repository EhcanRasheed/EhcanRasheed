import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { Profile } from '../../profile/entity/profile.entity';
import { Question } from './question.entity';

@Entity('question_bank')
export class QuestionBank {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ default: 'General' })
  category: string;

  @Column({ default: false })
  isPublished: boolean;

  @ManyToOne(() => Profile, { nullable: true, onDelete: 'SET NULL' })
  createdBy: Profile;

  @OneToMany(() => Question, (q) => q.bank, { cascade: true })
  questions: Question[];

  @CreateDateColumn()
  createdAt: Date;
}
