import {
  Controller,
  Post,
  Get,
  Body,
  UseGuards,
  Patch,
  Delete,
  Param,
  ParseIntPipe,
} from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/user.decorator';
import { AdminService } from './admin.service';

@Controller('payments')
export class PaymentController {
  constructor(private readonly adminService: AdminService) {}

  // User checks their own approved tier + any pending request
  @Get('my-status')
  @UseGuards(JwtAuthGuard)
  async getMyStatus(@CurrentUser() user: any) {
    return this.adminService.getUserApprovedTierAndPending(user.id);
  }

  // User submits a payment proof
  @Post('submit')
  @UseGuards(JwtAuthGuard)
  async submitPayment(
    @CurrentUser() user: any,
    @Body() dto: { requestedTier: string; paymentMethod: string; screenshotBase64: string },
  ) {
    return this.adminService.submitPaymentRequest(user.id, user.email, dto);
  }

  // Admin gets all payment proofs
  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async getAllPayments() {
    return this.adminService.getAllPayments();
  }

  // Admin approves payment and upgrades tier
  @Patch(':id/approve')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async approvePayment(@Param('id', ParseIntPipe) id: number) {
    return this.adminService.approvePayment(id);
  }

  // Admin rejects payment
  @Patch(':id/reject')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async rejectPayment(@Param('id', ParseIntPipe) id: number) {
    return this.adminService.rejectPayment(id);
  }

  // Admin deletes payment
  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async deletePayment(@Param('id', ParseIntPipe) id: number) {
    return this.adminService.deletePayment(id);
  }
}
