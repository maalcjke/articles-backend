import { IsString } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class CreateArticleDto {
  @ApiProperty({
    example: '10 Productivity Hacks That Changed My Life',
    description: 'Title of the article. Must be a string.',
  })
  @IsString()
  @Type(() => String)
  title: string;

  @ApiProperty({
    example: 'In this article, I will share 10 simple productivity hacks...',
    description: 'Body content of the article. Must be a string.',
  })
  @IsString()
  @Type(() => String)
  body: string;
}
