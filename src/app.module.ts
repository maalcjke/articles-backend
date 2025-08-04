import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import databaseConfig from './config/database.config';
import JwtConfig from './config/jwt.config';
import { APP_GUARD } from '@nestjs/core';
import { AccessTokenGuard } from './auth/guards/access-token.guard';
import { ArticlesModule } from './articles/articles.module';
import { RedisModule } from '@lib/redis';
import redisConfig from './config/redis.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // exclude re-imports into modules
      load: [JwtConfig], // global access
    }),
    TypeOrmModule.forRootAsync(databaseConfig.asProvider()),
    RedisModule.forRootAsync(redisConfig.asProvider()),
    AuthModule,
    ArticlesModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: AccessTokenGuard,
    },
  ],
})
export class AppModule {}
