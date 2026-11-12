import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Post, Req, UseGuards } from '@nestjs/common';
import { AccessTokenGuard } from '../auth/guards/access-token.guard';
import type { AuthenticatedRequest } from '../auth/interfaces/authenticated-request.interface';
import { CreateApplicationDto } from './dto/create-application.dto';
import { ApplicationsService } from './applications.service';

@Controller('tenants/:tenantId/applications')
@UseGuards(AccessTokenGuard)
export class ApplicationsController {
  constructor(private readonly applicationsService: ApplicationsService) {}
  @Get()
  findAll(@Req() request: AuthenticatedRequest, @Param('tenantId', new ParseUUIDPipe()) tenantId: string) {
    return this.applicationsService.findAll(request.user.userId, tenantId);
  }
  @Post()
  create(@Req() request: AuthenticatedRequest, @Param('tenantId', new ParseUUIDPipe()) tenantId: string, @Body() dto: CreateApplicationDto) {
    return this.applicationsService.create(request.user.userId, tenantId, dto);
  }
  @Delete(':applicationId')
  archive(@Req() request: AuthenticatedRequest, @Param('tenantId', new ParseUUIDPipe()) tenantId: string, @Param('applicationId', new ParseUUIDPipe()) applicationId: string) {
    return this.applicationsService.archive(request.user.userId, tenantId, applicationId);
  }
}