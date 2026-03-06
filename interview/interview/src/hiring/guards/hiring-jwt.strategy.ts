import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HiringUser } from '../entity/hiring-user.entity';

@Injectable()
export class HiringJwtStrategy extends PassportStrategy(Strategy, 'hiring-jwt') {
  constructor(
    @InjectRepository(HiringUser)
    private readonly hiringUserRepo: Repository<HiringUser>,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.HIRING_JWT_SECRET || 'hiringsupersecretkey',
    });
  }

  async validate(payload: { sub: string }) {
    const user = await this.hiringUserRepo.findOne({
      where: { id: payload.sub },
    });

    if (!user) {
      throw new UnauthorizedException('Hiring user no longer exists');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('Account not yet approved');
    }

    return {
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      companyName: user.companyName,
      role: 'hiring-user',
    };
  }
}
