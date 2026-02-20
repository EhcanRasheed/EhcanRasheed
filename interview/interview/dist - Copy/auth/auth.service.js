"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const bcrypt = __importStar(require("bcrypt"));
const jwt_1 = require("@nestjs/jwt");
const session_entity_1 = require("./entity/session.entity");
const profile_entity_1 = require("../profile/entity/profile.entity");
const mail_service_1 = require("../mail/mail.service");
const crypto_1 = require("crypto");
let AuthService = class AuthService {
    sessionRepo;
    profileRepo;
    jwtService;
    mail;
    constructor(sessionRepo, profileRepo, jwtService, mail) {
        this.sessionRepo = sessionRepo;
        this.profileRepo = profileRepo;
        this.jwtService = jwtService;
        this.mail = mail;
    }
    signTokens(user) {
        const payload = {
            sub: Number(user.id),
            role: user.role,
        };
        const accessToken = this.jwtService.sign(payload, {
            secret: process.env.JWT_SECRET || 'defaultSecret',
            expiresIn: (process.env.JWT_EXPIRES || '1h'),
        });
        const refreshToken = this.jwtService.sign(payload, {
            secret: process.env.JWT_REFRESH_SECRET || 'defaultRefreshSecret',
            expiresIn: (process.env.JWT_REFRESH_EXPIRES || '7d'),
        });
        return { accessToken, refreshToken };
    }
    async register(dto) {
        const exists = await this.profileRepo.findOne({
            where: { email: dto.email },
        });
        if (exists)
            throw new common_1.BadRequestException('Email already in use');
        const user = this.profileRepo.create({
            fullName: dto.fullName,
            email: dto.email,
            phoneNumber: dto.phoneNumber,
            role: dto.role || 'DOCTOR',
            passwordHash: await bcrypt.hash(dto.password, 10),
            isActive: true,
        });
        await this.profileRepo.save(user);
        return { message: 'Registered successfully. You can now log in.' };
    }
    async login(dto, userAgent) {
        const user = await this.profileRepo.findOne({
            where: { email: dto.email },
        });
        if (!user)
            throw new common_1.UnauthorizedException('Invalid credentials');
        const ok = await bcrypt.compare(dto.password, user.passwordHash || '');
        if (!ok)
            throw new common_1.UnauthorizedException('Invalid credentials. Try forgot password if needed.');
        if (!user.isActive)
            throw new common_1.UnauthorizedException('Account not activated yet');
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
    async logout(userId, sessionId) {
        if (sessionId) {
            await this.sessionRepo.delete({ id: sessionId });
        }
        else {
            await this.sessionRepo.delete({ user: { id: userId } });
        }
        return { message: 'Logout successful' };
    }
    async logoutAll(userId) {
        await this.sessionRepo.delete({ user: { id: userId } });
        return { message: 'Logged out from all sessions' };
    }
    async createAdmin(dto, _creatorId) {
        const exists = await this.profileRepo.findOne({
            where: { email: dto.email },
        });
        if (exists)
            throw new common_1.BadRequestException('Email already in use');
        const admin = this.profileRepo.create({
            fullName: dto.fullName,
            email: dto.email,
            phoneNumber: dto.phoneNumber,
            role: 'ADMIN',
            passwordHash: await bcrypt.hash(dto.password, 10),
            isActive: true,
        });
        await this.profileRepo.save(admin);
        return {
            message: 'Admin created',
            admin: { id: admin.id, email: admin.email },
        };
    }
    async sendActivation(email) {
        const user = await this.profileRepo.findOne({ where: { email } });
        if (!user)
            throw new common_1.NotFoundException('Email not registered');
        user.activationToken = (0, crypto_1.randomBytes)(32).toString('hex');
        await this.profileRepo.save(user);
        await this.mail.sendAccountActivation(user.email, user.fullName || user.email, `${process.env.FRONTEND_URL || 'http://localhost:5173'}/activate?token=${user.activationToken}`);
        return { message: 'Activation link sent' };
    }
    async activate(token) {
        const user = await this.profileRepo.findOne({
            where: { activationToken: token },
        });
        if (!user)
            throw new common_1.BadRequestException('Invalid activation token');
        user.isActive = true;
        user.activationToken = null;
        await this.profileRepo.save(user);
        return { message: 'Account activated. You can now log in.' };
    }
    async forgotPassword(email) {
        const user = await this.profileRepo.findOne({ where: { email } });
        if (!user)
            throw new common_1.NotFoundException('Email not registered');
        user.resetToken = (0, crypto_1.randomBytes)(32).toString('hex').trim();
        user.resetTokenExpiry = new Date(Date.now() + 1000 * 60 * 60);
        await this.profileRepo.save(user);
        await this.mail.sendPasswordReset(user.email, user.fullName || user.email, `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password?token=${user.resetToken}`);
        return { message: 'Password reset email sent' };
    }
    async resetPassword(token, newPassword) {
        const user = await this.profileRepo.findOne({ where: { resetToken: token.trim() } });
        if (!user)
            throw new common_1.BadRequestException('Invalid reset token');
        if (!user.resetTokenExpiry)
            throw new common_1.BadRequestException('Reset token expiry missing');
        if (user.resetTokenExpiry.getTime() < Date.now())
            throw new common_1.BadRequestException('Reset link is expired');
        user.passwordHash = await bcrypt.hash(newPassword, 10);
        user.resetToken = null;
        user.resetTokenExpiry = null;
        await this.profileRepo.save(user);
        return { message: 'Password updated successfully' };
    }
    async changePassword(userId, currentPassword, newPassword) {
        const user = await this.profileRepo.findOne({
            where: { id: Number(userId) },
        });
        if (!user)
            throw new common_1.NotFoundException('User not found');
        const ok = await bcrypt.compare(currentPassword, user.passwordHash || '');
        if (!ok)
            throw new common_1.BadRequestException('Current password is incorrect');
        user.passwordHash = await bcrypt.hash(newPassword, 10);
        await this.profileRepo.save(user);
        return { message: 'Password changed successfully!' };
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(session_entity_1.Session)),
    __param(1, (0, typeorm_1.InjectRepository)(profile_entity_1.Profile)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        jwt_1.JwtService,
        mail_service_1.MailService])
], AuthService);
//# sourceMappingURL=auth.service.js.map