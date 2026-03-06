import { Injectable, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ModuleRef } from '@nestjs/core';
import { HiringUserSession } from '../entity/hiring-user-session.entity';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class HiringJwtAuthGuard extends AuthGuard('hiring-jwt') {
  private sessionRepo: Repository<HiringUserSession>;

  constructor(private moduleRef: ModuleRef) {
    super();
  }

  async canActivate(context: ExecutionContext) {
    try {
      const result = (await super.canActivate(context)) as boolean;
      if (!result) return false;

      if (!this.sessionRepo) {
        this.sessionRepo = this.moduleRef.get('HiringUserSessionRepository', { strict: false });
        if (!this.sessionRepo) {
          throw new UnauthorizedException('Session repository not available');
        }
      }

      const request = context.switchToHttp().getRequest();
      const user = request.user;
      const authHeader = request.headers['authorization'];
      const token = authHeader?.split(' ')[1];

      if (!user || !token) throw new UnauthorizedException('Token missing');

      const sessions = await this.sessionRepo.find({
        where: { hiringUser: { id: user.id }, isActive: true },
      });

      if (!sessions || sessions.length === 0) {
        throw new UnauthorizedException('Session expired');
      }

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
