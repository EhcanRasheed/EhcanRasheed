import { ForbiddenException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Profile } from '../profile/entity/profile.entity';
import { getLimits } from './tier-limits';

export type UsageFeature = 'interviews' | 'resumes' | 'chatbot';

const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

@Injectable()
export class UsageService {
  constructor(
    @InjectRepository(Profile)
    private readonly profileRepo: Repository<Profile>,
  ) {}

  private isResetDue(resetAt: Date | null): boolean {
    if (!resetAt) return true;
    return Date.now() - new Date(resetAt).getTime() >= THIRTY_DAYS_MS;
  }

  private async loadAndMaybeReset(userId: number): Promise<Profile> {
    const user = await this.profileRepo.findOne({ where: { id: userId } });
    if (!user) throw new ForbiddenException('User not found');
    if (this.isResetDue(user.usageResetAt)) {
      user.interviewsThisMonth = 0;
      user.resumesThisMonth = 0;
      user.chatbotMessagesThisMonth = 0;
      user.usageResetAt = new Date();
      await this.profileRepo.save(user);
    }
    return user;
  }

  async checkAndIncrement(userId: number, feature: UsageFeature): Promise<void> {
    const user = await this.loadAndMaybeReset(userId);
    const limits = getLimits(user.tier);
    const limit = limits[feature];
    const used =
      feature === 'interviews' ? user.interviewsThisMonth :
      feature === 'resumes'    ? user.resumesThisMonth    :
                                 user.chatbotMessagesThisMonth;

    if (limit !== -1 && used >= limit) {
      throw new ForbiddenException(
        `Monthly ${feature} limit reached (${limit}/${limit}). Upgrade your plan to continue.`,
      );
    }

    if (feature === 'interviews') user.interviewsThisMonth++;
    if (feature === 'resumes')    user.resumesThisMonth++;
    if (feature === 'chatbot')    user.chatbotMessagesThisMonth++;
    await this.profileRepo.save(user);
  }

  async getUsage(userId: number) {
    const user = await this.loadAndMaybeReset(userId);
    const limits = getLimits(user.tier);
    return {
      tier: user.tier,
      usage: {
        interviews: { used: user.interviewsThisMonth, limit: limits.interviews === -1 ? null : limits.interviews },
        resumes:    { used: user.resumesThisMonth,    limit: limits.resumes    === -1 ? null : limits.resumes    },
        chatbot:    { used: user.chatbotMessagesThisMonth, limit: limits.chatbot === -1 ? null : limits.chatbot },
      },
    };
  }
}
