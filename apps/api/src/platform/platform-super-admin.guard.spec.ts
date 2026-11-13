import { ForbiddenException } from '@nestjs/common';
import type { ExecutionContext } from '@nestjs/common';
import type { PrismaService } from '../database/prisma.service';
import { PlatformSuperAdminGuard } from './platform-super-admin.guard';

describe('PlatformSuperAdminGuard', () => {
  const request = { user: { userId: 'user-1', sessionId: 'session-1' } };
  const context = {
    switchToHttp: () => ({ getRequest: () => request }),
  } as unknown as ExecutionContext;

  it('allows a platform Super Admin', async () => {
    const prisma = { user: { findUnique: jest.fn().mockResolvedValue({ platformRole: 'SUPER_ADMIN' }) } };
    const guard = new PlatformSuperAdminGuard(prisma as unknown as PrismaService);
    await expect(guard.canActivate(context)).resolves.toBe(true);
  });

  it('does not promote tenant administrators to platform Super Admin', async () => {
    const prisma = { user: { findUnique: jest.fn().mockResolvedValue({ platformRole: 'PLATFORM_USER' }) } };
    const guard = new PlatformSuperAdminGuard(prisma as unknown as PrismaService);
    await expect(guard.canActivate(context)).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('denies access when the user no longer exists', async () => {
    const prisma = { user: { findUnique: jest.fn().mockResolvedValue(null) } };
    const guard = new PlatformSuperAdminGuard(prisma as unknown as PrismaService);
    await expect(guard.canActivate(context)).rejects.toBeInstanceOf(ForbiddenException);
  });
});
