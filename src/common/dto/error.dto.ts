import { ApiProperty } from '@nestjs/swagger';

export class NotFoundErrorDto {
  @ApiProperty({
    example: 'Articles not found',
    description: 'Error message describing what went wrong',
  })
  message: string;

  @ApiProperty({ example: 'Not Found', description: 'Error type' })
  error: string;

  @ApiProperty({ example: 404, description: 'HTTP status code' })
  statusCode: number;
}
