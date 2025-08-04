import { ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Reflector } from '@nestjs/core';

@Injectable()
export class AccessTokenGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext) {
    const needAuth = this.reflector.getAllAndOverride('needAuth', [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!needAuth) return true;

    return super.canActivate(context);
  }
}
