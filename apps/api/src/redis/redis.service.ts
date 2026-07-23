import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleDestroy {
  private readonly logger = new Logger(RedisService.name);
  private readonly client: Redis;
  private isConnected = false;

  constructor(private configService: ConfigService) {
    this.client = new Redis(
      this.configService.get<string>('REDIS_URL', 'redis://localhost:6379'),
      {
        maxRetriesPerRequest: 3,
        enableOfflineQueue: false,
        retryStrategy(times: number) {
          if (times > 10) {
            return null; // Stop retrying after 10 attempts
          }
          const delay = Math.min(times * 500, 5000);
          return delay;
        },
      },
    );

    this.client.on('connect', () => {
      this.isConnected = true;
      this.logger.log('Redis connected successfully.');
    });

    this.client.on('error', (err) => {
      this.isConnected = false;
      this.logger.debug(`Redis error: ${err.message}`);
    });
  }

  async onModuleDestroy() {
    try {
      await this.client.quit();
    } catch {
      // Ignore disconnect errors
    }
  }

  getClient(): Redis {
    return this.client;
  }

  // ── Key-Value Operations ────────────────────

  async get(key: string): Promise<string | null> {
    try {
      return await this.client.get(key);
    } catch (error) {
      this.logger.debug(`Redis GET error for key ${key}: ${error}`);
      return null;
    }
  }

  async set(key: string, value: string, ttlSeconds?: number): Promise<void> {
    try {
      if (ttlSeconds) {
        await this.client.setex(key, ttlSeconds, value);
      } else {
        await this.client.set(key, value);
      }
    } catch (error) {
      this.logger.debug(`Redis SET error for key ${key}: ${error}`);
    }
  }

  async del(key: string): Promise<void> {
    try {
      await this.client.del(key);
    } catch (error) {
      this.logger.debug(`Redis DEL error for key ${key}: ${error}`);
    }
  }

  async exists(key: string): Promise<boolean> {
    try {
      const result = await this.client.exists(key);
      return result === 1;
    } catch {
      return false;
    }
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
    try {
      const key = `login_attempts:${identifier}`;
      const count = await this.client.incr(key);
      if (count === 1) {
        await this.client.expire(key, ttlSeconds);
      }
      return count;
    } catch (error) {
      this.logger.debug(`Redis INCR error for ${identifier}: ${error}`);
      return 1; // Fallback: allow attempt
    }
  }

  async resetLoginAttempts(identifier: string): Promise<void> {
    await this.del(`login_attempts:${identifier}`);
  }

  // ── Pattern-based cleanup ───────────────────

  async deleteByPattern(pattern: string): Promise<void> {
    try {
      const keys = await this.client.keys(pattern);
      if (keys.length > 0) {
        await this.client.del(...keys);
      }
    } catch (error) {
      this.logger.debug(`Redis deleteByPattern error for pattern ${pattern}: ${error}`);
    }
  }
}
