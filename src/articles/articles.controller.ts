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
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { ApiWrappedResponse } from '../common/decorators/wrapped-response.decorator';
import { AllResponseDto } from './dto/response/all-articles.dto';
import { UnauthorizedErrorDto } from '../common/dto/unauth-error.dto';
import { NotFoundErrorDto } from '../common/dto/error.dto';
import { CrudArticleDto } from './dto/response/crud-article.dto';

@ApiTags('Articles')
@Controller('articles')
export class ArticlesController {
  constructor(private readonly articlesService: ArticlesService) {}

  @Post()
  @RequireAuth()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new article' })
  @ApiWrappedResponse({
    model: CrudArticleDto,
    status: 201,
    description: 'Article successfully fetched',
  })
  @ApiResponse({ status: 401, type: UnauthorizedErrorDto })
  create(
    @Body() createArticleDto: CreateArticleDto,
    @GetCurrentUser('id') userId: number,
  ) {
    return this.articlesService.create(+userId, createArticleDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get a list of articles with optional filters' })
  @ApiWrappedResponse({
    model: AllResponseDto,
    status: 200,
    description: 'Article successfully fetched',
  })
  @ApiResponse({ status: 404, type: NotFoundErrorDto })
  findAll(@Query() filterDto: GetArticlesFilterDto) {
    return this.articlesService.findAll(filterDto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single article by its ID' })
  @ApiWrappedResponse({
    model: AllResponseDto,
    status: 200,
    description: 'Article successfully fetched',
  })
  @ApiResponse({ status: 404, type: NotFoundErrorDto })
  findOne(@Param('id') id: string) {
    return this.articlesService.findOne(+id);
  }

  @Patch(':id')
  @RequireAuth()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update an article by its ID (requires auth)' })
  @ApiWrappedResponse({
    model: CrudArticleDto,
    status: 200,
    description: 'Article successfully updated',
  })
  @ApiResponse({ status: 401, type: UnauthorizedErrorDto })
  @ApiResponse({ status: 404, type: NotFoundErrorDto })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'ID of the article to update',
  })
  update(
    @Param('id') id: string,
    @GetCurrentUser('id') userId: number,
    @Body() updateArticleDto: UpdateArticleDto,
  ) {
    return this.articlesService.update(+id, +userId, updateArticleDto);
  }

  @Delete(':id')
  @RequireAuth()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete an article by its ID (requires auth)' })
  @ApiWrappedResponse({
    model: CrudArticleDto,
    status: 200,
    description: 'Article successfully updated',
  })
  @ApiResponse({ status: 401, type: UnauthorizedErrorDto })
  @ApiResponse({ status: 404, type: NotFoundErrorDto })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'ID of the article to delete',
  })
  remove(@Param('id') id: string, @GetCurrentUser('id') userId: number) {
    return this.articlesService.remove(+id, +userId);
  }
}
