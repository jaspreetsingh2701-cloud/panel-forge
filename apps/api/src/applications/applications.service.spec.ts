import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { ApplicationsService } from './applications.service';

describe('ApplicationsService', () => {
  const prisma = {
    tenantMember: { findFirst: jest.fn() },
    application: { findMany: jest.fn(), create: jest.fn(), updateMany: jest.fn() },
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

  it('creates an application under the authorised tenant and normalises text', async () => {
    prisma.tenantMember.findFirst.mockResolvedValue({ id: 'membership-1' });
    prisma.application.create.mockResolvedValue({ id: 'app-1' });
    await service.create('user-1', 'tenant-1', { name: ' Inventory ', description: ' Manage stock ', template: 'operations' });
    expect(prisma.application.create).toHaveBeenCalledWith(expect.objectContaining({ data: { tenantId: 'tenant-1', name: 'Inventory', description: 'Manage stock', template: 'operations' } }));
  });

  it('cannot archive an application outside the requested tenant', async () => {
    prisma.tenantMember.findFirst.mockResolvedValue({ id: 'membership-1' });
    prisma.application.updateMany.mockResolvedValue({ count: 0 });
    await expect(service.archive('user-1', 'tenant-1', 'foreign-app')).rejects.toBeInstanceOf(NotFoundException);
    expect(prisma.application.updateMany).toHaveBeenCalledWith(expect.objectContaining({ where: { id: 'foreign-app', tenantId: 'tenant-1', status: 'DRAFT' } }));
  });
});