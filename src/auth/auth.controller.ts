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
import { RefreshTokenGuard } from './guards/refresh-token.guard';
import { RequireAuth } from './decorators/require-auth.decorator';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';
import { UnauthorizedErrorDto } from '../common/dto/unauth-error.dto';
import { ApiWrappedResponse } from '../common/decorators/wrapped-response.decorator';
import { CrudArticleDto } from '../articles/dto/response/crud-article.dto';
import { AccessTokensDto } from './dto/response/access-tokens.dto';
import { BadRequestErrorDto } from '../common/dto/bad-request.dto';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly jwtService: JwtLocalService,
  ) {}

  @Post('signup')
  @ApiOperation({ summary: 'Register a new user' })
  @ApiWrappedResponse({
    model: AccessTokensDto,
    status: 200,
    description: 'User successfully registered',
  })
  @ApiResponse({
    status: 400,
    description: 'List of validation error messages',
    type: BadRequestErrorDto,
  })
  @ApiBody({ type: RegisterPostDto })
  async register(@Body() dto: RegisterPostDto) {
    return await this.authService.register(dto);
  }

  @Post('signin')
  @ApiOperation({ summary: 'Authenticate user and return tokens' })
  @ApiWrappedResponse({
    model: AccessTokensDto,
    status: 200,
    description: 'User successfully authenticated',
  })
  @ApiResponse({
    status: 400,
    description: 'List of validation error messages',
    type: BadRequestErrorDto,
  })
  @ApiBody({ type: RegisterPostDto })
  async login(@Body() dto: RegisterPostDto) {
    const user = await this.authService.login(dto);
    if (!user) throw new UnauthorizedException();

    return user;
  }

  @Post('refresh')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Refresh access and refresh tokens' })
  @ApiWrappedResponse({
    model: AccessTokensDto,
    status: 200,
    description: 'Tokens refreshed successfully',
  })
  @ApiResponse({
    status: 401,
    description: 'Invalid or expired refresh token',
    type: UnauthorizedErrorDto,
  })
  @UseGuards(RefreshTokenGuard)
  async refresh(
    @GetCurrentUser('id') userId: number,
    @GetCurrentUser('refreshToken') refreshToken: string,
  ): Promise<Tokens> {
    if (!userId || !refreshToken) throw new UnauthorizedException();
    return this.jwtService.refreshTokens(userId, refreshToken);
  }

  @RequireAuth()
  @Post('logout')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Logout user and invalidate tokens' })
  @ApiResponse({ status: 200, description: 'Successfully logged out' })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
    type: UnauthorizedErrorDto,
  })
  async logout(@GetCurrentUser('id') userId: number): Promise<boolean> {
    return this.authService.logout(userId);
  }
}
