import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { Session } from './entity/session.entity';
import { Profile } from '../profile/entity/profile.entity';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { CreateAdminUserDto } from './dto/create-admin.dto';
import { MailService } from '../mail/mail.service';
export declare class AuthService {
    private readonly sessionRepo;
    private readonly profileRepo;
    private readonly jwtService;
    private readonly mail;
    constructor(sessionRepo: Repository<Session>, profileRepo: Repository<Profile>, jwtService: JwtService, mail: MailService);
    private signTokens;
    register(dto: RegisterDto): Promise<{
        message: string;
    }>;
    login(dto: LoginDto, userAgent?: string): Promise<{
        accessToken: string;
        refreshToken: string;
    }>;
    logout(userId: number, sessionId?: string): Promise<{
        message: string;
    }>;
    logoutAll(userId: number): Promise<{
        message: string;
    }>;
    createAdmin(dto: CreateAdminUserDto, _creatorId: string): Promise<{
        message: string;
        admin: {
            id: number;
            email: string;
        };
    }>;
    sendActivation(email: string): Promise<{
        message: string;
    }>;
    activate(token: string): Promise<{
        message: string;
    }>;
    forgotPassword(email: string): Promise<{
        message: string;
    }>;
    resetPassword(token: string, newPassword: string): Promise<{
        message: string;
    }>;
    changePassword(userId: string, currentPassword: string, newPassword: string): Promise<{
        message: string;
    }>;
}
