import { ApiProperty } from '@nestjs/swagger';

export class CrudArticleDto {
  @ApiProperty({ example: 5, description: 'Unique identifier' })
  id: number;
}
