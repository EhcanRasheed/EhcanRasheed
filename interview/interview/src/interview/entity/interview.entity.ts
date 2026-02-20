import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Profile } from '../../profile/entity/profile.entity';

@Entity('interview')
export class Interview {
  @PrimaryGeneratedColumn() // Removed 'uuid' to match Profile's number ID
  id: number;

  @Column()
  title: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  date: Date;

  // This links the interview to the user profile
  @ManyToOne(() => Profile)
  user: Profile;
}