import { PartialType } from '@nestjs/mapped-types';
import { CreateArticleDto } from './create-article.dto';
import { ApiExtraModels } from '@nestjs/swagger';

@ApiExtraModels(CreateArticleDto)
export class UpdateArticleDto extends PartialType(CreateArticleDto) {}
