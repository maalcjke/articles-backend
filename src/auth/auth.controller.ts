import {
  Body,
  Controller,
  NotFoundException,
  Post,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterPostDto } from './dto/register.post.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  async register(@Body() dto: RegisterPostDto) {
    return await this.authService.register(dto);
  }

  @Post('signin')
  async login(@Body() dto: RegisterPostDto) {
    const user = await this.authService.login(dto);
    if (!user) throw new UnauthorizedException();
  }
}
