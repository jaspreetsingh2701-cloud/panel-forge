import {
  ConflictException,
  Injectable,
  UnauthorizedException
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as argon2 from 'argon2';
import { createHash, randomBytes } from 'node:crypto';

import { PrismaService } from '../database/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

const SESSION_LIFETIME_MS = 30 * 24 * 60 * 60 * 1000;

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) { }

  async register(
    dto: RegisterDto,
    metadata: {
      userAgent?: string;
      ipAddress?: string;
    },
  ) {
    const email = dto.email.trim().toLowerCase();
    const tenantName = dto.tenantName.trim();

    // Hash the password before persisting anything.
    const passwordHash = await argon2.hash(dto.password, {
      type: argon2.argon2id,
    });

    // Generate a cryptographically random refresh token.
    // Only its SHA-256 hash will be stored in PostgreSQL.
    const refreshToken = randomBytes(32).toString('base64url');
    const refreshTokenHash = this.hashToken(refreshToken);

    const now = new Date();
    const sessionExpiresAt = new Date(
      now.getTime() + SESSION_LIFETIME_MS,
    );

    // Generate a readable workspace slug with a random suffix.
    const tenantSlug = this.createTenantSlug(tenantName);

    try {
      // All registration records must succeed or fail together.
      const registration = await this.prisma.$transaction(
        async (tx) => {
          const user = await tx.user.create({
            data: {
              email,
              passwordHash,
              displayName: dto.displayName?.trim() || null,
            },
            select: {
              id: true,
              email: true,
              displayName: true,
            },
          });

          const tenant = await tx.tenant.create({
            data: {
              name: tenantName,
              slug: tenantSlug,
            },
            select: {
              id: true,
              name: true,
              slug: true,
            },
          });

          // The first registered user becomes the workspace OWNER.
          await tx.tenantMember.create({
            data: {
              userId: user.id,
              tenantId: tenant.id,
              role: 'OWNER',
            },
          });

          const session = await tx.authSession.create({
            data: {
              userId: user.id,
              userAgent: metadata.userAgent?.slice(0, 512),
              ipAddress: metadata.ipAddress?.slice(0, 45),
              lastUsedAt: now,
              expiresAt: sessionExpiresAt,
            },
            select: {
              id: true,
            },
          });

          await tx.refreshToken.create({
            data: {
              sessionId: session.id,
              tokenHash: refreshTokenHash,
              expiresAt: sessionExpiresAt,
            },
          });

          return { user, tenant, session };
        },
      );

      // Sign the access token after the database transaction commits.
      const accessToken = await this.jwtService.signAsync({
        sub: registration.user.id,
        sid: registration.session.id,
      });

      return {
        accessToken,
        refreshToken,
        tokenType: 'Bearer',
        expiresIn: '15m',
        user: registration.user,
        tenant: registration.tenant,
      };
    } catch (error: unknown) {
      // Handle unique-constraint conflicts, including concurrent requests.
      if (
        typeof error === 'object' &&
        error !== null &&
        'code' in error &&
        error.code === 'P2002'
      ) {
        throw new ConflictException(
          'An account with this email or workspace already exists.',
        );
      }

      throw error;
    }
  }

  // Revoke the current session and all refresh tokens belonging to it.
  // updateMany makes this operation safe to call repeatedly.
  async logout(userId: string, sessionId: string): Promise<void> {
    const now = new Date();

    await this.prisma.$transaction(async (tx) => {
      await tx.authSession.updateMany({
        where: {
          id: sessionId,
          userId,
          revokedAt: null,
        },
        data: {
          revokedAt: now,
        },
      });

      await tx.refreshToken.updateMany({
        where: {
          sessionId,
          revokedAt: null,
        },
        data: {
          revokedAt: now,
        },
      });
    });
  }

  // Return the authenticated user's safe profile and active memberships.
  async getCurrentUser(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        displayName: true,
        emailVerifiedAt: true,
        platformRole: true,
        createdAt: true,

        // Only return active workspace memberships.
        memberships: {
          where: {
            status: 'ACTIVE',
            tenant: {
              status: 'ACTIVE',
            },
          },
          orderBy: {
            createdAt: 'asc',
          },
          select: {
            role: true,
            createdAt: true,
            tenant: {
              select: {
                id: true,
                name: true,
                slug: true,
              },
            },
          },
        },
      },
    });

    if (!user) {
      throw new UnauthorizedException();
    }

    return {
      id: user.id,
      email: user.email,
      displayName: user.displayName,
      emailVerifiedAt: user.emailVerifiedAt,
      platformRole: user.platformRole,
      createdAt: user.createdAt,

      tenants: user.memberships.map((membership) => ({
        ...membership.tenant,
        role: membership.role,
        joinedAt: membership.createdAt,
      })),
    };
  }

  private hashToken(token: string): string {
    return createHash('sha256').update(token).digest('hex');
  }

  async refresh(rawRefreshToken?: string) {
    if (!rawRefreshToken) {
      throw new UnauthorizedException('Invalid or expired refresh token.');
    }

    const tokenHash = this.hashToken(rawRefreshToken);
    const now = new Date();

    // All rotation operations happen in one database transaction.
    const rotation = await this.prisma.$transaction(async (tx) => {
      const currentToken = await tx.refreshToken.findUnique({
        where: { tokenHash },
        include: { session: true },
      });

      // Unknown token: nothing to revoke.
      if (!currentToken) {
        return { status: 'invalid' as const };
      }

      // Reuse of a consumed token indicates possible token theft.
      // Revoke the entire session and all its refresh tokens.
      if (currentToken.consumedAt) {
        await tx.authSession.updateMany({
          where: {
            id: currentToken.sessionId,
            revokedAt: null,
          },
          data: { revokedAt: now },
        });

        await tx.refreshToken.updateMany({
          where: {
            sessionId: currentToken.sessionId,
            revokedAt: null,
          },
          data: { revokedAt: now },
        });

        return { status: 'replay' as const };
      }

      // Reject revoked or expired tokens and sessions.
      if (
        currentToken.revokedAt ||
        currentToken.expiresAt <= now ||
        currentToken.session.revokedAt ||
        currentToken.session.expiresAt <= now
      ) {
        return { status: 'invalid' as const };
      }

      // Atomically claim this token so concurrent refresh requests
      // cannot both successfully rotate it.
      const consumed = await tx.refreshToken.updateMany({
        where: {
          id: currentToken.id,
          consumedAt: null,
          revokedAt: null,
          expiresAt: { gt: now },
        },
        data: {
          consumedAt: now,
        },
      });

      if (consumed.count !== 1) {
        // Another request may have consumed this token first.
        // Revoke the session to protect against replay.
        await tx.authSession.updateMany({
          where: {
            id: currentToken.sessionId,
            revokedAt: null,
          },
          data: { revokedAt: now },
        });

        await tx.refreshToken.updateMany({
          where: {
            sessionId: currentToken.sessionId,
            revokedAt: null,
          },
          data: { revokedAt: now },
        });

        return { status: 'replay' as const };
      }

      // Generate the replacement refresh token.
      const newRefreshToken = randomBytes(32).toString('base64url');
      const newTokenHash = this.hashToken(newRefreshToken);

      const newToken = await tx.refreshToken.create({
        data: {
          sessionId: currentToken.sessionId,
          tokenHash: newTokenHash,
          expiresAt: currentToken.session.expiresAt,
        },
        select: {
          id: true,
        },
      });

      // Link the consumed token to its replacement.
      await tx.refreshToken.update({
        where: { id: currentToken.id },
        data: {
          rotatedToTokenId: newToken.id,
        },
      });

      // Record recent session activity.
      await tx.authSession.update({
        where: { id: currentToken.sessionId },
        data: { lastUsedAt: now },
      });

      return {
        status: 'success' as const,
        userId: currentToken.session.userId,
        sessionId: currentToken.sessionId,
        refreshToken: newRefreshToken,
      };
    });

    // Important: throw AFTER the transaction commits.
    // Otherwise, replay-triggered revocation would be rolled back.
    if (rotation.status !== 'success') {
      throw new UnauthorizedException('Invalid or expired refresh token.');
    }

    const accessToken = await this.jwtService.signAsync({
      sub: rotation.userId,
      sid: rotation.sessionId,
    });

    return {
      accessToken,
      refreshToken: rotation.refreshToken,
      tokenType: 'Bearer',
      expiresIn: '15m',
    };
  }

  async login(
    dto: LoginDto,
    metadata: {
      userAgent?: string;
      ipAddress?: string;
    },
  ) {
    const email = dto.email.trim().toLowerCase();

    // Find the user by normalized email.
    const user = await this.prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        displayName: true,
        passwordHash: true,
      },
    });

    // Use the same error for unknown users and incorrect passwords.
    if (!user || !user.passwordHash) {
      throw new UnauthorizedException('Invalid email or password.');
    }

    // Verify the submitted password against the stored Argon2id hash.
    let passwordIsValid = false;

    try {
      passwordIsValid = await argon2.verify(
        user.passwordHash,
        dto.password,
      );
    } catch {
      // Treat an invalid stored hash as failed authentication.
      passwordIsValid = false;
    }

    if (!passwordIsValid) {
      throw new UnauthorizedException('Invalid email or password.');
    }

    // Create a separate session for this login/device.
    const now = new Date();
    const sessionExpiresAt = new Date(
      now.getTime() + SESSION_LIFETIME_MS,
    );

    // Generate a new refresh token; persist only its hash.
    const refreshToken = randomBytes(32).toString('base64url');
    const refreshTokenHash = this.hashToken(refreshToken);

    const session = await this.prisma.$transaction(async (tx) => {
      const newSession = await tx.authSession.create({
        data: {
          userId: user.id,
          userAgent: metadata.userAgent?.slice(0, 512),
          ipAddress: metadata.ipAddress?.slice(0, 45),
          lastUsedAt: now,
          expiresAt: sessionExpiresAt,
        },
        select: {
          id: true,
        },
      });

      await tx.refreshToken.create({
        data: {
          sessionId: newSession.id,
          tokenHash: refreshTokenHash,
          expiresAt: sessionExpiresAt,
        },
      });

      return newSession;
    });

    // Issue a short-lived access JWT for this session.
    const accessToken = await this.jwtService.signAsync({
      sub: user.id,
      sid: session.id,
    });

    return {
      accessToken,
      refreshToken,
      tokenType: 'Bearer',
      expiresIn: '15m',
      user: {
        id: user.id,
        email: user.email,
        displayName: user.displayName,
      },
    };
  }

  private createTenantSlug(name: string): string {
    const base = name
      .normalize('NFKD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
      .slice(0, 60);

    const readableSlug = base || 'workspace';
    const uniqueSuffix = randomBytes(6).toString('hex');

    return `${readableSlug}-${uniqueSuffix}`;
  }
}
