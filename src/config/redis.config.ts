import { registerAs } from '@nestjs/config';
import * as process from 'node:process';
import { RedisModuleOptions } from '@lib/redis/interfaces/redis-module.options';

export default registerAs(
  'redis',
  (): RedisModuleOptions => ({
    url: String(
      process.env.REDIS_URL ?? 'redis://:authpassword@localhost:6379/',
    ),
  }),
);
