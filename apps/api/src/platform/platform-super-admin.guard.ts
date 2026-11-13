import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import type { AuthenticatedRequest } from '../auth/interfaces/authenticated-request.interface';

@Injectable()
export class PlatformSuperAdminGuard implements CanActivate {
  constructor(private readonly prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const user = await this.prisma.user.findUnique({
      where: { id: request.user.userId },
      select: { platformRole: true },
    });
    if (user?.platformRole !== 'SUPER_ADMIN') {
      throw new ForbiddenException('Platform Super Admin access is required.');
    }
    return true;
  }
}
