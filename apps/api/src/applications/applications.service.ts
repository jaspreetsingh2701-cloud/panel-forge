import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { CreateApplicationDto } from './dto/create-application.dto';

@Injectable()
export class ApplicationsService {
  constructor(private readonly prisma: PrismaService) {}

  private async assertTenantAccess(userId: string, tenantId: string): Promise<void> {
    const membership = await this.prisma.tenantMember.findFirst({
      where: { userId, tenantId, status: 'ACTIVE', tenant: { status: 'ACTIVE' } },
      select: { id: true },
    });
    if (!membership) throw new ForbiddenException('You do not have access to this workspace.');
  }

  async findAll(userId: string, tenantId: string) {
    await this.assertTenantAccess(userId, tenantId);
    return this.prisma.application.findMany({
      where: { tenantId, status: 'DRAFT' },
      orderBy: { updatedAt: 'desc' },
      select: { id: true, name: true, description: true, template: true, status: true, createdAt: true, updatedAt: true },
    });
  }

  async create(userId: string, tenantId: string, dto: CreateApplicationDto) {
    await this.assertTenantAccess(userId, tenantId);
    return this.prisma.application.create({
      data: { tenantId, name: dto.name.trim(), description: dto.description?.trim() || null, template: dto.template ?? 'blank' },
      select: { id: true, name: true, description: true, template: true, status: true, createdAt: true, updatedAt: true },
    });
  }

  async archive(userId: string, tenantId: string, applicationId: string) {
    await this.assertTenantAccess(userId, tenantId);
    const result = await this.prisma.application.updateMany({
      where: { id: applicationId, tenantId, status: 'DRAFT' },
      data: { status: 'ARCHIVED' },
    });
    if (result.count !== 1) throw new NotFoundException('Application not found.');
    return { message: 'Application archived.' };
  }
}