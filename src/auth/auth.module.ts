import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthService } from './services/auth.service';
import { JwtLocalService } from './services/jwt-local.service';
import { JwtModule } from '@nestjs/jwt';
import { JwtCreateStrategy } from './strategies/jwt.create.strategy';
import { JwtUpdateStrategy } from './strategies/jwt.update.strategy';
import { UserEntity } from '../common/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([UserEntity]), JwtModule.register({})],
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
