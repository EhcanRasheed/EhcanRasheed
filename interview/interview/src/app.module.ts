// src/app.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { AuthModule } from './auth/auth.module';
import { UserModule } from './profile/profile.module';
import { QuestionModule } from './question/question.module';
import { ProgressModule } from './progress/progress.module';
import { ResumeModule } from './resume/resume.module';
import { MailModule } from './mail/mail.module';
import { InterviewModule } from './interview/interview.module';
import { AnswerModule } from './answer/answer.module';
import { ChatbotModule } from './chatbot/chatbot.module'; // ✅ Chatbot Added
import { AdminModule } from './admin/admin.module'; // ✅ Admin Added

@Module({
  imports: [
    // 1. Load .env FIRST and make it Global
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    // 2. TypeORM Connection with your custom fixes
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const dbUrl = config.get<string>('DATABASE_URL');
        if (dbUrl) {
          // Render / production: parse the connection string
          const url = new URL(dbUrl);
          return {
            type: 'postgres' as const,
            host: url.hostname,
            port: Number(url.port) || 5432,
            username: url.username,
            password: url.password,
            database: url.pathname.replace('/', ''),
            entities: [__dirname + '/**/*.entity{.ts,.js}'],
            synchronize: true,
            ssl: { rejectUnauthorized: false },
          };
        }
        // Local development
        return {
          type: 'postgres' as const,
          host: config.get<string>('DB_HOST') || '127.0.0.1',
          port: Number(config.get<number>('DB_PORT')) || 5432,
          username: config.get<string>('DB_USERNAME'),
          password: config.get<string>('DB_PASSWORD'),
          database: config.get<string>('DB_DATABASE'),
          entities: [__dirname + '/**/*.entity{.ts,.js}'],
          synchronize: true,
          ssl: false,
          extra: {
            family: 4,
          },
        };
      },
    }),

    // 3. Feature Modules
    AuthModule,
    UserModule,
    QuestionModule,
    ProgressModule,
    ResumeModule,
    MailModule,
    InterviewModule,
    AnswerModule,
    ChatbotModule, // ✅ Registered Chatbot
    AdminModule,   // ✅ Registered Admin
  ],
})
export class AppModule {}