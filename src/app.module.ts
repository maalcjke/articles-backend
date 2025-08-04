import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import databaseConfig from './config/database.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // exclude re-imports into modules
    }),
    TypeOrmModule.forRootAsync(databaseConfig.asProvider()),
  ],

  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
