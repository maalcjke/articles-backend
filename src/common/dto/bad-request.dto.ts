import { ApiProperty } from '@nestjs/swagger';

export class BadRequestErrorDto {
  @ApiProperty({
    example: ['email must be an email'],
    description: 'List of validation error messages',
    isArray: true,
    type: String,
  })
  message: string[];

  @ApiProperty({ example: 'Bad Request', description: 'Error type' })
  error: string;

  @ApiProperty({ example: 400, description: 'HTTP status code' })
  statusCode: number;
}
