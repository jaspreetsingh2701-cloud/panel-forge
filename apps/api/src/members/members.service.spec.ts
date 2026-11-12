import { ConflictException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { MembersService } from './members.service';
describe('MembersService', () => {
 const prisma = {
  tenantMember: { findFirst: jest.fn(), findMany: jest.fn() },
  workspaceInvitation: { findFirst: jest.fn(), findMany: jest.fn(), create: jest.fn(), updateMany: jest.fn() },
 };
 let service: MembersService;
 beforeEach(() => { jest.clearAllMocks(); service = new MembersService(prisma as never); });
 it('denies invitation management to regular members', async () => {
  prisma.tenantMember.findFirst.mockResolvedValue({ role: 'MEMBER' });
  await expect(service.listMembers('u1','t1')).rejects.toBeInstanceOf(ForbiddenException);
  expect(prisma.tenantMember.findMany).not.toHaveBeenCalled();
 });
 it('lists active members for an owner', async () => {
  prisma.tenantMember.findFirst.mockResolvedValue({ role: 'OWNER' });
  prisma.tenantMember.findMany.mockResolvedValue([{ id: 'm1' }]);
  await expect(service.listMembers('u1','t1')).resolves.toEqual([{ id: 'm1' }]);
 });
 it('normalises email and persists a seven-day invitation', async () => {
  prisma.tenantMember.findFirst.mockResolvedValueOnce({ role: 'ADMIN' }).mockResolvedValueOnce(null);
  prisma.workspaceInvitation.findFirst.mockResolvedValue(null);
  prisma.workspaceInvitation.create.mockImplementation(async ({ data }) => data);
  const result = await service.createInvitation('u1','t1',{ email: ' Person@Example.com ' });
  expect(prisma.workspaceInvitation.create).toHaveBeenCalledWith(expect.objectContaining({ data: expect.objectContaining({ tenantId:'t1', email:'person@example.com', role:'MEMBER' }) }));
  expect(result.expiresAt).toBeInstanceOf(Date);
 });
 it('rejects duplicate active members', async () => {
  prisma.tenantMember.findFirst.mockResolvedValueOnce({ role:'OWNER' }).mockResolvedValueOnce({ id:'m1' });
  await expect(service.createInvitation('u1','t1',{email:'a@b.com'})).rejects.toBeInstanceOf(ConflictException);
 });
 it('scopes invitation revocation to tenant', async () => {
  prisma.tenantMember.findFirst.mockResolvedValue({role:'OWNER'});
  prisma.workspaceInvitation.updateMany.mockResolvedValue({count:0});
  await expect(service.revokeInvitation('u1','t1','foreign')).rejects.toBeInstanceOf(NotFoundException);
  expect(prisma.workspaceInvitation.updateMany).toHaveBeenCalledWith(expect.objectContaining({where:{id:'foreign',tenantId:'t1',status:'PENDING'}}));
 });
});