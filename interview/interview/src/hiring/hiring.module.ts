import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';

// Entities
import { HiringUser } from './entity/hiring-user.entity';
import { HiringPaymentRequest } from './entity/hiring-payment.entity';
import { HiringUserSession } from './entity/hiring-user-session.entity';
import { HiringSession } from './entity/hiring-session.entity';
import { HiringCandidate } from './entity/hiring-candidate.entity';
import { QuestionBank } from '../question/entity/question-bank.entity';
import { Question } from '../question/entity/question.entity';
import { Session } from '../auth/entity/session.entity';

// Services
import { HiringAuthService } from './hiring-auth.service';
import { HiringSessionService } from './hiring-session.service';
import { MailService } from '../mail/mail.service';

// Controllers
import { HiringAuthController } from './hiring-auth.controller';
import { HiringController } from './hiring.controller';
import { HiringPublicController } from './hiring-public.controller';
import { HiringAdminController } from './hiring-admin.controller';

// Guards & Strategy
import { HiringJwtStrategy } from './guards/hiring-jwt.strategy';

@Module({
  imports: [
    ConfigModule,
    ScheduleModule.forRoot(),
    TypeOrmModule.forFeature([
      HiringUser,
      HiringPaymentRequest,
      HiringUserSession,
      HiringSession,
      HiringCandidate,
      QuestionBank,
      Question,
      Session,
    ]),
    PassportModule.register({ defaultStrategy: 'hiring-jwt' }),
    JwtModule.register({
      secret: process.env.HIRING_JWT_SECRET || 'hiringsupersecretkey',
      signOptions: { expiresIn: '1h' },
    }),
  ],
  controllers: [
    HiringAuthController,
    HiringController,
    HiringPublicController,
    HiringAdminController,
  ],
  providers: [
    HiringAuthService,
    HiringSessionService,
    HiringJwtStrategy,
    MailService,
  ],
  exports: [HiringAuthService, HiringSessionService],
})
export class HiringModule {}
