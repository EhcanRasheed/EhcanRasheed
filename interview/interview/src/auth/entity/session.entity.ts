import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Profile } from '../../profile/entity/profile.entity';

@Entity('session')
export class Session {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Profile, { onDelete: 'CASCADE' })
  user: Profile;

  @Column({ type: 'varchar', nullable: true })
  @Index()
  refreshToken?: string | null;

  @Column({ nullable: true })
  accessToken: string;

  @Column({ default: true })
  isActive: boolean;

  @Column({ nullable: true })
  userAgent?: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
