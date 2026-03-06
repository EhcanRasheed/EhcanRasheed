import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ResumeService } from './resume.service';
import { ResumeController } from './resume.controller';
import { ResumeAnalysis } from './entity/resume-analysis.entity';
import { UsageModule } from '../common/usage.module';

@Module({
  imports: [ConfigModule, TypeOrmModule.forFeature([ResumeAnalysis]), UsageModule],
  providers: [ResumeService],
  controllers: [ResumeController],
})
export class ResumeModule {}
