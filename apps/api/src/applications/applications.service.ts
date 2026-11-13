import { ConflictException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { CreateApplicationDto } from './dto/create-application.dto';
import { SaveBuilderConfigurationDto } from './dto/save-builder-configuration.dto';

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

  private async assertTenantManager(userId: string, tenantId: string): Promise<void> {
    const membership = await this.prisma.tenantMember.findFirst({
      where: { userId, tenantId, status: 'ACTIVE', tenant: { status: 'ACTIVE' } },
      select: { role: true },
    });
    if (!membership || !['OWNER', 'ADMIN'].includes(membership.role)) {
      throw new ForbiddenException('Only workspace owners and admins can manage applications.');
    }
  }

  async create(userId: string, tenantId: string, dto: CreateApplicationDto) {
    await this.assertTenantManager(userId, tenantId);
    return this.prisma.application.create({
      data: { tenantId, name: dto.name.trim(), description: dto.description?.trim() || null, template: dto.template ?? 'blank' },
      select: { id: true, name: true, description: true, template: true, status: true, createdAt: true, updatedAt: true },
    });
  }

  async getBuilderConfiguration(userId: string, tenantId: string, applicationId: string) {
    await this.assertTenantAccess(userId, tenantId);
    const application = await this.prisma.application.findFirst({
      where: { id: applicationId, tenantId, status: 'DRAFT' },
      select: { pageConfig: true, updatedAt: true },
    });
    if (!application) throw new NotFoundException('Application not found.');
    return {
      components: application.pageConfig ?? [],
      updatedAt: application.updatedAt,
    };
  }

  async saveBuilderConfiguration(
    userId: string,
    tenantId: string,
    applicationId: string,
    dto: SaveBuilderConfigurationDto,
  ) {
    await this.assertTenantManager(userId, tenantId);
    const application = await this.prisma.application.findFirst({
      where: { id: applicationId, tenantId, status: 'DRAFT' },
      select: { id: true },
    });
    if (!application) throw new NotFoundException('Application not found.');

    const result = await this.prisma.application.updateMany({
      where: {
        id: applicationId,
        tenantId,
        status: 'DRAFT',
        updatedAt: new Date(dto.expectedUpdatedAt),
      },
      data: { pageConfig: dto.components as never },
    });
    if (result.count !== 1) {
      throw new ConflictException('This application changed after you opened the builder. Reload the saved version before saving again.');
    }

    const saved = await this.prisma.application.findFirst({
      where: { id: applicationId, tenantId, status: 'DRAFT' },
      select: { pageConfig: true, updatedAt: true },
    });
    if (!saved) throw new NotFoundException('Application not found.');
    return { components: saved.pageConfig ?? [], updatedAt: saved.updatedAt };
  }

  async archive(userId: string, tenantId: string, applicationId: string) {
    await this.assertTenantManager(userId, tenantId);
    const result = await this.prisma.application.updateMany({
      where: { id: applicationId, tenantId, status: 'DRAFT' },
      data: { status: 'ARCHIVED' },
    });
    if (result.count !== 1) throw new NotFoundException('Application not found.');
    return { message: 'Application archived.' };
  }
}