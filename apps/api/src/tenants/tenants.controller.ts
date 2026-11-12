
import {
  Controller,
  Get,
  Req,
  UseGuards,
} from '@nestjs/common';

import { AccessTokenGuard } from '../auth/guards/access-token.guard';
import type { AuthenticatedRequest } from '../auth/interfaces/authenticated-request.interface';

import { TenantsService } from './tenants.service';

@Controller('tenants')
@UseGuards(AccessTokenGuard)
export class TenantsController {
  constructor(private readonly tenantsService: TenantsService) {}

  @Get()
  async findMyTenants(@Req() request: AuthenticatedRequest) {
    return this.tenantsService.findForUser(request.user.userId);
  }
}
