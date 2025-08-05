import { ApiProperty } from '@nestjs/swagger';

export class AccessTokensDto {
  @ApiProperty({
    description: 'JWT access token used to authenticate API requests',
    example:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NywiZW1haWwiOiJhc0B5YS5ydSIsImlhdCI6MTc1NDM1NjQ4NCw...',
  })
  accessToken: string;

  @ApiProperty({
    description: 'JWT refresh token used to obtain new access tokens',
    example:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NywiZW1haWwiOiJhc0B5YS5ydSIsImlhdCI6MTc1NDM1NjQ4NCwiZXh...',
  })
  refreshToken: string;
}
