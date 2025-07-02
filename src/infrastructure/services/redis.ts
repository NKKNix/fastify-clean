import Redis from 'ioredis';
import { CacheService } from '../../domain/repositories/Cache';

const redis = new Redis({
  host: 'localhost', 
  port: 6380,
});

export class RedisCacheService implements CacheService {
  async get(key: string): Promise<string | null> {
    return await redis.get(key);
  }

  async set(key: string, value: string, ttlSeconds = 3600): Promise<void> {
    await redis.set(key, value, 'EX', ttlSeconds);
  }
}
