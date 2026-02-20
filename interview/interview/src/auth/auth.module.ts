import { JwtModule } from '@nestjs/jwt';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthService } from './auth.service';
import { Session } from './entity/session.entity';
import { Profile } from '../profile/entity/profile.entity';
import { MailService } from '../mail/mail.service';
import { AuthController } from './auth.controller';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './jwt.strategy';


@Module({
  imports: [
  TypeOrmModule.forFeature([Session, Profile]),
  PassportModule.register({ defaultStrategy: 'jwt' }), // <-- add this
  JwtModule.register({
    secret: process.env.JWT_SECRET || 'defaultSecret',
    signOptions: { expiresIn: '1h' },
  }),
],

  controllers: [AuthController],
  providers: [AuthService, MailService, JwtStrategy],
  exports: [AuthService],
})
export class AuthModule {}
