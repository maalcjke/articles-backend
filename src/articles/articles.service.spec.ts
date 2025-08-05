import { Test, TestingModule } from '@nestjs/testing';
import { ArticlesService } from './articles.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ArticleEntity } from './entities/article.entity';
import { UserEntity } from '../common/user.entity';
import { RedisHelperService } from '@lib/redis/redis-helper.service';
import {
  ForbiddenException,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';

describe('ArticlesService', () => {
  let service: ArticlesService;
  let articleRepo: any;
  let userRepo: any;
  let redisHelper: any;

  beforeEach(async () => {
    articleRepo = {
      findOne: jest.fn(),
      findOneBy: jest.fn(),
      save: jest.fn(),
      createQueryBuilder: jest.fn(),
      remove: jest.fn(),
    };

    userRepo = {
      findOneBy: jest.fn(),
    };

    redisHelper = {
      getOrSet: jest.fn(),
      del: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ArticlesService,
        { provide: getRepositoryToken(ArticleEntity), useValue: articleRepo },
        { provide: getRepositoryToken(UserEntity), useValue: userRepo },
        { provide: RedisHelperService, useValue: redisHelper },
      ],
    }).compile();

    service = module.get<ArticlesService>(ArticlesService);
  });

  describe('create', () => {
    it('should create article successfully', async () => {
      const user = { id: 1 };
      userRepo.findOneBy.mockResolvedValue(user);
      articleRepo.save.mockResolvedValue({ id: 42 });

      const result = await service.create(1, { title: 't', body: 'b' });

      expect(userRepo.findOneBy).toHaveBeenCalledWith({ id: 1 });
      expect(articleRepo.save).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 't',
          body: 'b',
          author: user,
          date: expect.any(Date),
        }),
      );
      expect(result).toEqual({ id: 42 });
    });

    it('should throw ForbiddenException if user not found', async () => {
      userRepo.findOneBy.mockResolvedValue(null);
      await expect(
        service.create(1, { title: 't', body: 'b' }),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should throw InternalServerErrorException if save returns falsy', async () => {
      userRepo.findOneBy.mockResolvedValue({ id: 1 });
      articleRepo.save.mockResolvedValue(null);

      await expect(
        service.create(1, { title: 't', body: 'b' }),
      ).rejects.toThrow(InternalServerErrorException);
    });
  });

  describe('findAll', () => {
    it('should return cached articles', async () => {
      const filterDto = { authorId: 1, page: 2, limit: 5 };
      const articles = [
        {
          id: 1,
          title: 'title',
          body: 'body',
          date: new Date(),
          author: { id: 1, username: 'user' },
        },
      ];
      const total = 1;

      // Mock query builder chain
      const queryBuilder = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockResolvedValue([articles, total]),
      };

      articleRepo.createQueryBuilder.mockReturnValue(queryBuilder);

      redisHelper.getOrSet.mockImplementation(async (_key, _ttl, cb) => cb());

      const result = await service.findAll(filterDto);

      expect(articleRepo.createQueryBuilder).toHaveBeenCalledWith('article');
      expect(redisHelper.getOrSet).toHaveBeenCalled();

      expect(result.data).toHaveLength(1);
      expect(result.meta.total).toBe(total);
      expect(result.meta.page).toBe(2);
      expect(result.meta.limit).toBe(5);
    });

    it('should throw NotFoundException if no articles found', async () => {
      const filterDto = {};
      const queryBuilder = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockResolvedValue([[], 0]),
      };
      articleRepo.createQueryBuilder.mockReturnValue(queryBuilder);
      redisHelper.getOrSet.mockImplementation(async (_k, _ttl, cb) => cb());

      await expect(service.findAll(filterDto)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('findOne', () => {
    it('should return cached article', async () => {
      const article = {
        id: 1,
        title: 't',
        body: 'b',
        date: new Date(),
        author: { id: 2, username: 'user' },
      };
      articleRepo.findOne.mockResolvedValue(article);
      redisHelper.getOrSet.mockImplementation(async (_k, _ttl, cb) => cb());

      const result = await service.findOne(1);

      expect(articleRepo.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
        relations: ['author'],
      });
      expect(result.id).toBe(1);
    });

    it('should throw NotFoundException if article not found', async () => {
      articleRepo.findOne.mockResolvedValue(null);
      redisHelper.getOrSet.mockImplementation(async (_k, _ttl, cb) => cb());

      await expect(service.findOne(1)).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update article successfully', async () => {
      const article = {
        id: 1,
        author: { id: 2 },
        title: 'old',
        body: 'old',
      };
      articleRepo.findOne.mockResolvedValue(article);
      articleRepo.save.mockResolvedValue({ id: 1 });
      redisHelper.del.mockResolvedValue(undefined);

      const result = await service.update(1, 2, { title: 'new' });

      expect(articleRepo.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
        relations: ['author'],
      });
      expect(articleRepo.save).toHaveBeenCalledWith(
        expect.objectContaining({ title: 'new' }),
      );
      expect(redisHelper.del).toHaveBeenCalledWith('article:1');
      expect(result).toEqual({ id: 1 });
    });

    it('should throw NotFoundException if article not found', async () => {
      articleRepo.findOne.mockResolvedValue(null);
      await expect(service.update(1, 2, {})).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException if user is not author', async () => {
      articleRepo.findOne.mockResolvedValue({ id: 1, author: { id: 99 } });
      await expect(service.update(1, 2, {})).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('should throw InternalServerErrorException if save fails', async () => {
      const article = { id: 1, author: { id: 2 }, title: 'old' };
      articleRepo.findOne.mockResolvedValue(article);
      articleRepo.save.mockRejectedValue(new Error('fail'));
      await expect(service.update(1, 2, {})).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  describe('remove', () => {
    it('should remove article successfully', async () => {
      const article = { id: 1, author: { id: 2 } };
      articleRepo.findOne.mockResolvedValue(article);
      articleRepo.remove.mockResolvedValue(undefined);
      redisHelper.del.mockResolvedValue(undefined);

      const result = await service.remove(1, 2);

      expect(articleRepo.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
        relations: ['author'],
      });
      expect(articleRepo.remove).toHaveBeenCalledWith(article);
      expect(redisHelper.del).toHaveBeenCalledWith('article:1');
      expect(result).toEqual({ id: 1 });
    });

    it('should throw NotFoundException if article not found', async () => {
      articleRepo.findOne.mockResolvedValue(null);
      await expect(service.remove(1, 2)).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException if user is not author', async () => {
      articleRepo.findOne.mockResolvedValue({ id: 1, author: { id: 99 } });
      await expect(service.remove(1, 2)).rejects.toThrow(ForbiddenException);
    });

    it('should throw InternalServerErrorException if remove fails', async () => {
      const article = { id: 1, author: { id: 2 } };
      articleRepo.findOne.mockResolvedValue(article);
      articleRepo.remove.mockRejectedValue(new Error('fail'));

      await expect(service.remove(1, 2)).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });
});
