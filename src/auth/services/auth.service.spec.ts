import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { BadRequestException } from '@nestjs/common';
import { Repository, QueryFailedError, IsNull, Not } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { AuthService } from './auth.service';
import { JwtLocalService } from './jwt-local.service';
import { UserEntity } from '../../common/user.entity';
import { Tokens } from '../auth.types';
import { PGError } from '../../common/pg.interface';

// Mock bcrypt
jest.mock('bcrypt');
const mockedBcrypt = bcrypt as jest.Mocked<typeof bcrypt>;

describe('AuthService', () => {
  let service: AuthService;
  let userRepository: jest.Mocked<Repository<UserEntity>>;
  let jwtLocalService: jest.Mocked<JwtLocalService>;

  const mockTokens: Tokens = {
    accessToken: 'mock-access-token',
    refreshToken: 'mock-refresh-token',
  };

  const mockUser: UserEntity = {
    id: 1,
    username: 'testuser',
    email: 'test@example.com',
    password: 'hashedpassword',
    refreshToken: null,
    articles: [],
  } as unknown as UserEntity;

  beforeEach(async () => {
    const mockUserRepository = {
      save: jest.fn(),
      findOne: jest.fn(),
      update: jest.fn(),
    };

    const mockJwtLocalService = {
      getTokens: jest.fn(),
      updateRefreshTokenHash: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: getRepositoryToken(UserEntity),
          useValue: mockUserRepository,
        },
        {
          provide: JwtLocalService,
          useValue: mockJwtLocalService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    userRepository = module.get(getRepositoryToken(UserEntity));
    jwtLocalService = module.get(JwtLocalService);

    // Reset all mocks
    jest.clearAllMocks();
  });

  describe('register', () => {
    const registerData = {
      username: 'testuser',
      email: 'test@example.com',
      password: 'password123',
    };

    beforeEach(() => {
      mockedBcrypt.hash.mockResolvedValue('hashedpassword' as never);
      jwtLocalService.getTokens.mockResolvedValue(mockTokens);
      jwtLocalService.updateRefreshTokenHash.mockResolvedValue(undefined);
    });

    it('should successfully register a user', async () => {
      userRepository.save.mockResolvedValue(mockUser);

      const result = await service.register(registerData);

      expect(mockedBcrypt.hash).toHaveBeenCalledWith('password123', 10);
      expect(userRepository.save).toHaveBeenCalledWith({
        username: 'testuser',
        email: 'test@example.com',
        password: 'hashedpassword',
      });
      expect(jwtLocalService.getTokens).toHaveBeenCalledWith(
        1,
        'test@example.com',
      );
      expect(jwtLocalService.updateRefreshTokenHash).toHaveBeenCalledWith(
        1,
        'mock-refresh-token',
      );
      expect(result).toEqual(mockTokens);
    });

    it('should throw BadRequestException when user already exists (duplicate key error)', async () => {
      const pgError: PGError = {
        driverError: { code: '23505' },
      } as PGError;
      const queryError = new QueryFailedError('query', [], pgError as any);

      userRepository.save.mockRejectedValue(queryError);

      await expect(service.register(registerData)).rejects.toThrow(
        new BadRequestException('User already exists'),
      );
    });

    it('should re-throw other database errors', async () => {
      const otherError = new Error('Some other database error');
      userRepository.save.mockRejectedValue(otherError);

      await expect(service.register(registerData)).rejects.toThrow(otherError);
    });

    it('should re-throw QueryFailedError with different error code', async () => {
      const pgError: PGError = {
        driverError: { code: '23503' }, // Different error code
      } as PGError;
      const queryError = new QueryFailedError('query', [], pgError as any);

      userRepository.save.mockRejectedValue(queryError);

      await expect(service.register(registerData)).rejects.toThrow(queryError);
    });
  });

  describe('login', () => {
    const loginData = {
      email: 'test@example.com',
      password: 'password123',
    };

    beforeEach(() => {
      jwtLocalService.getTokens.mockResolvedValue(mockTokens);
      jwtLocalService.updateRefreshTokenHash.mockResolvedValue(undefined);
    });

    it('should successfully login with valid credentials', async () => {
      userRepository.findOne.mockResolvedValue(mockUser);
      mockedBcrypt.compare.mockResolvedValue(true as never);

      const result = await service.login(loginData);

      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { email: 'test@example.com' },
      });
      expect(mockedBcrypt.compare).toHaveBeenCalledWith(
        'password123',
        'hashedpassword',
      );
      expect(jwtLocalService.getTokens).toHaveBeenCalledWith(
        1,
        'test@example.com',
      );
      expect(jwtLocalService.updateRefreshTokenHash).toHaveBeenCalledWith(
        1,
        'mock-refresh-token',
      );
      expect(result).toEqual(mockTokens);
    });

    it('should return null when user is not found', async () => {
      userRepository.findOne.mockResolvedValue(null);

      const result = await service.login(loginData);

      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { email: 'test@example.com' },
      });
      expect(mockedBcrypt.compare).not.toHaveBeenCalled();
      expect(jwtLocalService.getTokens).not.toHaveBeenCalled();
      expect(result).toBeNull();
    });

    it('should return null when password does not match', async () => {
      userRepository.findOne.mockResolvedValue(mockUser);
      mockedBcrypt.compare.mockResolvedValue(false as never);

      const result = await service.login(loginData);

      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { email: 'test@example.com' },
      });
      expect(mockedBcrypt.compare).toHaveBeenCalledWith(
        'password123',
        'hashedpassword',
      );
      expect(jwtLocalService.getTokens).not.toHaveBeenCalled();
      expect(result).toBeNull();
    });
  });

  describe('logout', () => {
    it('should successfully logout user', async () => {
      userRepository.update.mockResolvedValue({ affected: 1 } as any);

      const result = await service.logout(1);

      expect(userRepository.update).toHaveBeenCalledWith(
        {
          id: 1,
          refreshToken: Not(IsNull()),
        },
        {
          refreshToken: '',
        },
      );
      expect(result).toBe(true);
    });

    it('should return true even if no rows affected', async () => {
      userRepository.update.mockResolvedValue({ affected: 0 } as any);

      const result = await service.logout(1);

      expect(userRepository.update).toHaveBeenCalledWith(
        {
          id: 1,
          refreshToken: Not(IsNull()),
        },
        {
          refreshToken: '',
        },
      );
      expect(result).toBe(true);
    });
  });

  describe('getTokens (private method)', () => {
    it('should generate tokens and update refresh token hash', async () => {
      // Поскольку метод приватный, тестируем его через публичные методы
      userRepository.save.mockResolvedValue(mockUser);
      mockedBcrypt.hash.mockResolvedValue('hashedpassword' as never);
      jwtLocalService.getTokens.mockResolvedValue(mockTokens);
      jwtLocalService.updateRefreshTokenHash.mockResolvedValue(undefined);

      const registerData = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123',
      };

      await service.register(registerData);

      expect(jwtLocalService.getTokens).toHaveBeenCalledWith(
        1,
        'test@example.com',
      );
      expect(jwtLocalService.updateRefreshTokenHash).toHaveBeenCalledWith(
        1,
        'mock-refresh-token',
      );
    });
  });
});
