import { ConflictException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { MembersService } from './members.service';
describe('MembersService',()=>{
 const prisma={tenantMember:{findFirst:jest.fn(),findMany:jest.fn(),update:jest.fn()},workspaceInvitation:{findFirst:jest.fn(),findMany:jest.fn(),create:jest.fn(),updateMany:jest.fn()}};
 let service:MembersService;
 beforeEach(()=>{jest.clearAllMocks();service=new MembersService(prisma as never);});
 it('denies invitation management to regular members',async()=>{prisma.tenantMember.findFirst.mockResolvedValue({role:'MEMBER'});await expect(service.listInvitations('u','t')).rejects.toBeInstanceOf(ForbiddenException);});
 it('allows an active regular member to view the member directory',async()=>{prisma.tenantMember.findFirst.mockResolvedValue({role:'MEMBER'});prisma.tenantMember.findMany.mockResolvedValue([{id:'m1'}]);await expect(service.listMembers('u','t')).resolves.toEqual([{id:'m1'}]);});
 it('allows only owners to change roles',async()=>{prisma.tenantMember.findFirst.mockResolvedValue({role:'ADMIN'});await expect(service.updateMemberRole('u','t','m','MEMBER')).rejects.toBeInstanceOf(ForbiddenException);});
 it('prevents changing the owner role',async()=>{prisma.tenantMember.findFirst.mockResolvedValue({role:'OWNER'});prisma.tenantMember.findFirst.mockResolvedValueOnce({role:'OWNER'}).mockResolvedValueOnce({id:'m',role:'OWNER',userId:'u'});await expect(service.updateMemberRole('u','t','m','ADMIN')).rejects.toBeInstanceOf(ConflictException);});
 it('scopes member role changes to the current tenant',async()=>{prisma.tenantMember.findFirst.mockResolvedValueOnce({role:'OWNER'}).mockResolvedValueOnce(null);await expect(service.updateMemberRole('u','t','foreign','MEMBER')).rejects.toBeInstanceOf(NotFoundException);expect(prisma.tenantMember.update).not.toHaveBeenCalled();});
 it('normalises invitation email and scopes revocation',async()=>{prisma.tenantMember.findFirst.mockResolvedValueOnce({role:'ADMIN'}).mockResolvedValueOnce(null);prisma.workspaceInvitation.findFirst.mockResolvedValue(null);prisma.workspaceInvitation.create.mockImplementation(async({data})=>data);const result=await service.createInvitation('u','t',{email:' PERSON@EXAMPLE.COM '});expect(result.email).toBe('person@example.com');});
});