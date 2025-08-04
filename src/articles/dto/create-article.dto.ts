import { IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateArticleDto {
  @IsString()
  @Type(() => String)
  title: string;

  @IsString()
  @Type(() => String)
  body: string;
}
