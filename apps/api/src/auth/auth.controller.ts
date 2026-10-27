import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpException,
  HttpStatus,
  Post,
  Req,
  Res,
  UnauthorizedException,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { LoginDto } from './auth.dto.js';
import { AuthService, readCookie, SESSION_COOKIE } from './auth.service.js';
import { Public } from './public.decorator.js';

export interface AuthStatus {
  /** A password is configured, so the app asks for it. */
  required: boolean;
  authenticated: boolean;
}

@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Public()
  @Get()
  status(@Req() request: Request): AuthStatus {
    return {
      required: this.auth.required,
      authenticated: !this.auth.required || this.auth.verifyToken(readCookie(request.headers.cookie, SESSION_COOKIE)),
    };
  }

  @Public()
  @Post('login')
  @HttpCode(200)
  login(@Body() dto: LoginDto, @Req() request: Request, @Res({ passthrough: true }) response: Response): AuthStatus {
    const client = request.ip ?? 'unknown';
    if (this.auth.isLockedOut(client)) {
      throw new HttpException('Too many attempts. Wait a minute and try again.', HttpStatus.TOO_MANY_REQUESTS);
    }
    if (this.auth.required && !this.auth.checkPassword(dto.password)) {
      this.auth.recordFailure(client);
      throw new UnauthorizedException('Wrong password');
    }
    this.auth.clearFailures(client);
    if (this.auth.required) {
      response.setHeader('Set-Cookie', cookie(this.auth.issueToken(), this.auth.sessionSeconds, request));
    }
    return { required: this.auth.required, authenticated: true };
  }

  @Public()
  @Post('logout')
  @HttpCode(204)
  logout(@Req() request: Request, @Res({ passthrough: true }) response: Response): void {
    response.setHeader('Set-Cookie', cookie('', 0, request));
  }
}

function cookie(value: string, maxAgeSeconds: number, request: Request): string {
  const secure = request.secure || request.headers['x-forwarded-proto'] === 'https';
  return [
    `${SESSION_COOKIE}=${encodeURIComponent(value)}`,
    'Path=/',
    'HttpOnly',
    'SameSite=Lax',
    `Max-Age=${maxAgeSeconds}`,
    ...(secure ? ['Secure'] : []),
  ].join('; ');
}
