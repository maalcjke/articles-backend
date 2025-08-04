import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Not, QueryFailedError, Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { AuthUserEntity } from '../entities/auth-user.entity';
import { JwtLocalService } from './jwt-local.service';
import { Tokens } from '../auth.types';
import { PGError } from '../../common/pg.interface';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(AuthUserEntity)
    private readonly userRepository: Repository<AuthUserEntity>,
    private readonly jwtLocalService: JwtLocalService,
  ) {}

  async register(user: Omit<AuthUserEntity, 'id' | 'refreshToken'>) {
    const hash = await bcrypt.hash(user.password, 10);
    const record = await this.userRepository
      .save({
        username: user.username,
        email: user.email,
        password: hash,
      })
      .catch((err) => {
        if (
          err instanceof QueryFailedError &&
          //https://www.postgresql.org/docs/current/errcodes-appendix.html
          Number((err as PGError).driverError['code']) === 23505
        ) {
          throw new BadRequestException('User already exists');
        }

        throw err;
      });

    return this.getTokens(record.id, user.email);
  }

  async login(user: Omit<AuthUserEntity, 'id' | 'username' | 'refreshToken'>) {
    const { email, password } = user;
    const record = await this.userRepository.findOne({ where: { email } });

    if (!record) return null;

    const passMatch = await bcrypt.compare(password, record.password);
    if (!passMatch) return null;

    return this.getTokens(record.id, user.email);
  }

  async logout(userId: number) {
    await this.userRepository.update(
      {
        id: userId,
        refreshToken: Not(IsNull()),
      },
      {
        refreshToken: '',
      },
    );

    return true;
  }

  private async getTokens(userId: number, email: string): Promise<Tokens> {
    const tokens = await this.jwtLocalService.getTokens(userId, email);
    await this.jwtLocalService.updateRefreshTokenHash(
      userId,
      tokens.refreshToken,
    );

    return tokens;
  }
}
