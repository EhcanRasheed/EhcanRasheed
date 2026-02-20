import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Profile } from '../../profile/entity/profile.entity';
import { Question } from '../../question/entity/question.entity';

@Entity('answer')
export class Answer {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'text' })
  content: string;

  @Column({ type: 'text', nullable: true })
  feedback: string;

  @ManyToOne(() => Profile)
  user: Profile;

  @ManyToOne(() => Question)
  question: Question;
}