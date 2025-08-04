import {
  Body,
  Controller,
  Post,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { RegisterPostDto } from './dto/register.post.dto';
import { AuthService } from './services/auth.service';
import { JwtLocalService } from './services/jwt-local.service';
import { GetCurrentUser } from './decorators/get-current-user.decorator';
import { Tokens } from './auth.types';
import { JwtUpdateStrategy } from './strategies/jwt.update.strategy';
import { RefreshTokenGuard } from './guards/refresh-token.guard';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly jwtService: JwtLocalService,
  ) {}

  @Post('signup')
  async register(@Body() dto: RegisterPostDto) {
    return await this.authService.register(dto);
  }

  @Post('signin')
  async login(@Body() dto: RegisterPostDto) {
    const user = await this.authService.login(dto);
    if (!user) throw new UnauthorizedException();

    return user;
  }

  @Post('refresh')
  @UseGuards(RefreshTokenGuard)
  async refresh(
    @GetCurrentUser('id') userId: number,
    @GetCurrentUser('refreshToken') refreshToken: string,
  ): Promise<Tokens> {
    if (!userId || !refreshToken) throw new UnauthorizedException();

    return this.jwtService.refreshTokens(userId, refreshToken);
  }

  @Post('logout')
  async logout(userId: number): Promise<boolean> {
    return this.authService.logout(userId);
  }
}
