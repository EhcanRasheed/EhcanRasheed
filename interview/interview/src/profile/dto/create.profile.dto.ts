import { IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';
// import { Role } from '../entity/profile.entity';

export class CreateProfileDto {
  @IsString()
  @IsNotEmpty()
  fullName: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @MinLength(8)
  password: string;

//   @IsEnum(Role)
//   role: Role;

  @IsString()
  @IsOptional()
  phoneNumber?: string;
  
  isActive?: boolean;


}