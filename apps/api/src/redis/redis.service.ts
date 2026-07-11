import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleDestroy {
  private readonly client: Redis;

  constructor(private configService: ConfigService) {
    this.client = new Redis(
      this.configService.get<string>('REDIS_URL', 'redis://localhost:6379'),
      {
        maxRetriesPerRequest: 3,
        retryStrategy(times: number) {
          const delay = Math.min(times * 50, 2000);
          return delay;
        },
      },
    );
  }

  async onModuleDestroy() {
    await this.client.quit();
  }

  getClient(): Redis {
    return this.client;
  }

  // ── Key-Value Operations ────────────────────

  async get(key: string): Promise<string | null> {
    return this.client.get(key);
  }

  async set(key: string, value: string, ttlSeconds?: number): Promise<void> {
    if (ttlSeconds) {
      await this.client.setex(key, ttlSeconds, value);
    } else {
      await this.client.set(key, value);
    }
  }

  async del(key: string): Promise<void> {
    await this.client.del(key);
  }

  async exists(key: string): Promise<boolean> {
    const result = await this.client.exists(key);
    return result === 1;
  }

  // ── JSON helpers ────────────────────────────

  async getJson<T>(key: string): Promise<T | null> {
    const data = await this.get(key);
    if (!data) return null;
    try {
      return JSON.parse(data) as T;
    } catch {
      return null;
    }
  }

  async setJson<T>(key: string, value: T, ttlSeconds?: number): Promise<void> {
    await this.set(key, JSON.stringify(value), ttlSeconds);
  }

  // ── Session / OTP helpers ───────────────────

  async setOtp(identifier: string, otp: string, ttlSeconds = 300): Promise<void> {
    await this.set(`otp:${identifier}`, otp, ttlSeconds);
  }

  async getOtp(identifier: string): Promise<string | null> {
    return this.get(`otp:${identifier}`);
  }

  async deleteOtp(identifier: string): Promise<void> {
    await this.del(`otp:${identifier}`);
  }

  // ── Rate limiting helpers ───────────────────

  async incrementLoginAttempts(identifier: string, ttlSeconds = 900): Promise<number> {
    const key = `login_attempts:${identifier}`;
    const count = await this.client.incr(key);
    if (count === 1) {
      await this.client.expire(key, ttlSeconds);
    }
    return count;
  }

  async resetLoginAttempts(identifier: string): Promise<void> {
    await this.del(`login_attempts:${identifier}`);
  }

  // ── Pattern-based cleanup ───────────────────

  async deleteByPattern(pattern: string): Promise<void> {
    const keys = await this.client.keys(pattern);
    if (keys.length > 0) {
      await this.client.del(...keys);
    }
  }
}
