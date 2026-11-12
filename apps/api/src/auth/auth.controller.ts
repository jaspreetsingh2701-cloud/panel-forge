import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';

import { JwtService } from '@nestjs/jwt';
import type { Request, Response } from 'express';

import { env } from '../config/env';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { AccessTokenGuard } from './guards/access-token.guard';
import type { AuthenticatedRequest } from './interfaces/authenticated-request.interface';

const REFRESH_COOKIE_NAME = 'pf_refresh';
const SESSION_LIFETIME_MS = 30 * 24 * 60 * 60 * 1000;

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly jwtService: JwtService,
  ) { }

  @Post('register')
  async register(
    @Body() dto: RegisterDto,
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ) {
    const result = await this.authService.register(dto, {
      userAgent: request.get('user-agent'),
      ipAddress: request.ip,
    });

    // Keep the refresh token inaccessible to browser JavaScript.
    response.cookie(REFRESH_COOKIE_NAME, result.refreshToken, {
      httpOnly: true,
      secure: env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/api/v1/auth',
      maxAge: SESSION_LIFETIME_MS,
    });

    // The refresh token is returned only as a cookie, never in JSON.
    const { refreshToken, ...responseBody } = result;

    return responseBody;
  }

  @Post('login')
  async login(
    @Body() dto: LoginDto,
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ) {
    const result = await this.authService.login(dto, {
      userAgent: request.get('user-agent'),
      ipAddress: request.ip,
    });

    // Set the refresh token in an HttpOnly cookie.
    response.cookie(REFRESH_COOKIE_NAME, result.refreshToken, {
      httpOnly: true,
      secure: env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/api/v1/auth',
      maxAge: SESSION_LIFETIME_MS,
    });

    // Never expose the refresh token in the JSON response.
    const { refreshToken, ...responseBody } = result;

    return responseBody;
  }

  @Post('refresh')
  async refresh(
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ) {
    // Read the refresh token from the incoming Cookie header.
    const cookieHeader = request.headers.cookie ?? '';
    const cookiePrefix = `${REFRESH_COOKIE_NAME}=`;

    const refreshCookie = cookieHeader
      .split(';')
      .map((cookie) => cookie.trim())
      .find((cookie) => cookie.startsWith(cookiePrefix));

    const rawRefreshToken = refreshCookie
      ? refreshCookie.slice(cookiePrefix.length)
      : undefined;

    const result = await this.authService.refresh(rawRefreshToken);

    // Replace the old refresh cookie with the newly rotated token.
    response.cookie(REFRESH_COOKIE_NAME, result.refreshToken, {
      httpOnly: true,
      secure: env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/api/v1/auth',
      maxAge: SESSION_LIFETIME_MS,
    });

    // Never return the refresh token in JSON.
    const { refreshToken, ...responseBody } = result;

    return responseBody;
  }

  // Logout is intentionally not protected by AccessTokenGuard.
  // This allows repeated logout calls with the same valid JWT.
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ) {
    const authorization = request.headers.authorization;

    const match = authorization
      ? /^Bearer\s+(\S+)$/i.exec(authorization)
      : null;

    if (!match) {
      this.clearRefreshCookie(response);
      throw new UnauthorizedException();
    }

    let payload: { sub: string; sid: string };

    try {
      payload = await this.jwtService.verifyAsync(match[1]);
    } catch {
      this.clearRefreshCookie(response);
      throw new UnauthorizedException();
    }

    if (
      typeof payload.sub !== 'string' ||
      typeof payload.sid !== 'string'
    ) {
      this.clearRefreshCookie(response);
      throw new UnauthorizedException();
    }

    await this.authService.logout(payload.sub, payload.sid);

    this.clearRefreshCookie(response);

    return {
      message: 'Logged out successfully.',
    };
  }

  // Get the currently authenticated user's profile.
  @Get('me')
  @UseGuards(AccessTokenGuard)
  async me(@Req() request: AuthenticatedRequest) {
    return this.authService.getCurrentUser(request.user.userId);
  }

  // Clear the refresh cookie using the same path and security settings.
  private clearRefreshCookie(response: Response): void {
    response.clearCookie(REFRESH_COOKIE_NAME, {
      httpOnly: true,
      secure: env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/api/v1/auth',
    });
  }
}
