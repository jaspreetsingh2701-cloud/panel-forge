import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Patch, Post, Query, Req, UseGuards } from '@nestjs/common';
import { AccessTokenGuard } from '../auth/guards/access-token.guard';
import type { AuthenticatedRequest } from '../auth/interfaces/authenticated-request.interface';
import { CreateResourceDto } from './dto/create-resource.dto';
import { CreateFieldDto } from './dto/create-field.dto';
import { UpsertRecordDto } from './dto/upsert-record.dto';
import { DataEngineService } from './data-engine.service';

@Controller('tenants/:tenantId/applications/:applicationId')
@UseGuards(AccessTokenGuard)
export class DataEngineController {
 constructor(private readonly service:DataEngineService){}
 @Get('resources') resources(@Req() r:AuthenticatedRequest,@Param('tenantId',new ParseUUIDPipe()) t:string,@Param('applicationId',new ParseUUIDPipe()) a:string){return this.service.listResources(r.user.userId,t,a);}
 @Post('resources') createResource(@Req() r:AuthenticatedRequest,@Param('tenantId',new ParseUUIDPipe()) t:string,@Param('applicationId',new ParseUUIDPipe()) a:string,@Body() d:CreateResourceDto){return this.service.createResource(r.user.userId,t,a,d);}
 @Get('resources/:resourceId/fields') fields(@Req() r:AuthenticatedRequest,@Param('tenantId',new ParseUUIDPipe()) t:string,@Param('applicationId',new ParseUUIDPipe()) a:string,@Param('resourceId',new ParseUUIDPipe()) id:string){return this.service.listFields(r.user.userId,t,a,id);}
 @Post('resources/:resourceId/fields') addField(@Req() r:AuthenticatedRequest,@Param('tenantId',new ParseUUIDPipe()) t:string,@Param('applicationId',new ParseUUIDPipe()) a:string,@Param('resourceId',new ParseUUIDPipe()) id:string,@Body() d:CreateFieldDto){return this.service.addField(r.user.userId,t,a,id,d);}
 @Get('resources/:resourceId/records') records(@Req() r:AuthenticatedRequest,@Param('tenantId',new ParseUUIDPipe()) t:string,@Param('applicationId',new ParseUUIDPipe()) a:string,@Param('resourceId',new ParseUUIDPipe()) id:string,@Query() q:Record<string,string>){return this.service.listRecords(r.user.userId,t,a,id,q);}
 @Post('resources/:resourceId/records') createRecord(@Req() r:AuthenticatedRequest,@Param('tenantId',new ParseUUIDPipe()) t:string,@Param('applicationId',new ParseUUIDPipe()) a:string,@Param('resourceId',new ParseUUIDPipe()) id:string,@Body() d:UpsertRecordDto){return this.service.createRecord(r.user.userId,t,a,id,d.data);}
 @Patch('resources/:resourceId/records/:recordId') updateRecord(@Req() r:AuthenticatedRequest,@Param('tenantId',new ParseUUIDPipe()) t:string,@Param('applicationId',new ParseUUIDPipe()) a:string,@Param('resourceId',new ParseUUIDPipe()) id:string,@Param('recordId',new ParseUUIDPipe()) recordId:string,@Body() d:UpsertRecordDto){return this.service.updateRecord(r.user.userId,t,a,id,recordId,d.data);}
 @Delete('resources/:resourceId/records/:recordId') deleteRecord(@Req() r:AuthenticatedRequest,@Param('tenantId',new ParseUUIDPipe()) t:string,@Param('applicationId',new ParseUUIDPipe()) a:string,@Param('resourceId',new ParseUUIDPipe()) id:string,@Param('recordId',new ParseUUIDPipe()) recordId:string){return this.service.deleteRecord(r.user.userId,t,a,id,recordId);}
}