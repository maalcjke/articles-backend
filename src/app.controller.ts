import { Controller, Get } from '@nestjs/common';
import { GetCurrentUser } from './auth/decorators/get-current-user.decorator';
import { RequireAuth } from './auth/decorators/require-auth.decorator';

@Controller()
export class AppController {
  @Get()
  @RequireAuth()
  getHello(@GetCurrentUser() user: string): string {
    return user;
  }
}
