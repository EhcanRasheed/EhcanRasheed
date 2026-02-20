import { 
  BadRequestException, 
  Body, 
  Controller, 
  Get, 
  HttpCode, 
  HttpStatus, 
  Post, 
  Req, 
  UseGuards 
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from '../common/guards/auth.guard';
import { CurrentUser } from '../common/decorators/user.decorator';

@Controller('auth') 
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(@Body() dto: RegisterDto) { 
    return this.authService.register(dto); 
  }

  // ✅ Verified OTP Endpoint to match the AuthService.verifyOtp method
  @HttpCode(HttpStatus.OK)
  @Post('verify-otp')
  async verifyOtp(@Body() body: { email: string; otp: string }) {
    if (!body.email || !body.otp) {
      throw new BadRequestException('Email and OTP are required');
    }
    return this.authService.verifyOtp(body.email, body.otp);
  }

  @HttpCode(HttpStatus.OK)
  @Post('login')
  async login(@Body() dto: LoginDto, @Req() req: any) {
    const ua = req.headers['user-agent'];
    return this.authService.login(dto, ua);
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  async logout(@CurrentUser() user: any) { 
    return this.authService.logoutAll(user.id); 
  }

  @Post('forgot-password')
  async forgot(@Body('email') email: string) {
    return this.authService.forgotPassword(email);
  }

  @Post('reset-password')
  async reset(@Body() body: { token: string; newPassword: string }) {
    const { token, newPassword } = body;
    if (!token || !newPassword) {
      throw new BadRequestException('Token and new password are required');
    }
    return this.authService.resetPassword(token.trim(), newPassword);
  }

  @UseGuards(JwtAuthGuard)
  @Post('change-password')
  async changePassword(
    @CurrentUser() user: any, 
    @Body('currentPassword') currentPassword: string, 
    @Body('newPassword') newPassword: string
  ) {
    return this.authService.changePassword(user.id, currentPassword, newPassword);
  }

  @UseGuards(JwtAuthGuard)
  @Post('change-username')
  async changeUsername(
    @CurrentUser() user: any,
    @Body('newUsername') newUsername: string
  ) {
    if (!newUsername || typeof newUsername !== 'string') {
      throw new BadRequestException('New username is required');
    }
    return this.authService.changeUsername(user.id, newUsername.trim());
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async me(@CurrentUser() user: any) { 
    return { user }; 
  }
}