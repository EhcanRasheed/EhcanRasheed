import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Profile } from '../profile/entity/profile.entity';
import { QuestionBank } from '../question/entity/question-bank.entity';
import { Question } from '../question/entity/question.entity';
import { BankFeedback } from '../question/entity/bank-feedback.entity';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(Profile)
    private readonly profileRepo: Repository<Profile>,
    @InjectRepository(QuestionBank)
    private readonly bankRepo: Repository<QuestionBank>,
    @InjectRepository(Question)
    private readonly questionRepo: Repository<Question>,
    @InjectRepository(BankFeedback)
    private readonly feedbackRepo: Repository<BankFeedback>,
  ) {}

  // ───────────── User Management ─────────────

  async getAllUsers() {
    const users = await this.profileRepo.find({
      order: { id: 'ASC' },
    });
    return users.map((u) => ({
      id: u.id,
      fullName: u.fullName,
      email: u.email,
      phoneNumber: u.phoneNumber,
      role: u.role,
      isActive: u.isActive,
    }));
  }

  async updateUser(
    userId: number,
    dto: { fullName?: string; email?: string; password?: string; role?: string },
  ) {
    const user = await this.profileRepo.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    if (dto.fullName) user.fullName = dto.fullName;
    if (dto.email) {
      const existing = await this.profileRepo.findOne({ where: { email: dto.email } });
      if (existing && existing.id !== userId) {
        throw new BadRequestException('Email already in use');
      }
      user.email = dto.email;
    }
    if (dto.password) {
      user.passwordHash = await bcrypt.hash(dto.password, 10);
    }
    if (dto.role && ['user', 'admin'].includes(dto.role)) {
      user.role = dto.role;
    }

    await this.profileRepo.save(user);
    return {
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      role: user.role,
      isActive: user.isActive,
    };
  }

  async deleteUser(userId: number) {
    const user = await this.profileRepo.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');
    await this.profileRepo.remove(user);
    return { message: 'User deleted' };
  }

  // ───────────── Question Bank Management ─────────────

  async getAllBanks() {
    return this.bankRepo.find({
      relations: ['createdBy'],
      order: { createdAt: 'DESC' },
    });
  }

  async getBankById(bankId: string) {
    const bank = await this.bankRepo.findOne({
      where: { id: bankId },
      relations: ['questions', 'createdBy'],
    });
    if (!bank) throw new NotFoundException('Question Bank not found');
    // Sort questions by orderIndex
    if (bank.questions) {
      bank.questions.sort((a, b) => a.orderIndex - b.orderIndex);
    }
    return bank;
  }

  async createBank(
    adminId: number,
    dto: { name: string; description?: string; category?: string },
  ) {
    const bank = this.bankRepo.create({
      name: dto.name,
      description: dto.description || '',
      category: dto.category || 'General',
      createdBy: { id: adminId } as Profile,
    });
    return this.bankRepo.save(bank);
  }

  /**
   * Create a bank and upload questions in a single step.
   * Category & description are auto-derived from the questions.
   */
  async createBankWithQuestions(
    adminId: number,
    name: string,
    category: string,
    questionsData: Array<{
      question: string;
      difficulty?: string;
      category?: string;
    }>,
  ) {
    if (!questionsData || questionsData.length === 0) {
      throw new BadRequestException('At least one question is required');
    }

    // Auto-derive description only (category comes from admin dropdown)
    const { description } = this.deriveMetadata(questionsData);

    const bank = this.bankRepo.create({
      name,
      description,
      category,
      isPublished: false,
      createdBy: { id: adminId } as Profile,
    });
    const savedBank = await this.bankRepo.save(bank);

    // Create questions
    const questions = questionsData.map((q, i) =>
      this.questionRepo.create({
        text: q.question,
        category: q.category || 'General',
        difficulty: q.difficulty || 'medium',
        orderIndex: i,
        bank: savedBank,
      }),
    );
    await this.questionRepo.save(questions);

    return {
      ...savedBank,
      questionsUploaded: questions.length,
      derivedCategory: category,
      derivedDescription: description,
    };
  }

  /**
   * Derive category & description from a list of questions.
   */
  private deriveMetadata(
    questionsData: Array<{ question?: string; difficulty?: string; category?: string }>,
  ) {
    // Count difficulties
    const diffCounts: Record<string, number> = { easy: 0, medium: 0, hard: 0 };
    const catCounts: Record<string, number> = {};

    for (const q of questionsData) {
      const d = (q.difficulty || 'medium').toLowerCase();
      diffCounts[d] = (diffCounts[d] || 0) + 1;
      const c = q.category || 'General';
      catCounts[c] = (catCounts[c] || 0) + 1;
    }

    // Category: most frequent, or "Mixed" if multiple
    const catEntries = Object.entries(catCounts).sort((a, b) => b[1] - a[1]);
    let category = 'General';
    if (catEntries.length === 1) {
      category = catEntries[0][0];
    } else if (catEntries.length > 1) {
      // If top category has >60% of questions, use it; otherwise "Mixed"
      const topPct = catEntries[0][1] / questionsData.length;
      category = topPct > 0.6 ? catEntries[0][0] : 'Mixed';
    }

    // Description: auto-generated summary
    const total = questionsData.length;
    const diffParts: string[] = [];
    if (diffCounts.easy > 0) diffParts.push(`${diffCounts.easy} Easy`);
    if (diffCounts.medium > 0) diffParts.push(`${diffCounts.medium} Medium`);
    if (diffCounts.hard > 0) diffParts.push(`${diffCounts.hard} Hard`);

    const uniqueCats = catEntries.map((e) => e[0]).slice(0, 4);
    const description = `${total} questions — ${diffParts.join(', ')} • ${uniqueCats.join(', ')}`;

    return { category, description };
  }

  async updateBank(
    bankId: string,
    dto: { name?: string; description?: string; category?: string },
  ) {
    const bank = await this.bankRepo.findOne({ where: { id: bankId } });
    if (!bank) throw new NotFoundException('Question Bank not found');
    if (dto.name) bank.name = dto.name;
    if (dto.description !== undefined) bank.description = dto.description;
    if (dto.category) bank.category = dto.category;
    return this.bankRepo.save(bank);
  }

  async togglePublishBank(bankId: string) {
    const bank = await this.bankRepo.findOne({ where: { id: bankId } });
    if (!bank) throw new NotFoundException('Question Bank not found');
    bank.isPublished = !bank.isPublished;
    await this.bankRepo.save(bank);
    return { message: bank.isPublished ? 'Bank published' : 'Bank unpublished', isPublished: bank.isPublished };
  }

  async deleteBank(bankId: string) {
    const bank = await this.bankRepo.findOne({ where: { id: bankId } });
    if (!bank) throw new NotFoundException('Question Bank not found');
    await this.bankRepo.remove(bank);
    return { message: 'Question Bank deleted' };
  }

  /**
   * Bulk upload questions from a JSON payload.
   * Expected format:
   * {
   *   "questions": [
   *     { "text": "...", "category": "Technical", "subcategory": "React", "difficulty": "medium" },
   *     ...
   *   ]
   * }
   */
  async bulkUploadQuestions(
    bankId: string,
    questionsData: Array<{
      text?: string;
      question?: string;
      category?: string;
      subcategory?: string;
      difficulty?: string;
    }>,
  ) {
    const bank = await this.bankRepo.findOne({
      where: { id: bankId },
      relations: ['questions'],
    });
    if (!bank) throw new NotFoundException('Question Bank not found');

    const startIndex = bank.questions?.length || 0;

    const questions = questionsData.map((q, i) =>
      this.questionRepo.create({
        text: q.text || q.question || '',
        category: q.category || bank.category || 'General',
        subcategory: q.subcategory || undefined,
        difficulty: q.difficulty || 'medium',
        orderIndex: startIndex + i,
        bank,
      }),
    );

    await this.questionRepo.save(questions);

    // Re-derive bank metadata from all questions now
    const allQuestions = await this.questionRepo.find({ where: { bank: { id: bankId } } });
    const { category, description } = this.deriveMetadata(
      allQuestions.map((q) => ({ question: q.text, difficulty: q.difficulty, category: q.category })),
    );
    bank.category = category;
    bank.description = description;
    await this.bankRepo.save(bank);

    return { message: `${questions.length} questions uploaded`, count: questions.length };
  }

  async deleteQuestion(questionId: string) {
    const question = await this.questionRepo.findOne({ where: { id: questionId } });
    if (!question) throw new NotFoundException('Question not found');
    await this.questionRepo.remove(question);
    return { message: 'Question deleted' };
  }

  async updateQuestion(
    questionId: string,
    dto: { text?: string; category?: string; subcategory?: string; difficulty?: string },
  ) {
    const question = await this.questionRepo.findOne({ where: { id: questionId } });
    if (!question) throw new NotFoundException('Question not found');
    if (dto.text) question.text = dto.text;
    if (dto.category) question.category = dto.category;
    if (dto.subcategory !== undefined) question.subcategory = dto.subcategory;
    if (dto.difficulty) question.difficulty = dto.difficulty;
    return this.questionRepo.save(question);
  }

  // ───────────── Bank Feedback (Admin View) ─────────────

  /** Get all feedback for a specific bank (admin view) */
  async getBankFeedback(bankId: string) {
    const feedbacks = await this.feedbackRepo.find({
      where: { bank: { id: bankId } },
      relations: ['user'],
      order: { createdAt: 'DESC' },
    });
    const count = feedbacks.length;
    const avgRating = count > 0
      ? Math.round((feedbacks.reduce((sum, f) => sum + f.rating, 0) / count) * 10) / 10
      : 0;
    return {
      count,
      avgRating,
      feedbacks: feedbacks.map((f) => ({
        id: f.id,
        rating: f.rating,
        comment: f.comment,
        userName: f.user?.fullName || f.user?.email || 'Anonymous',
        createdAt: f.createdAt,
      })),
    };
  }

  /** Get feedback counts for all banks (for sidebar badge) */
  async getAllBankFeedbackCounts() {
    const result = await this.feedbackRepo
      .createQueryBuilder('f')
      .select('f."bankId"', 'bankId')
      .addSelect('COUNT(*)', 'count')
      .addSelect('ROUND(AVG(f.rating)::numeric, 1)', 'avgRating')
      .groupBy('f."bankId"')
      .getRawMany();
    return result;
  }
}
