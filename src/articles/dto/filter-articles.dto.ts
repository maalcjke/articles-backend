import { IsOptional, IsInt, IsDateString, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class GetArticlesFilterDto {
  @ApiPropertyOptional({
    example: 42,
    description: 'Filter by author ID. Must be an integer.',
  })
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  authorId?: number;

  @ApiPropertyOptional({
    example: '2024-01-01',
    description: 'Filter articles published on or after this date (ISO 8601).',
  })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({
    example: '2024-12-31',
    description: 'Filter articles published on or before this date (ISO 8601).',
  })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiPropertyOptional({
    example: 1,
    description: 'Page number for pagination. Must be ≥ 1.',
    default: 1,
    minimum: 1,
  })
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({
    example: 10,
    description: 'Number of articles per page. Must be between 1 and 100.',
    default: 10,
    minimum: 1,
    maximum: 100,
  })
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  @Min(1)
  @Max(100)
  limit?: number = 10;
}
