import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Patch, Post, Query, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AccessTokenGuard } from '../auth/guards/access-token.guard';
import type { AuthenticatedRequest } from '../auth/interfaces/authenticated-request.interface';
import { CreateResourceDto } from './dto/create-resource.dto';
import { CreateFieldDto } from './dto/create-field.dto';
import { UpsertRecordDto } from './dto/upsert-record.dto';
import { DataEngineService } from './data-engine.service';

@ApiTags('Data engine')
@ApiBearerAuth()
@Controller('tenants/:tenantId/applications/:applicationId')
@UseGuards(AccessTokenGuard)
export class DataEngineController {
  constructor(private readonly service: DataEngineService) {}

  @Get('resources')
  @ApiOperation({ summary: 'List data resources for an application' })
  @ApiParam({ name: 'tenantId', description: 'Workspace UUID' })
  @ApiParam({ name: 'applicationId', description: 'Application UUID' })
  @ApiResponse({ status: 200, description: 'Resources configured for the application.' })
  resources(@Req() r: AuthenticatedRequest, @Param('tenantId', new ParseUUIDPipe()) t: string, @Param('applicationId', new ParseUUIDPipe()) a: string) {
    return this.service.listResources(r.user.userId, t, a);
  }

  @Post('resources')
  @ApiOperation({ summary: 'Create a data resource' })
  @ApiResponse({ status: 201, description: 'Resource created.' })
  createResource(@Req() r: AuthenticatedRequest, @Param('tenantId', new ParseUUIDPipe()) t: string, @Param('applicationId', new ParseUUIDPipe()) a: string, @Body() d: CreateResourceDto) {
    return this.service.createResource(r.user.userId, t, a, d);
  }

  @Get('resources/:resourceId/fields')
  @ApiOperation({ summary: 'List fields defined for a resource' })
  @ApiParam({ name: 'resourceId', description: 'Resource UUID' })
  @ApiResponse({ status: 200, description: 'Resource field definitions.' })
  fields(@Req() r: AuthenticatedRequest, @Param('tenantId', new ParseUUIDPipe()) t: string, @Param('applicationId', new ParseUUIDPipe()) a: string, @Param('resourceId', new ParseUUIDPipe()) id: string) {
    return this.service.listFields(r.user.userId, t, a, id);
  }

  @Post('resources/:resourceId/fields')
  @ApiOperation({ summary: 'Add a field to a resource' })
  @ApiParam({ name: 'resourceId', description: 'Resource UUID' })
  @ApiResponse({ status: 201, description: 'Field created.' })
  createField(@Req() r: AuthenticatedRequest, @Param('tenantId', new ParseUUIDPipe()) t: string, @Param('applicationId', new ParseUUIDPipe()) a: string, @Param('resourceId', new ParseUUIDPipe()) id: string, @Body() d: CreateFieldDto) {
    return this.service.addField(r.user.userId, t, a, id, d);
  }

  @Get('resources/:resourceId/records')
  @ApiOperation({ summary: 'List records for a resource' })
  @ApiParam({ name: 'resourceId', description: 'Resource UUID' })
  @ApiResponse({ status: 200, description: 'Records matching the supplied query filters.' })
  records(@Req() r: AuthenticatedRequest, @Param('tenantId', new ParseUUIDPipe()) t: string, @Param('applicationId', new ParseUUIDPipe()) a: string, @Param('resourceId', new ParseUUIDPipe()) id: string, @Query() q: Record<string, string>) {
    return this.service.listRecords(r.user.userId, t, a, id, q);
  }

  @Post('resources/:resourceId/records')
  @ApiOperation({ summary: 'Create a record in a resource' })
  @ApiParam({ name: 'resourceId', description: 'Resource UUID' })
  @ApiResponse({ status: 201, description: 'Record created.' })
  createRecord(@Req() r: AuthenticatedRequest, @Param('tenantId', new ParseUUIDPipe()) t: string, @Param('applicationId', new ParseUUIDPipe()) a: string, @Param('resourceId', new ParseUUIDPipe()) id: string, @Body() d: UpsertRecordDto) {
    return this.service.createRecord(r.user.userId, t, a, id, d.data);
  }

  @Patch('resources/:resourceId/records/:recordId')
  @ApiOperation({ summary: 'Update a record in a resource' })
  @ApiParam({ name: 'resourceId', description: 'Resource UUID' })
  @ApiParam({ name: 'recordId', description: 'Record UUID' })
  @ApiResponse({ status: 200, description: 'Record updated.' })
  updateRecord(@Req() r: AuthenticatedRequest, @Param('tenantId', new ParseUUIDPipe()) t: string, @Param('applicationId', new ParseUUIDPipe()) a: string, @Param('resourceId', new ParseUUIDPipe()) id: string, @Param('recordId', new ParseUUIDPipe()) recordId: string, @Body() d: UpsertRecordDto) {
    return this.service.updateRecord(r.user.userId, t, a, id, recordId, d.data);
  }

  @Delete('resources/:resourceId/records/:recordId')
  @ApiOperation({ summary: 'Delete a record from a resource' })
  @ApiParam({ name: 'resourceId', description: 'Resource UUID' })
  @ApiParam({ name: 'recordId', description: 'Record UUID' })
  @ApiResponse({ status: 200, description: 'Record deleted.' })
  deleteRecord(@Req() r: AuthenticatedRequest, @Param('tenantId', new ParseUUIDPipe()) t: string, @Param('applicationId', new ParseUUIDPipe()) a: string, @Param('resourceId', new ParseUUIDPipe()) id: string, @Param('recordId', new ParseUUIDPipe()) recordId: string) {
    return this.service.deleteRecord(r.user.userId, t, a, id, recordId);
  }
}