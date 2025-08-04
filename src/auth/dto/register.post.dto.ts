import { IsEmail, IsString, MaxLength, MinLength } from 'class-validator';
import { Type } from 'class-transformer';

export class RegisterPostDto {
  @IsString()
  @Type(() => String)
  username: string;

  @IsString()
  @IsEmail()
  @Type(() => String)
  email: string;

  @IsString()
  @MinLength(8)
  @MaxLength(16)
  @Type(() => String)
  password: string;
}
