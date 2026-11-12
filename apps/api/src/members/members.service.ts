import { ConflictException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { CreateInvitationDto } from './dto/create-invitation.dto';
@Injectable()
export class MembersService {
 constructor(private readonly prisma:PrismaService){}
 private async memberAccess(userId:string,tenantId:string){
  const m=await this.prisma.tenantMember.findFirst({where:{userId,tenantId,status:'ACTIVE',tenant:{status:'ACTIVE'}},select:{role:true}});
  if(!m)throw new ForbiddenException('You do not have access to this workspace.');
 }
 private async manager(userId:string,tenantId:string,ownerOnly=false){
  const m=await this.prisma.tenantMember.findFirst({where:{userId,tenantId,status:'ACTIVE',tenant:{status:'ACTIVE'}},select:{role:true}});
  if(!m||!(ownerOnly?m.role==='OWNER':['OWNER','ADMIN'].includes(m.role))) throw new ForbiddenException(ownerOnly?'Only the workspace owner can change member roles.':'Only workspace owners and admins can manage invitations.');
 }
 async listMembers(userId:string,tenantId:string){
  await this.memberAccess(userId,tenantId);
  return this.prisma.tenantMember.findMany({where:{tenantId,status:'ACTIVE'},orderBy:{createdAt:'asc'},select:{id:true,role:true,status:true,createdAt:true,user:{select:{id:true,email:true,displayName:true}}}});
 }
 async updateMemberRole(userId:string,tenantId:string,memberId:string,role:'ADMIN'|'MEMBER'){
  await this.manager(userId,tenantId,true);
  const target=await this.prisma.tenantMember.findFirst({where:{id:memberId,tenantId,status:'ACTIVE'},select:{id:true,role:true,userId:true}});
  if(!target) throw new NotFoundException('Workspace member not found.');
  if(target.role==='OWNER') throw new ConflictException('The workspace owner role cannot be changed here.');
  await this.prisma.tenantMember.update({where:{id:memberId},data:{role}});
  return {message:'Member role updated.'};
 }
 async listInvitations(userId:string,tenantId:string){
  await this.manager(userId,tenantId);
  return this.prisma.workspaceInvitation.findMany({where:{tenantId,status:'PENDING',expiresAt:{gt:new Date()}},orderBy:{createdAt:'desc'},select:{id:true,email:true,role:true,status:true,expiresAt:true,createdAt:true}});
 }
 async createInvitation(userId:string,tenantId:string,dto:CreateInvitationDto){
  await this.manager(userId,tenantId);
  const email=dto.email.trim().toLowerCase();
  const member=await this.prisma.tenantMember.findFirst({where:{tenantId,status:'ACTIVE',user:{email}},select:{id:true}});
  if(member) throw new ConflictException('This person is already a workspace member.');
  const pending=await this.prisma.workspaceInvitation.findFirst({where:{tenantId,email,status:'PENDING',expiresAt:{gt:new Date()}},select:{id:true}});
  if(pending) throw new ConflictException('An active invitation already exists for this email.');
  const expiresAt=new Date(Date.now()+7*24*60*60*1000);
  return this.prisma.workspaceInvitation.create({data:{tenantId,email,role:dto.role??'MEMBER',expiresAt},select:{id:true,email:true,role:true,status:true,expiresAt:true,createdAt:true}});
 }
 async revokeInvitation(userId:string,tenantId:string,id:string){
  await this.manager(userId,tenantId);
  const result=await this.prisma.workspaceInvitation.updateMany({where:{id,tenantId,status:'PENDING'},data:{status:'REVOKED'}});
  if(result.count!==1) throw new NotFoundException('Pending invitation not found.');
  return {message:'Invitation revoked.'};
 }
}