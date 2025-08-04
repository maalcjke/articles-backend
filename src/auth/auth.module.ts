import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthUserEntity } from './entities/auth-user.entity';
import { AuthService } from './services/auth.service';
import { JwtLocalService } from './services/jwt-local.service';
import { JwtModule } from '@nestjs/jwt';
import { JwtCreateStrategy } from './strategies/jwt.create.strategy';
import { JwtUpdateStrategy } from './strategies/jwt.update.strategy';

@Module({
  imports: [TypeOrmModule.forFeature([AuthUserEntity]), JwtModule.register({})],
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtLocalService,
    JwtCreateStrategy,
    JwtUpdateStrategy,
  ],
  exports: [AuthService],
})
export class AuthModule {}
