import { ConflictException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { ApplicationsService } from './applications.service';

describe('ApplicationsService', () => {
  const prisma = {
    tenantMember: { findFirst: jest.fn() },
    application: { findMany: jest.fn(), findFirst: jest.fn(), create: jest.fn(), updateMany: jest.fn() },
  };
  let service: ApplicationsService;
  beforeEach(() => { jest.clearAllMocks(); service = new ApplicationsService(prisma as never); });

  it('lists draft applications after verifying active workspace membership', async () => {
    prisma.tenantMember.findFirst.mockResolvedValue({ id: 'membership-1' });
    prisma.application.findMany.mockResolvedValue([{ id: 'app-1' }]);
    await expect(service.findAll('user-1', 'tenant-1')).resolves.toEqual([{ id: 'app-1' }]);
    expect(prisma.application.findMany).toHaveBeenCalledWith(expect.objectContaining({ where: { tenantId: 'tenant-1', status: 'DRAFT' } }));
  });

  it('rejects users without active membership before querying applications', async () => {
    prisma.tenantMember.findFirst.mockResolvedValue(null);
    await expect(service.findAll('user-1', 'tenant-2')).rejects.toBeInstanceOf(ForbiddenException);
    expect(prisma.application.findMany).not.toHaveBeenCalled();
  });

  it('denies application creation to regular workspace members', async () => {
    prisma.tenantMember.findFirst.mockResolvedValue({ role: 'MEMBER' });
    await expect(service.create('user-1', 'tenant-1', { name: 'Inventory' })).rejects.toBeInstanceOf(ForbiddenException);
    expect(prisma.application.create).not.toHaveBeenCalled();
  });

  it('creates an application under the authorised tenant and normalises text', async () => {
    prisma.tenantMember.findFirst.mockResolvedValue({ role: 'OWNER' });
    prisma.application.create.mockResolvedValue({ id: 'app-1' });
    await service.create('user-1', 'tenant-1', { name: ' Inventory ', description: ' Manage stock ', template: 'operations' });
    expect(prisma.application.create).toHaveBeenCalledWith(expect.objectContaining({ data: { tenantId: 'tenant-1', name: 'Inventory', description: 'Manage stock', template: 'operations' } }));
  });

  it('restores a saved builder configuration only after checking workspace membership', async () => {
    const updatedAt = new Date('2026-11-13T10:00:00.000Z');
    prisma.tenantMember.findFirst.mockResolvedValue({ id: 'membership-1' });
    prisma.application.findFirst.mockResolvedValue({ pageConfig: [{ id: 'component-1' }], updatedAt });
    await expect(service.getBuilderConfiguration('user-1', 'tenant-1', 'app-1')).resolves.toEqual({
      components: [{ id: 'component-1' }],
      updatedAt,
    });
    expect(prisma.application.findFirst).toHaveBeenCalledWith(expect.objectContaining({
      where: { id: 'app-1', tenantId: 'tenant-1', status: 'DRAFT' },
    }));
  });

  it('does not expose a builder configuration from another tenant', async () => {
    prisma.tenantMember.findFirst.mockResolvedValue({ id: 'membership-1' });
    prisma.application.findFirst.mockResolvedValue(null);
    await expect(service.getBuilderConfiguration('user-1', 'tenant-1', 'foreign-app')).rejects.toBeInstanceOf(NotFoundException);
  });

  it('saves a validated configuration for a workspace owner using optimistic concurrency', async () => {
    const expectedUpdatedAt = '2026-11-13T10:00:00.000Z';
    const updatedAt = new Date('2026-11-13T10:01:00.000Z');
    const components = [{ id: 'component-1', type: 'text' }];
    prisma.tenantMember.findFirst.mockResolvedValue({ role: 'OWNER' });
    prisma.application.findFirst
      .mockResolvedValueOnce({ id: 'app-1' })
      .mockResolvedValueOnce({ pageConfig: components, updatedAt });
    prisma.application.updateMany.mockResolvedValue({ count: 1 });
    await expect(service.saveBuilderConfiguration('user-1', 'tenant-1', 'app-1', {
      expectedUpdatedAt, components,
    } as never)).resolves.toEqual({ components, updatedAt });
    expect(prisma.application.updateMany).toHaveBeenCalledWith(expect.objectContaining({
      where: { id: 'app-1', tenantId: 'tenant-1', status: 'DRAFT', updatedAt: new Date(expectedUpdatedAt) },
      data: { pageConfig: components },
    }));
  });

  it('rejects saves from regular workspace members', async () => {
    prisma.tenantMember.findFirst.mockResolvedValue({ role: 'MEMBER' });
    await expect(service.saveBuilderConfiguration('user-1', 'tenant-1', 'app-1', {
      expectedUpdatedAt: new Date().toISOString(), components: [],
    } as never)).rejects.toBeInstanceOf(ForbiddenException);
    expect(prisma.application.updateMany).not.toHaveBeenCalled();
  });

  it('rejects stale builder saves rather than overwriting newer changes', async () => {
    prisma.tenantMember.findFirst.mockResolvedValue({ role: 'ADMIN' });
    prisma.application.findFirst.mockResolvedValue({ id: 'app-1' });
    prisma.application.updateMany.mockResolvedValue({ count: 0 });
    await expect(service.saveBuilderConfiguration('user-1', 'tenant-1', 'app-1', {
      expectedUpdatedAt: '2026-11-13T09:00:00.000Z', components: [],
    } as never)).rejects.toBeInstanceOf(ConflictException);
  });

  it('cannot archive an application outside the requested tenant', async () => {
    prisma.tenantMember.findFirst.mockResolvedValue({ role: 'OWNER' });
    prisma.application.updateMany.mockResolvedValue({ count: 0 });
    await expect(service.archive('user-1', 'tenant-1', 'foreign-app')).rejects.toBeInstanceOf(NotFoundException);
    expect(prisma.application.updateMany).toHaveBeenCalledWith(expect.objectContaining({ where: { id: 'foreign-app', tenantId: 'tenant-1', status: 'DRAFT' } }));
  });
});