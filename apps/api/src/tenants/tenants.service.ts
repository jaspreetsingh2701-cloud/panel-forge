
import { Injectable } from '@nestjs/common';

import { PrismaService } from '../database/prisma.service';

@Injectable()
export class TenantsService {
  constructor(private readonly prisma: PrismaService) {}

  async findForUser(userId: string) {
    // Query memberships belonging to this authenticated user only.
    const memberships = await this.prisma.tenantMember.findMany({
      where: {
        userId,
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
            status: true,
            createdAt: true,
          },
        },
      },
    });

    // Flatten the membership and tenant information.
    return memberships.map((membership) => ({
      ...membership.tenant,
      role: membership.role,
      joinedAt: membership.createdAt,
    }));
  }
}
