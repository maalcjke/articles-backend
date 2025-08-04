import { Inject } from '@nestjs/common';
import { REDIS_PROVIDER } from '@lib/redis/redis.constants';

export const InjectRedis = () => Inject(REDIS_PROVIDER);
