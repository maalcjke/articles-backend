import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { ArticlesService } from './articles.service';
import { CreateArticleDto } from './dto/create-article.dto';
import { UpdateArticleDto } from './dto/update-article.dto';
import { RequireAuth } from '../auth/decorators/require-auth.decorator';
import { GetCurrentUser } from '../auth/decorators/get-current-user.decorator';
import { GetArticlesFilterDto } from './dto/filter-articles.dto';

@Controller('articles')
export class ArticlesController {
  constructor(private readonly articlesService: ArticlesService) {}

  @Post()
  @RequireAuth()
  create(
    @Body() createArticleDto: CreateArticleDto,
    @GetCurrentUser('id') userId: number,
  ) {
    return this.articlesService.create(+userId, createArticleDto);
  }

  @Get()
  findAll(@Query() filterDto: GetArticlesFilterDto) {
    return this.articlesService.findAll(filterDto);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.articlesService.findOne(+id);
  }

  @Patch(':id')
  @RequireAuth()
  update(
    @Param('id') id: string,
    @GetCurrentUser('id') userId: number,
    @Body() updateArticleDto: UpdateArticleDto,
  ) {
    return this.articlesService.update(+id, +userId, updateArticleDto);
  }

  @Delete(':id')
  @RequireAuth()
  remove(@Param('id') id: string, @GetCurrentUser('id') userId: number) {
    return this.articlesService.remove(+id, +userId);
  }
}
