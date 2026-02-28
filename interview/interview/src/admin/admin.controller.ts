import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../common/guards/auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/user.decorator';

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  // ───────────── User Management ─────────────

  @Get('users')
  async getAllUsers() {
    return this.adminService.getAllUsers();
  }

  @Patch('users/:id')
  async updateUser(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: { fullName?: string; email?: string; password?: string; role?: string },
  ) {
    return this.adminService.updateUser(id, dto);
  }

  @Delete('users/:id')
  async deleteUser(@Param('id', ParseIntPipe) id: number) {
    return this.adminService.deleteUser(id);
  }

  // ───────────── Question Bank Management ─────────────

  @Get('banks')
  async getAllBanks() {
    return this.adminService.getAllBanks();
  }

  @Get('feedback/counts')
  async getAllBankFeedbackCounts() {
    return this.adminService.getAllBankFeedbackCounts();
  }

  @Get('banks/:id/feedback')
  async getBankFeedback(@Param('id') id: string) {
    return this.adminService.getBankFeedback(id);
  }

  @Get('banks/:id')
  async getBankById(@Param('id') id: string) {
    return this.adminService.getBankById(id);
  }

  @Post('banks')
  async createBank(
    @CurrentUser() user: any,
    @Body() dto: { name: string; description?: string; category?: string },
  ) {
    return this.adminService.createBank(user.id, dto);
  }

  /** Create bank + upload questions in one step (name + category + JSON questions) */
  @Post('banks/create-with-questions')
  async createBankWithQuestions(
    @CurrentUser() user: any,
    @Body() dto: { name: string; category: string; questions: Array<{ question: string; difficulty?: string; category?: string }> },
  ) {
    return this.adminService.createBankWithQuestions(user.id, dto.name, dto.category || 'General', dto.questions);
  }

  @Patch('banks/:id/toggle-publish')
  async togglePublishBank(@Param('id') id: string) {
    return this.adminService.togglePublishBank(id);
  }

  @Patch('banks/:id')
  async updateBank(
    @Param('id') id: string,
    @Body() dto: { name?: string; description?: string; category?: string },
  ) {
    return this.adminService.updateBank(id, dto);
  }

  @Delete('banks/:id')
  async deleteBank(@Param('id') id: string) {
    return this.adminService.deleteBank(id);
  }

  /** Bulk upload questions to a specific bank */
  @Post('banks/:id/questions')
  async bulkUploadQuestions(
    @Param('id') id: string,
    @Body() body: { questions: Array<{ text: string; category?: string; subcategory?: string; difficulty?: string }> },
  ) {
    return this.adminService.bulkUploadQuestions(id, body.questions);
  }

  @Patch('questions/:id')
  async updateQuestion(
    @Param('id') id: string,
    @Body() dto: { text?: string; category?: string; subcategory?: string; difficulty?: string },
  ) {
    return this.adminService.updateQuestion(id, dto);
  }

  @Delete('questions/:id')
  async deleteQuestion(@Param('id') id: string) {
    return this.adminService.deleteQuestion(id);
  }
}
