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
import { Session } from './entity/session.entity';
import { Profile } from '../profile/entity/profile.entity';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { MailService } from '../mail/mail.service';
import { randomBytes } from 'crypto';
import { JwtPayload } from './interfaces/jwt-payload.interface';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(Session)
    private readonly sessionRepo: Repository<Session>,
    @InjectRepository(Profile)
    private readonly profileRepo: Repository<Profile>,
    private readonly jwtService: JwtService,
    private readonly mail: MailService,
  ) {}

  private validatePasswordOrThrow(password: string) {
    const pwd = (password ?? '').toString();
    const ok =
      pwd.length >= 7 &&
      /[A-Za-z]/.test(pwd) &&
      /\d/.test(pwd);

    if (!ok) {
      throw new BadRequestException(
        'Password must be at least 7 characters and include letters and numbers.',
      );
    }
  }

  private signTokens(user: Profile) {
    const payload: JwtPayload = { sub: Number(user.id) };
    
    const accessToken = this.jwtService.sign(payload, {
      secret: process.env.JWT_SECRET || 'supersecretkey',
      expiresIn: '1h',
    });
  
    const refreshToken = this.jwtService.sign(payload, {
      secret: process.env.JWT_REFRESH_SECRET || 'superrefreshkey',
      expiresIn: '7d',
    });
  
    return { accessToken, refreshToken };
  }

  async register(dto: RegisterDto) {
    const exists = await this.profileRepo.findOne({ where: { email: dto.email } });

    // If user already exists
    if (exists) {
      // Active account → block new registration
      if (exists.isActive) {
        throw new BadRequestException('Email already in use');
      }

      // Inactive account → regenerate OTP and update credentials
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      const otpExpires = new Date(Date.now() + 10 * 60000);

      exists.fullName = dto.fullName;
      // dto.phoneNumber is optional, so only overwrite if provided
      if (dto.phoneNumber !== undefined) {
        exists.phoneNumber = dto.phoneNumber;
      }
      this.validatePasswordOrThrow(dto.password);
      exists.passwordHash = await bcrypt.hash(dto.password, 10);
      exists.otp = otp;
      exists.otpExpires = otpExpires;

      await this.profileRepo.save(exists);
      await this.mail.sendOtpEmail(exists.email, exists.fullName, otp);

      return { message: 'We have sent you a new OTP.' };
    }

    // Fresh registration
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = new Date(Date.now() + 10 * 60000); 

    this.validatePasswordOrThrow(dto.password);
    const user = this.profileRepo.create({
      fullName: dto.fullName,
      email: dto.email,
      phoneNumber: dto.phoneNumber,
      passwordHash: await bcrypt.hash(dto.password, 10),
      isActive: false, 
      otp,
      otpExpires,
    });

    await this.profileRepo.save(user);
    await this.mail.sendOtpEmail(user.email, user.fullName, otp);

    return { message: 'Registration successful. Check your email for OTP.' };
  }

  async verifyOtp(email: string, userOtp: string) {
    const user = await this.profileRepo.findOne({ where: { email } });
    if (!user) throw new NotFoundException('User not found');
    if (!user.otpExpires || new Date() > user.otpExpires) throw new BadRequestException('OTP has expired');
    if (user.isActive) throw new BadRequestException('Account is already active');
    if (user.otp !== userOtp) throw new BadRequestException('Invalid OTP code');
  
    user.isActive = true;
    user.otp = null;
    user.otpExpires = null;
    await this.profileRepo.save(user);
  
    return { message: 'Email verified successfully.' };
  }

  async login(dto: LoginDto, userAgent?: string) {
    const user = await this.profileRepo.findOne({ where: { email: dto.email } });
    if (!user) throw new UnauthorizedException('Invalid credentials');

    const ok = await bcrypt.compare(dto.password, user.passwordHash || '');
    if (!ok) throw new UnauthorizedException('Invalid credentials');
    if (!user.isActive) throw new UnauthorizedException('Please verify your email.');

    const { accessToken, refreshToken } = this.signTokens(user);
    const hashedAccessToken = await bcrypt.hash(accessToken, 10);

    const session = this.sessionRepo.create({
      user,
      isActive: true,
      userAgent,
      refreshToken: await bcrypt.hash(refreshToken, 10),
      accessToken: hashedAccessToken,
    });

    await this.sessionRepo.save(session);
    return { accessToken, refreshToken };
  }

// auth.service.ts (Updated snippet)

async forgotPassword(email: string) {
  const user = await this.profileRepo.findOne({ where: { email } });
  if (!user) throw new NotFoundException('Email not registered');

  // Generate token
  const token = randomBytes(32).toString('hex');
  user.resetToken = token;
  user.resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour
  await this.profileRepo.save(user);

  // Pass the token only; MailService will construct the frontend URL
  await this.mail.sendPasswordReset(
    user.email,
    user.fullName || user.email,
    token
  );

  return { message: 'Password reset email sent' };
}

async resetPassword(token: string, newPassword: string) {
  // Use trim() to avoid whitespace issues
  const user = await this.profileRepo.findOne({ 
    where: { resetToken: token.trim() } 
  });
  
  if (!user || !user.resetTokenExpiry || user.resetTokenExpiry < new Date()) {
    throw new BadRequestException('Reset link is invalid or expired');
  }
  this.validatePasswordOrThrow(newPassword);
  user.passwordHash = await bcrypt.hash(newPassword, 10);
  user.resetToken = null;
  user.resetTokenExpiry = null;

  await this.profileRepo.save(user);
  return { message: 'Password updated successfully' };
}

  async logoutAll(userId: number) {
    const sessions = await this.sessionRepo.find({ where: { user: { id: userId } } });
    if (!sessions || sessions.length === 0) {
      return { message: 'No active sessions found.' };
    }
    for (const s of sessions) {
      s.isActive = false;
    }
    await this.sessionRepo.save(sessions);
    return { message: 'Logged out from all sessions.' };
  }

  async changePassword(userId: number, currentPassword: string, newPassword: string) {
    const user = await this.profileRepo.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    const ok = await bcrypt.compare(currentPassword || '', user.passwordHash || '');
    if (!ok) throw new BadRequestException('Current password is incorrect');

    this.validatePasswordOrThrow(newPassword);
    user.passwordHash = await bcrypt.hash(newPassword, 10);
    await this.profileRepo.save(user);
    return { message: 'Password changed successfully' };
  }
  async changeUsername(userId: number, newFullName: string) {
    const user = await this.profileRepo.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');
    user.fullName = newFullName.trim();
    await this.profileRepo.save(user);
    return { message: 'Username updated successfully.', user };
  }
}