import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('question')
export class Question {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  text: string;

  @Column()
  category: string;

  @Column({ default: 'medium' })
  difficulty: string;
}