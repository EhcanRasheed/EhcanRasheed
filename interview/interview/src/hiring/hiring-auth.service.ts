import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { HiringUser } from './entity/hiring-user.entity';
import { HiringPaymentRequest, HiringPaymentStatus } from './entity/hiring-payment.entity';
import { HiringUserSession } from './entity/hiring-user-session.entity';

@Injectable()
export class HiringAuthService {
  constructor(
    @InjectRepository(HiringUser)
    private readonly hiringUserRepo: Repository<HiringUser>,
    @InjectRepository(HiringPaymentRequest)
    private readonly paymentRepo: Repository<HiringPaymentRequest>,
    @InjectRepository(HiringUserSession)
    private readonly sessionRepo: Repository<HiringUserSession>,
    private readonly jwtService: JwtService,
  ) {}

  private validatePasswordOrThrow(password: string) {
    const pwd = (password ?? '').toString();
    const ok = pwd.length >= 7 && /[A-Za-z]/.test(pwd) && /\d/.test(pwd);
    if (!ok) {
      throw new BadRequestException(
        'Password must be at least 7 characters and include letters and numbers.',
      );
    }
  }

  private signTokens(user: HiringUser) {
    const payload = { sub: user.id, type: 'hiring' };

    const accessToken = this.jwtService.sign(payload, {
      secret: process.env.HIRING_JWT_SECRET || 'hiringsupersecretkey',
      expiresIn: '1h',
    });

    const refreshToken = this.jwtService.sign(payload, {
      secret: process.env.HIRING_JWT_REFRESH_SECRET || 'hiringrefreshkey',
      expiresIn: '7d',
    });

    return { accessToken, refreshToken };
  }

  /**
   * Register a new Hiring Ease user.
   * No OTP — admin approval is the verification step.
   */
  async register(dto: {
    fullName: string;
    email: string;
    password: string;
    companyName?: string;
    phoneNumber?: string;
  }) {
    const exists = await this.hiringUserRepo.findOne({ where: { email: dto.email } });
    if (exists) {
      throw new BadRequestException('Email already registered for Hiring Ease');
    }

    this.validatePasswordOrThrow(dto.password);

    const user = this.hiringUserRepo.create({
      fullName: dto.fullName,
      email: dto.email,
      companyName: dto.companyName || null,
      phoneNumber: dto.phoneNumber || null,
      passwordHash: await bcrypt.hash(dto.password, 10),
      isActive: false,
    });

    await this.hiringUserRepo.save(user);

    return {
      message: 'Registration successful. Please submit payment to activate your account.',
      userId: user.id,
    };
  }

  /**
   * Submit payment screenshot — creates a payment request for admin approval.
   */
  async submitPayment(
    userId: string,
    dto: { paymentMethod: string; screenshotBase64: string },
  ) {
    const user = await this.hiringUserRepo.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    if (user.isActive) {
      throw new BadRequestException('Account is already active');
    }

    // Check for existing pending request
    const pending = await this.paymentRepo.findOne({
      where: { hiringUser: { id: userId }, status: HiringPaymentStatus.PENDING },
    });
    if (pending) {
      throw new BadRequestException('You already have a pending payment request');
    }

    const pr = this.paymentRepo.create({
      hiringUser: user,
      paymentMethod: dto.paymentMethod,
      screenshotBase64: dto.screenshotBase64,
    });

    await this.paymentRepo.save(pr);

    return { message: 'Payment submitted. Awaiting admin approval.' };
  }

  /**
   * Login for Hiring Ease users — only if approved (isActive=true).
   */
  async login(dto: { email: string; password: string }, userAgent?: string) {
    const user = await this.hiringUserRepo.findOne({ where: { email: dto.email } });
    if (!user) throw new UnauthorizedException('Invalid credentials');

    const ok = await bcrypt.compare(dto.password, user.passwordHash || '');
    if (!ok) throw new UnauthorizedException('Invalid credentials');

    if (!user.isActive) {
      // Check if they have a pending payment
      const pending = await this.paymentRepo.findOne({
        where: { hiringUser: { id: user.id }, status: HiringPaymentStatus.PENDING },
      });
      if (pending) {
        throw new UnauthorizedException('Your account is pending admin approval. Please wait.');
      }
      // Check if rejected
      const rejected = await this.paymentRepo.findOne({
        where: { hiringUser: { id: user.id }, status: HiringPaymentStatus.REJECTED },
        order: { createdAt: 'DESC' },
      });
      if (rejected) {
        throw new UnauthorizedException('Your payment was rejected. Please submit a new payment request.');
      }
      throw new UnauthorizedException('Please submit payment to activate your account.');
    }

    const { accessToken, refreshToken } = this.signTokens(user);
    const hashedAccessToken = await bcrypt.hash(accessToken, 10);

    const session = this.sessionRepo.create({
      hiringUser: user,
      isActive: true,
      userAgent,
      refreshToken: await bcrypt.hash(refreshToken, 10),
      accessToken: hashedAccessToken,
    });
    await this.sessionRepo.save(session);

    return { accessToken, refreshToken };
  }

  /**
   * Logout — deactivate all sessions.
   */
  async logoutAll(userId: string) {
    const sessions = await this.sessionRepo.find({
      where: { hiringUser: { id: userId } },
    });
    if (sessions.length === 0) {
      return { message: 'No active sessions found.' };
    }
    for (const s of sessions) {
      s.isActive = false;
    }
    await this.sessionRepo.save(sessions);
    return { message: 'Logged out from all sessions.' };
  }

  /**
   * Get current hiring user info.
   */
  async getMe(userId: string) {
    const user = await this.hiringUserRepo.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');
    return {
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      companyName: user.companyName,
      phoneNumber: user.phoneNumber,
      isActive: user.isActive,
    };
  }

  /**
   * Get payment status for a user (for registration flow).
   */
  async getPaymentStatus(userId: string) {
    const pending = await this.paymentRepo.findOne({
      where: { hiringUser: { id: userId }, status: HiringPaymentStatus.PENDING },
      order: { createdAt: 'DESC' },
    });
    const approved = await this.paymentRepo.findOne({
      where: { hiringUser: { id: userId }, status: HiringPaymentStatus.APPROVED },
      order: { createdAt: 'DESC' },
    });
    const rejected = await this.paymentRepo.findOne({
      where: { hiringUser: { id: userId }, status: HiringPaymentStatus.REJECTED },
      order: { createdAt: 'DESC' },
    });
    return {
      hasPending: !!pending,
      isApproved: !!approved,
      isRejected: !!rejected,
      rejectionReason: rejected?.rejectionReason || null,
    };
  }

  // ───── Admin Methods ─────

  async getAllHiringPayments() {
    return this.paymentRepo.find({
      relations: ['hiringUser'],
      order: { createdAt: 'DESC' },
    });
  }

  async approveHiringPayment(id: number) {
    const pr = await this.paymentRepo.findOne({
      where: { id },
      relations: ['hiringUser'],
    });
    if (!pr) throw new NotFoundException('Payment request not found');

    pr.status = HiringPaymentStatus.APPROVED;
    await this.paymentRepo.save(pr);

    // Activate the hiring user
    const user = await this.hiringUserRepo.findOne({ where: { id: pr.hiringUser.id } });
    if (user) {
      user.isActive = true;
      await this.hiringUserRepo.save(user);
    }

    return pr;
  }

  async rejectHiringPayment(id: number, reason?: string) {
    const pr = await this.paymentRepo.findOne({ where: { id } });
    if (!pr) throw new NotFoundException('Payment request not found');

    pr.status = HiringPaymentStatus.REJECTED;
    pr.rejectionReason = reason || null;
    return this.paymentRepo.save(pr);
  }

  async deleteHiringPayment(id: number) {
    const pr = await this.paymentRepo.findOne({ where: { id } });
    if (!pr) throw new NotFoundException('Payment request not found');
    return this.paymentRepo.remove(pr);
  }

  async getAllHiringUsers() {
    return this.hiringUserRepo.find({ order: { createdAt: 'DESC' } });
  }

  async deleteHiringUser(id: string) {
    const user = await this.hiringUserRepo.findOne({ where: { id } });
    if (!user) throw new NotFoundException('Hiring user not found');
    await this.hiringUserRepo.remove(user);
    return { message: 'Hiring user deleted' };
  }
}
