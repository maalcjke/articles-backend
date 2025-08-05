import Redis from 'ioredis';
import { DynamicModule, Global, Module } from '@nestjs/common';
import { RedisModuleOptions } from '@lib/redis/interfaces/redis-module.options';
import { REDIS_OPTIONS, REDIS_PROVIDER } from '@lib/redis/redis.constants';
import { RedisHelperService } from '@lib/redis/redis-helper.service';

@Global()
@Module({})
export class RedisModule {
  static forRootAsync(options: {
    imports: any[];
    useFactory: (
      ...args: any[]
    ) => Promise<RedisModuleOptions> | RedisModuleOptions;
    inject?: any[];
  }): DynamicModule {
    return {
      module: RedisModule,
      imports: options.imports,
      providers: [
        {
          provide: REDIS_OPTIONS,
          useFactory: options.useFactory,
          inject: options.inject || [],
        },
        {
          provide: REDIS_PROVIDER,
          useFactory: (opts: RedisModuleOptions) => {
            return new Redis(opts.url, opts);
          },
          inject: [REDIS_OPTIONS],
        },
        RedisHelperService,
      ],
      exports: [REDIS_PROVIDER, RedisHelperService],
    };
  }
}
