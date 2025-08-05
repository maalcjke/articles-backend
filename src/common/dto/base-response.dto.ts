import { ApiProperty } from '@nestjs/swagger';

export class BaseResponseDto<T = unknown> {
  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty()
  data: T;

  @ApiProperty({ example: '2025-08-05T00:55:43.781Z' })
  timestamp: string;
}
