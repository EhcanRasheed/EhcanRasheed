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
}