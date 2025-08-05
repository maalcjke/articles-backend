import { ApiProperty } from '@nestjs/swagger';

export class UnauthorizedErrorDto {
  @ApiProperty({
    example: 'Unauthorized',
    description: 'Error message indicating lack of authorization',
  })
  message: string;

  @ApiProperty({
    example: 401,
    description: 'HTTP status code for unauthorized access',
  })
  statusCode: number;
}
