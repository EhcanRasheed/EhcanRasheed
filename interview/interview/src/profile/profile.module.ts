import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Profile } from './entity/profile.entity';
import { UserService } from './profile.service';
import { UserController } from './profile.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Profile])],
  providers: [UserService],
  controllers: [UserController],
  exports: [TypeOrmModule],
})
export class UserModule {}
