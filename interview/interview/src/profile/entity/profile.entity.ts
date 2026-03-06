import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Profile {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  fullName: string;

  @Column({ unique: true })
  email: string;

  @Column({ nullable: true })
  phoneNumber: string;

  @Column()
  passwordHash: string;

  @Column({ default: false })
  isActive: boolean;

  // ✅ THIS FIXES THE "DataTypeNotSupportedError"
  @Column({ type: 'varchar', nullable: true }) 
  otp: string | null;

  @Column({ type: 'timestamp', nullable: true })
  otpExpires: Date | null;

  @Column({ type: 'varchar', nullable: true })
  activationToken: string | null;

  @Column({ type: 'varchar', nullable: true })
  resetToken: string | null;

  @Column({ type: 'timestamp', nullable: true })
  resetTokenExpiry: Date | null;

  @Column({ type: 'varchar', default: 'user' })
  role: string; // 'user' | 'admin'

  @Column({ type: 'varchar', default: 'free' })
  tier: string; // 'free' | 'basic' | 'Professional' | 'Elite'

  // ─── Monthly usage counters (reset every 30 days) ───
  @Column({ type: 'int', default: 0 })
  interviewsThisMonth: number;

  @Column({ type: 'int', default: 0 })
  resumesThisMonth: number;

  @Column({ type: 'int', default: 0 })
  chatbotMessagesThisMonth: number;

  @Column({ type: 'timestamp', nullable: true })
  usageResetAt: Date | null;
}