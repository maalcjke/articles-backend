import { Injectable } from '@nestjs/common';
import { InjectRedis } from '@lib/redis/decorators/redis.decorator';
import Redis from 'ioredis';

@Injectable()
export class RedisHelperService {
  constructor(@InjectRedis() private readonly redis: Redis) {}

  async getOrSet<T>(
    key: string,
    ttl: number,
    fetcher: () => Promise<T>,
  ): Promise<T> {
    const cached = await this.redis.get(key);
    if (cached) {
      return JSON.parse(cached);
    }

    const data = await fetcher();
    await this.redis.set(key, JSON.stringify(data), 'EX', ttl);
    return data;
  }

  async del(key: string): Promise<void> {
    await this.redis.del(key);
  }
}
