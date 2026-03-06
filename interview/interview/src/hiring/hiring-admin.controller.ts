import {
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Body,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { HiringAuthService } from './hiring-auth.service';

/**
 * Admin endpoints for managing Hiring Ease payments and users.
 * Uses the main app's admin auth (not hiring auth).
 */
@Controller('admin/hiring')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
export class HiringAdminController {
  constructor(private readonly hiringAuthService: HiringAuthService) {}

  // ───────────── Hiring Payment Management ─────────────

  @Get('payments')
  async getAllPayments() {
    return this.hiringAuthService.getAllHiringPayments();
  }

  @Patch('payments/:id/approve')
  async approvePayment(@Param('id', ParseIntPipe) id: number) {
    return this.hiringAuthService.approveHiringPayment(id);
  }

  @Patch('payments/:id/reject')
  async rejectPayment(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { reason?: string },
  ) {
    return this.hiringAuthService.rejectHiringPayment(id, body?.reason);
  }

  @Delete('payments/:id')
  async deletePayment(@Param('id', ParseIntPipe) id: number) {
    return this.hiringAuthService.deleteHiringPayment(id);
  }

  // ───────────── Hiring User Management ─────────────

  @Get('users')
  async getAllUsers() {
    return this.hiringAuthService.getAllHiringUsers();
  }

  @Delete('users/:id')
  async deleteUser(@Param('id') id: string) {
    return this.hiringAuthService.deleteHiringUser(id);
  }
}
