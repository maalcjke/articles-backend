import {
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateArticleDto } from './dto/create-article.dto';
import { UpdateArticleDto } from './dto/update-article.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { ArticleEntity } from './entities/article.entity';
import { Repository } from 'typeorm';
import { UserEntity } from '../common/user.entity';
import { GetArticlesFilterDto } from './dto/filter-articles.dto';
import { RedisHelperService } from '@lib/redis/redis-helper.service';

@Injectable()
export class ArticlesService {
  private readonly TTL_ARTICLES: number = 120;
  private readonly TTL_ARTICLE: number = 7_200_000;

  constructor(
    @InjectRepository(ArticleEntity)
    private readonly articleRepository: Repository<ArticleEntity>,
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    private readonly redisHelper: RedisHelperService,
  ) {}

  async create(userId: number, createArticleDto: CreateArticleDto) {
    const user = await this.userRepository.findOneBy({ id: userId });
    if (!user) throw new ForbiddenException('User does not exist');

    const record = await this.articleRepository.save({
      ...createArticleDto,
      date: new Date(),
      author: user,
    });

    if (!record) throw new InternalServerErrorException();
    return { id: record.id };
  }

  async findAll(filterDto: GetArticlesFilterDto) {
    const cacheKey = `articles:${Object.values(filterDto) // Smart invalidation cache + mutex
      .map((value) => value ?? 'null')
      .join(',')}`;

    return this.redisHelper.getOrSet(cacheKey, this.TTL_ARTICLES, async () => {
      const { authorId, startDate, endDate, page = 1, limit = 10 } = filterDto;

      const query = this.articleRepository
        .createQueryBuilder('article')
        .leftJoinAndSelect('article.author', 'author')
        .orderBy('article.date', 'DESC');

      if (authorId) query.andWhere('author.id = :authorId', { authorId });
      if (startDate)
        query.andWhere('article.date >= :startDate', { startDate });
      if (endDate) query.andWhere('article.date <= :endDate', { endDate });

      const [items, total] = await query
        .skip((page - 1) * limit)
        .take(limit)
        .getManyAndCount();

      if (items.length === 0) throw new NotFoundException('Articles not found');

      return {
        data: items.map((article) => ({
          id: article.id,
          title: article.title,
          body: article.body,
          date: article.date,
          author: {
            id: article.author.id,
            username: article.author.username,
          },
        })),
        meta: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      };
    });
  }

  async findOne(id: number) {
    const cacheKey = `article:${id}`;

    return this.redisHelper.getOrSet(cacheKey, this.TTL_ARTICLE, async () => {
      const article = await this.articleRepository.findOne({
        where: { id },
        relations: ['author'],
      });

      if (!article) throw new NotFoundException(`Article not found`);

      return {
        id: article.id,
        title: article.title,
        body: article.body,
        date: article.date,
        author: {
          id: article.author.id,
          username: article.author.username,
        },
      };
    });
  }

  async update(id: number, userId: number, updateArticleDto: UpdateArticleDto) {
    const article = await this.articleRepository.findOne({
      where: { id },
      relations: ['author'],
    });

    if (!article) throw new NotFoundException(`Article not found`);
    if (article.author.id !== userId) {
      throw new ForbiddenException('You are not the author of this article');
    }

    Object.assign(article, updateArticleDto); // Merge fields

    const updated = await this.articleRepository
      .save(article)
      .catch((err) => {
        throw new InternalServerErrorException('Failed to update article');
      })
      .then(async (data) => {
        await this.redisHelper.del(`article:${id}`);
        return data;
      });

    return { id: updated.id };
  }

  async remove(id: number, userId: number) {
    const article = await this.articleRepository.findOne({
      where: { id },
      relations: ['author'],
    });

    if (!article) throw new NotFoundException(`Article with not found`);

    if (article.author.id !== userId)
      throw new ForbiddenException(
        'You are not allowed to delete this article',
      );

    await this.articleRepository
      .remove(article)
      .catch(() => {
        throw new InternalServerErrorException('Failed delete article');
      })
      .then(async () => await this.redisHelper.del(`article:${id}`));

    return { id: id };
  }
}
