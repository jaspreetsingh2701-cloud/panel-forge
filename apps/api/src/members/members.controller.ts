import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AccessTokenGuard } from '../auth/guards/access-token.guard';
import type { AuthenticatedRequest } from '../auth/interfaces/authenticated-request.interface';
import { CreateInvitationDto } from './dto/create-invitation.dto';
import { UpdateMemberRoleDto } from './dto/update-member-role.dto';
import { MembersService } from './members.service';

@ApiTags('Workspace members')
@ApiBearerAuth()
@Controller('tenants/:tenantId')
@UseGuards(AccessTokenGuard)
export class MembersController {
  constructor(private readonly service: MembersService) {}

  @Get('members')
  @ApiOperation({ summary: 'List workspace members' })
  @ApiParam({ name: 'tenantId', description: 'Workspace UUID' })
  @ApiResponse({ status: 200, description: 'Workspace members and roles.' })
  listMembers(@Req() r: AuthenticatedRequest, @Param('tenantId', new ParseUUIDPipe()) t: string) {
    return this.service.listMembers(r.user.userId, t);
  }

  @Patch('members/:memberId/role')
  @ApiOperation({ summary: 'Change a workspace member role' })
  @ApiParam({ name: 'tenantId', description: 'Workspace UUID' })
  @ApiParam({ name: 'memberId', description: 'Workspace member UUID' })
  @ApiResponse({ status: 200, description: 'Member role updated.' })
  @ApiResponse({ status: 403, description: 'Insufficient workspace permissions.' })
  updateRole(@Req() r: AuthenticatedRequest, @Param('tenantId', new ParseUUIDPipe()) t: string, @Param('memberId', new ParseUUIDPipe()) id: string, @Body() d: UpdateMemberRoleDto) {
    return this.service.updateMemberRole(r.user.userId, t, id, d.role);
  }

  @Get('invitations')
  @ApiOperation({ summary: 'List pending workspace invitations' })
  @ApiParam({ name: 'tenantId', description: 'Workspace UUID' })
  @ApiResponse({ status: 200, description: 'Pending invitations.' })
  listInvitations(@Req() r: AuthenticatedRequest, @Param('tenantId', new ParseUUIDPipe()) t: string) {
    return this.service.listInvitations(r.user.userId, t);
  }

  @Post('invitations')
  @ApiOperation({ summary: 'Invite a user to the workspace' })
  @ApiParam({ name: 'tenantId', description: 'Workspace UUID' })
  @ApiResponse({ status: 201, description: 'Invitation created.' })
  @ApiResponse({ status: 403, description: 'Insufficient workspace permissions.' })
  createInvitation(@Req() r: AuthenticatedRequest, @Param('tenantId', new ParseUUIDPipe()) t: string, @Body() d: CreateInvitationDto) {
    return this.service.createInvitation(r.user.userId, t, d);
  }

  @Delete('invitations/:invitationId')
  @ApiOperation({ summary: 'Revoke a workspace invitation' })
  @ApiParam({ name: 'tenantId', description: 'Workspace UUID' })
  @ApiParam({ name: 'invitationId', description: 'Invitation UUID' })
  @ApiResponse({ status: 200, description: 'Invitation revoked.' })
  revokeInvitation(@Req() r: AuthenticatedRequest, @Param('tenantId', new ParseUUIDPipe()) t: string, @Param('invitationId', new ParseUUIDPipe()) id: string) {
    return this.service.revokeInvitation(r.user.userId, t, id);
  }
}