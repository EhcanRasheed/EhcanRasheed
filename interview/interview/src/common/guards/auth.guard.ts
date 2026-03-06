
import { Injectable, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ModuleRef } from '@nestjs/core';
import { Session } from '../../auth/entity/session.entity';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { getRepositoryToken } from '@nestjs/typeorm';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  private sessionRepo: Repository<Session>;

  constructor(private moduleRef: ModuleRef) {
    super();
  }

  async canActivate(context: ExecutionContext) {
  try {
    const result = (await super.canActivate(context)) as boolean;
    if (!result) return false;

    if (!this.sessionRepo) {
      try {
        this.sessionRepo = this.moduleRef.get(getRepositoryToken(Session) as string, { strict: false });
      } catch {
        throw new UnauthorizedException('Session repository not available');
      }
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const authHeader = request.headers['authorization'];
    const token = authHeader?.split(' ')[1];

    if (!user || !token) throw new UnauthorizedException('Token missing');

    // Fetch active sessions (newest first, limit 5 for performance)
    const sessions = await this.sessionRepo.find({
      where: { user: { id: user.id ?? user.sub }, isActive: true },
      order: { createdAt: 'DESC' },
      take: 5,
    });

    if (!sessions || sessions.length === 0) {
      throw new UnauthorizedException('Session expired');
    }

    // Check if the token matches any active session
    let match = false;
    for (const s of sessions) {
      if (s.accessToken && (await bcrypt.compare(token, s.accessToken))) {
        match = true;
        break;
      }
    }

    if (!match) {
      throw new UnauthorizedException('Token expired or invalid');
    }

    return true;
  } catch (error) {
    throw new UnauthorizedException(error.message || 'Unauthorized');
  }
}

}
