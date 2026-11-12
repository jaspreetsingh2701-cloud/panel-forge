import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Post, Req, UseGuards } from '@nestjs/common';
import { AccessTokenGuard } from '../auth/guards/access-token.guard';
import type { AuthenticatedRequest } from '../auth/interfaces/authenticated-request.interface';
import { CreateInvitationDto } from './dto/create-invitation.dto';
import { MembersService } from './members.service';
@Controller('tenants/:tenantId')
@UseGuards(AccessTokenGuard)
export class MembersController {
  constructor(private readonly membersService: MembersService) {}
  @Get('members')
  listMembers(@Req() req: AuthenticatedRequest, @Param('tenantId', new ParseUUIDPipe()) tenantId: string) {
    return this.membersService.listMembers(req.user.userId, tenantId);
  }
  @Get('invitations')
  listInvitations(@Req() req: AuthenticatedRequest, @Param('tenantId', new ParseUUIDPipe()) tenantId: string) {
    return this.membersService.listInvitations(req.user.userId, tenantId);
  }
  @Post('invitations')
  createInvitation(@Req() req: AuthenticatedRequest, @Param('tenantId', new ParseUUIDPipe()) tenantId: string, @Body() dto: CreateInvitationDto) {
    return this.membersService.createInvitation(req.user.userId, tenantId, dto);
  }
  @Delete('invitations/:invitationId')
  revokeInvitation(@Req() req: AuthenticatedRequest, @Param('tenantId', new ParseUUIDPipe()) tenantId: string, @Param('invitationId', new ParseUUIDPipe()) id: string) {
    return this.membersService.revokeInvitation(req.user.userId, tenantId, id);
  }
}