import { ApiProperty } from '@nestjs/swagger';

class AuthorDto {
  @ApiProperty({ example: 1, description: 'Author ID' })
  id: number;

  @ApiProperty({ example: 'john_doe', description: 'Author username' })
  username: string;
}

class ArticleDto {
  @ApiProperty({ example: 10, description: 'Article ID' })
  id: number;

  @ApiProperty({
    example: 'Article title',
    description: 'Title of the article',
  })
  title: string;

  @ApiProperty({
    example: 'Article body text...',
    description: 'Body content of the article',
  })
  body: string;

  @ApiProperty({
    example: '2025-08-05T12:00:00Z',
    description: 'Publication date',
    type: String,
    format: 'date-time',
  })
  date: string;

  @ApiProperty({ description: 'Author of the article', type: () => AuthorDto })
  author: AuthorDto;
}

class MetaDto {
  @ApiProperty({ example: 100, description: 'Total number of articles' })
  total: number;

  @ApiProperty({ example: 1, description: 'Current page number' })
  page: number;

  @ApiProperty({ example: 10, description: 'Number of articles per page' })
  limit: number;

  @ApiProperty({ example: 10, description: 'Total number of pages' })
  totalPages: number;
}

export class AllResponseDto {
  @ApiProperty({ type: [ArticleDto], description: 'List of articles' })
  data: ArticleDto[];

  @ApiProperty({ type: MetaDto, description: 'Pagination metadata' })
  meta: MetaDto;
}
