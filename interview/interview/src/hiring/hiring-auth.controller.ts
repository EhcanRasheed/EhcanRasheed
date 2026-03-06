import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { HiringAuthService } from './hiring-auth.service';
import { HiringJwtAuthGuard } from './guards/hiring-auth.guard';
import { CurrentHiringUser } from './guards/hiring-user.decorator';

@Controller('hiring-auth')
export class HiringAuthController {
  constructor(private readonly authService: HiringAuthService) {}

  @Post('register')
  async register(
    @Body()
    dto: {
      fullName: string;
      email: string;
      password: string;
      companyName?: string;
      phoneNumber?: string;
    },
  ) {
    return this.authService.register(dto);
  }

  @Post('submit-payment')
  async submitPayment(
    @Body()
    dto: {
      userId: string;
      paymentMethod: string;
      screenshotBase64: string;
    },
  ) {
    return this.authService.submitPayment(dto.userId, {
      paymentMethod: dto.paymentMethod,
      screenshotBase64: dto.screenshotBase64,
    });
  }

  @Get('payment-status')
  async getPaymentStatus(@Req() req: any) {
    const userId = req.query.userId;
    if (!userId) throw new BadRequestException('userId query parameter is required');
    return this.authService.getPaymentStatus(userId);
  }

  @HttpCode(HttpStatus.OK)
  @Post('login')
  async login(@Body() dto: { email: string; password: string }, @Req() req: any) {
    const ua = req.headers['user-agent'];
    return this.authService.login(dto, ua);
  }

  @UseGuards(HiringJwtAuthGuard)
  @Post('logout')
  async logout(@CurrentHiringUser() user: any) {
    return this.authService.logoutAll(user.id);
  }

  @UseGuards(HiringJwtAuthGuard)
  @Get('me')
  async me(@CurrentHiringUser() user: any) {
    const fullUser = await this.authService.getMe(user.id);
    return { user: fullUser };
  }
}
