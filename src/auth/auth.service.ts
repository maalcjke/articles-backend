import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AuthUserEntity } from './entities/auth-user.entity';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(AuthUserEntity)
    private readonly userRepository: Repository<AuthUserEntity>,
  ) {}

  async register(user: Omit<AuthUserEntity, 'id'>) {
    const hash = await bcrypt.hash(user.password, 10);
    return this.userRepository.save({
      username: user.username,
      email: user.email,
      password: hash,
    });
  }

  async login(user: Omit<AuthUserEntity, 'id' | 'username'>) {
    const { email, password } = user;
    const record = await this.userRepository.findOne({ where: { email } });

    if (!record) return null;

    const passMatch = await bcrypt.compare(password, record.password);

    if (!passMatch) return null;

    return true;
  }
}
