import { IsEmail, IsString, MaxLength, MinLength } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterPostDto {
  @ApiProperty({
    example: 'Leo Tolstoy',
    description: 'The username of the registering user. Must be a string.',
  })
  @IsString()
  @Type(() => String)
  username: string;

  @ApiProperty({
    example: 'john@example.com',
    description: 'The email address of the user. Must be a valid email string.',
  })
  @IsString()
  @IsEmail()
  @Type(() => String)
  email: string;

  @ApiProperty({
    example: 'S3cureP@ssw0rd',
    description: 'Password for the user account. Must be 8–16 characters.',
    minLength: 8,
    maxLength: 16,
  })
  @IsString()
  @MinLength(8)
  @MaxLength(16)
  @Type(() => String)
  password: string;
}
