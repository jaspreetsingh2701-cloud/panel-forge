import {
  Body, Controller, Get, HttpCode, HttpStatus, Post, Req, Res,
  UnauthorizedException, UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiCookieAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
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

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService, private readonly jwtService: JwtService) {}

  @Post('register')
  @ApiOperation({ summary: 'Register a user and create their first workspace' })
  @ApiResponse({ status: 201, description: 'User and workspace created; refresh token is set as an HttpOnly cookie.' })
  @ApiResponse({ status: 400, description: 'Request validation failed.' })
  async register(@Body() dto: RegisterDto, @Req() request: Request, @Res({ passthrough: true }) response: Response) {
    const result = await this.authService.register(dto, { userAgent: request.get('user-agent'), ipAddress: request.ip });
    response.cookie(REFRESH_COOKIE_NAME, result.refreshToken, {
      httpOnly: true, secure: env.NODE_ENV === 'production', sameSite: 'lax',
      path: '/api/v1/auth', maxAge: SESSION_LIFETIME_MS,
    });
    const responseBody = { ...result };
    delete (responseBody as Partial<typeof result>).refreshToken;
    return responseBody;
  }

  @Post('login')
  @ApiOperation({ summary: 'Authenticate a user' })
  @ApiResponse({ status: 201, description: 'Authenticated; refresh token is set as an HttpOnly cookie.' })
  @ApiResponse({ status: 401, description: 'Invalid credentials.' })
  async login(@Body() dto: LoginDto, @Req() request: Request, @Res({ passthrough: true }) response: Response) {
    const result = await this.authService.login(dto, { userAgent: request.get('user-agent'), ipAddress: request.ip });
    response.cookie(REFRESH_COOKIE_NAME, result.refreshToken, {
      httpOnly: true, secure: env.NODE_ENV === 'production', sameSite: 'lax',
      path: '/api/v1/auth', maxAge: SESSION_LIFETIME_MS,
    });
    const responseBody = { ...result };
    delete (responseBody as Partial<typeof result>).refreshToken;
    return responseBody;
  }

  @Post('refresh')
  @ApiOperation({ summary: 'Rotate the refresh token from the HttpOnly cookie' })
  @ApiCookieAuth('pf_refresh')
  @ApiResponse({ status: 201, description: 'Access token refreshed and refresh cookie rotated.' })
  @ApiResponse({ status: 401, description: 'Refresh token is missing, invalid, or expired.' })
  async refresh(@Req() request: Request, @Res({ passthrough: true }) response: Response) {
    const cookieHeader = request.headers.cookie ?? '';
    const cookiePrefix = `${REFRESH_COOKIE_NAME}=`;
    const refreshCookie = cookieHeader.split(';').map((cookie) => cookie.trim()).find((cookie) => cookie.startsWith(cookiePrefix));
    const rawRefreshToken = refreshCookie ? refreshCookie.slice(cookiePrefix.length) : undefined;
    const result = await this.authService.refresh(rawRefreshToken);
    response.cookie(REFRESH_COOKIE_NAME, result.refreshToken, {
      httpOnly: true, secure: env.NODE_ENV === 'production', sameSite: 'lax',
      path: '/api/v1/auth', maxAge: SESSION_LIFETIME_MS,
    });
    const responseBody = { ...result };
    delete (responseBody as Partial<typeof result>).refreshToken;
    return responseBody;
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Revoke the current session and clear the refresh cookie' })
  @ApiResponse({ status: 200, description: 'Session revoked and refresh cookie cleared.' })
  @ApiResponse({ status: 401, description: 'Access token is missing or invalid.' })
  async logout(@Req() request: Request, @Res({ passthrough: true }) response: Response) {
    const authorization = request.headers.authorization;
    const match = authorization ? /^Bearer\s+(\S+)$/i.exec(authorization) : null;
    if (!match) { this.clearRefreshCookie(response); throw new UnauthorizedException(); }
    let payload: { sub: string; sid: string };
    try { payload = await this.jwtService.verifyAsync(match[1]); }
    catch { this.clearRefreshCookie(response); throw new UnauthorizedException(); }
    if (typeof payload.sub !== 'string' || typeof payload.sid !== 'string') {
      this.clearRefreshCookie(response); throw new UnauthorizedException();
    }
    await this.authService.logout(payload.sub, payload.sid);
    this.clearRefreshCookie(response);
    return { message: 'Logged out successfully.' };
  }

  @Get('me')
  @UseGuards(AccessTokenGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get the authenticated user profile' })
  @ApiResponse({ status: 200, description: 'Current user profile.' })
  @ApiResponse({ status: 401, description: 'Authentication is required.' })
  async me(@Req() request: AuthenticatedRequest) {
    return this.authService.getCurrentUser(request.user.userId);
  }

  private clearRefreshCookie(response: Response): void {
    response.clearCookie(REFRESH_COOKIE_NAME, {
      httpOnly: true, secure: env.NODE_ENV === 'production', sameSite: 'lax', path: '/api/v1/auth',
    });
  }
}