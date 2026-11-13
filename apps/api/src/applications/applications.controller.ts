import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Post, Put, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AccessTokenGuard } from '../auth/guards/access-token.guard';
import type { AuthenticatedRequest } from '../auth/interfaces/authenticated-request.interface';
import { CreateApplicationDto } from './dto/create-application.dto';
import { SaveBuilderConfigurationDto } from './dto/save-builder-configuration.dto';
import { ApplicationsService } from './applications.service';

@ApiTags('Applications')
@ApiBearerAuth()
@Controller('tenants/:tenantId/applications')
@UseGuards(AccessTokenGuard)
export class ApplicationsController {
  constructor(private readonly applicationsService: ApplicationsService) {}

  @Get()
  @ApiOperation({ summary: 'List applications in a workspace' })
  @ApiParam({ name: 'tenantId', description: 'Workspace UUID' })
  @ApiResponse({ status: 200, description: 'Applications accessible in this workspace.' })
  findAll(@Req() request: AuthenticatedRequest, @Param('tenantId', new ParseUUIDPipe()) tenantId: string) {
    return this.applicationsService.findAll(request.user.userId, tenantId);
  }

  @Get(':applicationId/builder')
  @ApiOperation({ summary: 'Get the saved builder configuration and version' })
  @ApiParam({ name: 'tenantId', description: 'Workspace UUID' })
  @ApiParam({ name: 'applicationId', description: 'Application UUID' })
  @ApiResponse({ status: 200, description: 'Saved components and optimistic concurrency version.' })
  @ApiResponse({ status: 404, description: 'Application not found.' })
  getBuilderConfiguration(@Req() request: AuthenticatedRequest, @Param('tenantId', new ParseUUIDPipe()) tenantId: string, @Param('applicationId', new ParseUUIDPipe()) applicationId: string) {
    return this.applicationsService.getBuilderConfiguration(request.user.userId, tenantId, applicationId);
  }

  @Put(':applicationId/builder')
  @ApiOperation({ summary: 'Save builder configuration using optimistic concurrency' })
  @ApiParam({ name: 'tenantId', description: 'Workspace UUID' })
  @ApiParam({ name: 'applicationId', description: 'Application UUID' })
  @ApiResponse({ status: 200, description: 'Configuration saved and version incremented.' })
  @ApiResponse({ status: 409, description: 'The saved configuration has changed; reload before saving.' })
  saveBuilderConfiguration(@Req() request: AuthenticatedRequest, @Param('tenantId', new ParseUUIDPipe()) tenantId: string, @Param('applicationId', new ParseUUIDPipe()) applicationId: string, @Body() dto: SaveBuilderConfigurationDto) {
    return this.applicationsService.saveBuilderConfiguration(request.user.userId, tenantId, applicationId, dto);
  }

  @Post()
  @ApiOperation({ summary: 'Create an application in a workspace' })
  @ApiParam({ name: 'tenantId', description: 'Workspace UUID' })
  @ApiResponse({ status: 201, description: 'Application created.' })
  create(@Req() request: AuthenticatedRequest, @Param('tenantId', new ParseUUIDPipe()) tenantId: string, @Body() dto: CreateApplicationDto) {
    return this.applicationsService.create(request.user.userId, tenantId, dto);
  }

  @Delete(':applicationId')
  @ApiOperation({ summary: 'Archive an application' })
  @ApiParam({ name: 'tenantId', description: 'Workspace UUID' })
  @ApiParam({ name: 'applicationId', description: 'Application UUID' })
  @ApiResponse({ status: 200, description: 'Application archived.' })
  archive(@Req() request: AuthenticatedRequest, @Param('tenantId', new ParseUUIDPipe()) tenantId: string, @Param('applicationId', new ParseUUIDPipe()) applicationId: string) {
    return this.applicationsService.archive(request.user.userId, tenantId, applicationId);
  }
}