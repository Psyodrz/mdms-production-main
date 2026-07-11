import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';

@Injectable()
export class SystemService {
  private readonly logger = new Logger(SystemService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService
  ) {}

  // -- Feature Flags --
  async getFeatureFlags() {
    return this.prisma.featureFlag.findMany({ orderBy: { key: 'asc' } });
  }

  async getFeatureFlag(key: string) {
    const cached = await this.redis.get(`flag:${key}`);
    if (cached) return JSON.parse(cached);

    const flag = await this.prisma.featureFlag.findUnique({ where: { key } });
    if (flag) {
      await this.redis.set(`flag:${key}`, JSON.stringify(flag), 300); // 5 min cache
    }
    return flag;
  }

  async upsertFeatureFlag(key: string, data: any) {
    const flag = await this.prisma.featureFlag.upsert({
      where: { key },
      update: data,
      create: { key, ...data }
    });
    await this.redis.del(`flag:${key}`);
    return flag;
  }

  // -- System Configs --
  async getSystemConfigs() {
    return this.prisma.systemConfig.findMany({ orderBy: { key: 'asc' } });
  }

  async getSystemConfig(key: string) {
    const cached = await this.redis.get(`config:${key}`);
    if (cached) return cached;

    const config = await this.prisma.systemConfig.findUnique({ where: { key } });
    if (config) {
      await this.redis.set(`config:${key}`, config.value, 600); // 10 min cache
    }
    return config?.value || null;
  }

  async upsertSystemConfig(key: string, value: string, type: string = 'string') {
    const config = await this.prisma.systemConfig.upsert({
      where: { key },
      update: { value, type },
      create: { key, value, type }
    });
    await this.redis.del(`config:${key}`);
    return config;
  }

  // -- Working Hours --
  async getWorkingHours() {
    return this.prisma.workingHours.findMany({ orderBy: { dayOfWeek: 'asc' } });
  }

  async upsertWorkingHours(dayOfWeek: number, data: { startTime: string; endTime: string; isWorking?: boolean }) {
    return this.prisma.workingHours.upsert({
      where: { dayOfWeek },
      update: data,
      create: { dayOfWeek, ...data }
    });
  }

  // -- Blocked Dates --
  async getBlockedDates() {
    return this.prisma.blockedDate.findMany({ orderBy: { date: 'asc' } });
  }

  async addBlockedDate(dateStr: string, reason?: string) {
    const date = new Date(dateStr);
    return this.prisma.blockedDate.upsert({
      where: { date },
      update: { reason },
      create: { date, reason }
    });
  }

  async removeBlockedDate(id: string) {
    return this.prisma.blockedDate.delete({ where: { id } });
  }
}
