import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthUserEntity } from './entities/auth-user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([AuthUserEntity])],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}
