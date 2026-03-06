import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Profile } from '../profile/entity/profile.entity';
import { UsageService } from './usage.service';

@Module({
  imports: [TypeOrmModule.forFeature([Profile])],
  providers: [UsageService],
  exports: [UsageService],
})
export class UsageModule {}
