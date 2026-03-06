import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Profile } from './entity/profile.entity';
import { UserService } from './profile.service';
import { UserController } from './profile.controller';
import { UsageModule } from '../common/usage.module';

@Module({
  imports: [TypeOrmModule.forFeature([Profile]), UsageModule],
  providers: [UserService],
  controllers: [UserController],
  exports: [TypeOrmModule],
})
export class UserModule {}
