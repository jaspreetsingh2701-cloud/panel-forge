import { ConflictException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { CreateInvitationDto } from './dto/create-invitation.dto';
@Injectable()
export class MembersService {
  constructor(private readonly prisma: PrismaService) {}
  private async assertManager(userId: string, tenantId: string) {
    const membership = await this.prisma.tenantMember.findFirst({
      where: { userId, tenantId, status: 'ACTIVE', tenant: { status: 'ACTIVE' } },
      select: { role: true },
    });
    if (!membership || !['OWNER', 'ADMIN'].includes(membership.role)) throw new ForbiddenException('Only workspace owners and admins can manage invitations.');
  }
  async listMembers(userId: string, tenantId: string) {
    await this.assertManager(userId, tenantId);
    return this.prisma.tenantMember.findMany({
      where: { tenantId, status: 'ACTIVE' }, orderBy: { createdAt: 'asc' },
      select: { id: true, role: true, status: true, createdAt: true, user: { select: { id: true, email: true, displayName: true } } },
    });
  }
  async listInvitations(userId: string, tenantId: string) {
    await this.assertManager(userId, tenantId);
    return this.prisma.workspaceInvitation.findMany({
      where: { tenantId, status: 'PENDING', expiresAt: { gt: new Date() } }, orderBy: { createdAt: 'desc' },
      select: { id: true, email: true, role: true, status: true, expiresAt: true, createdAt: true },
    });
  }
  async createInvitation(userId: string, tenantId: string, dto: CreateInvitationDto) {
    await this.assertManager(userId, tenantId);
    const email = dto.email.trim().toLowerCase();
    const member = await this.prisma.tenantMember.findFirst({ where: { tenantId, status: 'ACTIVE', user: { email } }, select: { id: true } });
    if (member) throw new ConflictException('This person is already a workspace member.');
    const pending = await this.prisma.workspaceInvitation.findFirst({
      where: { tenantId, email, status: 'PENDING', expiresAt: { gt: new Date() } }, select: { id: true },
    });
    if (pending) throw new ConflictException('An active invitation already exists for this email.');
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    return this.prisma.workspaceInvitation.create({
      data: { tenantId, email, role: dto.role ?? 'MEMBER', expiresAt },
      select: { id: true, email: true, role: true, status: true, expiresAt: true, createdAt: true },
    });
  }
  async revokeInvitation(userId: string, tenantId: string, invitationId: string) {
    await this.assertManager(userId, tenantId);
    const result = await this.prisma.workspaceInvitation.updateMany({
      where: { id: invitationId, tenantId, status: 'PENDING' }, data: { status: 'REVOKED' },
    });
    if (result.count !== 1) throw new NotFoundException('Pending invitation not found.');
    return { message: 'Invitation revoked.' };
  }
}