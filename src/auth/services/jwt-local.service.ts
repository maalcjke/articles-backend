import { JWTCreatePayload, Tokens } from '../auth.types';
import { InjectRepository } from '@nestjs/typeorm';
import { AuthUserEntity } from '../entities/auth-user.entity';
import { JwtService } from '@nestjs/jwt';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { ConfigService } from '@nestjs/config';
import { ForbiddenException } from '@nestjs/common';

export class JwtLocalService {
  constructor(
    @InjectRepository(AuthUserEntity)
    private readonly userRepository: Repository<AuthUserEntity>,
    private readonly JwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async refreshTokens(userId: number, rt: string): Promise<Tokens> {
    const user = await this.userRepository.findOne({
      where: {
        id: userId,
      },
    });
    if (!user || !user.refreshToken || !rt)
      throw new ForbiddenException('Access Denied');

    const rtMatches = await bcrypt.compare(rt, user.refreshToken);
    if (!rtMatches) throw new ForbiddenException('Access Denied');

    const tokens = await this.getTokens(user.id, user.email);
    await this.updateRefreshTokenHash(user.id, tokens.refreshToken);

    return tokens;
  }

  async updateRefreshTokenHash(
    userId: number,
    refreshToken: string,
  ): Promise<void> {
    const hash = await bcrypt.hash(refreshToken, 10);
    await this.userRepository.save({
      id: userId,
      refreshToken: hash,
    });
  }

  async getTokens(userId: number, email: string): Promise<Tokens> {
    const jwtPayload: JWTCreatePayload = {
      id: userId,
      email: email,
    };

    const [accessToken, refreshToken] = await Promise.all([
      this.JwtService.signAsync(jwtPayload, {
        secret: this.configService.getOrThrow<string>('jwt.accessTokenSecret'),
        expiresIn: '15m',
      }),
      this.JwtService.signAsync(jwtPayload, {
        secret: this.configService.getOrThrow<string>('jwt.updateTokenSecret'),
        expiresIn: '7d',
      }),
    ]);

    return {
      accessToken,
      refreshToken,
    };
  }
}
