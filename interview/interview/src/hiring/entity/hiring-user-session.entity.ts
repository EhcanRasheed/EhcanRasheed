import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { HiringUser } from './hiring-user.entity';

@Entity('hiring_user_session')
export class HiringUserSession {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => HiringUser, { onDelete: 'CASCADE' })
  hiringUser: HiringUser;

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
