import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AccessTokenGuard } from '../auth/guards/access-token.guard';
import type { AuthenticatedRequest } from '../auth/interfaces/authenticated-request.interface';
import { TenantsService } from './tenants.service';

@ApiTags('Tenants')
@ApiBearerAuth()
@Controller('tenants')
@UseGuards(AccessTokenGuard)
export class TenantsController {
  constructor(private readonly tenantsService: TenantsService) {}

  @Get()
  @ApiOperation({ summary: 'List workspaces available to the authenticated user' })
  @ApiResponse({ status: 200, description: 'Workspaces and the current user roles.' })
  @ApiResponse({ status: 401, description: 'Authentication is required.' })
  async findMyTenants(@Req() request: AuthenticatedRequest) {
    return this.tenantsService.findForUser(request.user.userId);
  }
}