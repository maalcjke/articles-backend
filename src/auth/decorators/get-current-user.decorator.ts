import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { JWTUpdatePayload } from '../auth.types';
import { Request } from 'express';

export const GetCurrentUser = createParamDecorator(
  (data: keyof JWTUpdatePayload | undefined, context: ExecutionContext) => {
    const request = context.switchToHttp().getRequest<Request>();
    if (!data) return request.user;
    return request.user?.[data] ?? null;
  },
);
