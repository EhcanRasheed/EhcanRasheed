import { IsEmail, IsString, MinLength, Matches } from 'class-validator';
export class LoginDto {
@IsEmail() email: string;
@IsString()
@MinLength(7, {
  message: 'Password must be at least 7 characters and include letters and numbers.',
})
@Matches(/^(?=.*[A-Za-z])(?=.*\d).+$/, {
  message: 'Password must include letters and numbers for security.',
})
password: string;
}