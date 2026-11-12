import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { AccessTokenGuard } from '../auth/guards/access-token.guard';
import type { AuthenticatedRequest } from '../auth/interfaces/authenticated-request.interface';
import { CreateInvitationDto } from './dto/create-invitation.dto';
import { UpdateMemberRoleDto } from './dto/update-member-role.dto';
import { MembersService } from './members.service';
@Controller('tenants/:tenantId')
@UseGuards(AccessTokenGuard)
export class MembersController {
 constructor(private readonly service:MembersService){}
 @Get('members') listMembers(@Req() r:AuthenticatedRequest,@Param('tenantId',new ParseUUIDPipe()) t:string){return this.service.listMembers(r.user.userId,t);}
 @Patch('members/:memberId/role') updateRole(@Req() r:AuthenticatedRequest,@Param('tenantId',new ParseUUIDPipe()) t:string,@Param('memberId',new ParseUUIDPipe()) id:string,@Body() d:UpdateMemberRoleDto){return this.service.updateMemberRole(r.user.userId,t,id,d.role);}
 @Get('invitations') listInvitations(@Req() r:AuthenticatedRequest,@Param('tenantId',new ParseUUIDPipe()) t:string){return this.service.listInvitations(r.user.userId,t);}
 @Post('invitations') createInvitation(@Req() r:AuthenticatedRequest,@Param('tenantId',new ParseUUIDPipe()) t:string,@Body() d:CreateInvitationDto){return this.service.createInvitation(r.user.userId,t,d);}
 @Delete('invitations/:invitationId') revokeInvitation(@Req() r:AuthenticatedRequest,@Param('tenantId',new ParseUUIDPipe()) t:string,@Param('invitationId',new ParseUUIDPipe()) id:string){return this.service.revokeInvitation(r.user.userId,t,id);}
}