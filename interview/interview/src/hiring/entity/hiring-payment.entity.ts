import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { HiringUser } from './hiring-user.entity';

export enum HiringPaymentStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

@Entity('hiring_payment_request')
export class HiringPaymentRequest {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => HiringUser, { onDelete: 'CASCADE' })
  hiringUser: HiringUser;

  @Column()
  paymentMethod: string;

  @Column({ type: 'text' })
  screenshotBase64: string;

  @Column({
    type: 'enum',
    enum: HiringPaymentStatus,
    default: HiringPaymentStatus.PENDING,
  })
  status: HiringPaymentStatus;

  @Column({ type: 'text', nullable: true })
  rejectionReason: string | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
