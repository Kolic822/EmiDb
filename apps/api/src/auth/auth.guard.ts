import { type CanActivate, type ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { Request } from 'express';
import { AuthService, readCookie, SESSION_COOKIE } from './auth.service.js';
import { IS_PUBLIC } from './public.decorator.js';

/** Every API route needs a valid session cookie when a password is configured. */
@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly auth: AuthService,
    private readonly reflector: Reflector,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    if (!this.auth.required) return true;
    if (this.reflector.getAllAndOverride<boolean>(IS_PUBLIC, [context.getHandler(), context.getClass()])) return true;
    const request = context.switchToHttp().getRequest<Request>();
    if (this.auth.verifyToken(readCookie(request.headers.cookie, SESSION_COOKIE))) return true;
    throw new UnauthorizedException('Sign in required');
  }
}
