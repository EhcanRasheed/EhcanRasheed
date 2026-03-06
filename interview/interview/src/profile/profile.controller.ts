import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/auth.guard';
import { UsageService } from '../common/usage.service';

@Controller('user')
export class UserController {
  constructor(private readonly usageService: UsageService) {}

  @UseGuards(JwtAuthGuard)
  @Get('usage')
  async getUsage(@Req() req) {
    const userId = req.user.id ?? req.user.sub;
    return this.usageService.getUsage(userId);
  }
}
