import { BadRequestException, ConflictException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { CreateResourceDto } from './dto/create-resource.dto';
import { CreateFieldDto } from './dto/create-field.dto';

type Field = { key:string; name:string; type:string; required:boolean; options:string[]; relationResourceId:string|null };
@Injectable()
export class DataEngineService {
 constructor(private readonly prisma:PrismaService){}
 private async access(userId:string,tenantId:string,applicationId:string,admin=false){
  const membership=await this.prisma.tenantMember.findFirst({where:{userId,tenantId,status:'ACTIVE',tenant:{status:'ACTIVE'}},select:{role:true}});
  if(!membership) throw new ForbiddenException('You do not have access to this workspace.');
  if(admin&&!['OWNER','ADMIN'].includes(membership.role)) throw new ForbiddenException('Only workspace owners and admins can change the data model.');
  const app=await this.prisma.application.findFirst({where:{id:applicationId,tenantId,status:'DRAFT'},select:{id:true}});
  if(!app) throw new NotFoundException('Application not found.');
 }
 private async resource(userId:string,tenantId:string,applicationId:string,resourceId:string,admin=false){
  await this.access(userId,tenantId,applicationId,admin);
  const resource=await this.prisma.resource.findFirst({where:{id:resourceId,tenantId,applicationId,status:'ACTIVE'},include:{fields:{orderBy:{position:'asc'}}}});
  if(!resource) throw new NotFoundException('Resource not found.');
  return resource;
 }
 async listResources(userId:string,tenantId:string,applicationId:string){
  await this.access(userId,tenantId,applicationId);
  return this.prisma.resource.findMany({where:{tenantId,applicationId,status:'ACTIVE'},orderBy:{createdAt:'asc'},include:{_count:{select:{records:true,fields:true}}}});
 }
 async createResource(userId:string,tenantId:string,applicationId:string,dto:CreateResourceDto){
  await this.access(userId,tenantId,applicationId,true);
  try{return await this.prisma.resource.create({data:{tenantId,applicationId,name:dto.name.trim(),key:dto.key.trim().toLowerCase(),description:dto.description?.trim()||null}});}
  catch(e){if((e as {code?:string})?.code==='P2002') throw new ConflictException('A resource with this key already exists in this application.');throw e;}
 }
 async listFields(userId:string,tenantId:string,applicationId:string,resourceId:string){
  const resource=await this.resource(userId,tenantId,applicationId,resourceId);
  return resource.fields;
 }
 async addField(userId:string,tenantId:string,applicationId:string,resourceId:string,dto:CreateFieldDto){
  const resource=await this.resource(userId,tenantId,applicationId,resourceId,true);
  const key=dto.key.trim().toLowerCase();
  if(dto.type==='SELECT'&&(!dto.options?.length||dto.options.length>100)) throw new BadRequestException('Select fields require between 1 and 100 options.');
  if(dto.type==='RELATION'){
   if(!dto.relationResourceId) throw new BadRequestException('Choose a target resource for a relation field.');
   const target=await this.prisma.resource.findFirst({where:{id:dto.relationResourceId,tenantId,applicationId,status:'ACTIVE'},select:{id:true}});
   if(!target) throw new BadRequestException('Relation targets must belong to the same application.');
  }else if(dto.relationResourceId) throw new BadRequestException('Only relation fields can have a target resource.');
  try{return await this.prisma.resourceField.create({data:{resourceId:resource.id,name:dto.name.trim(),key,type:dto.type,required:dto.required??false,options:dto.type==='SELECT'?(dto.options??[]):[],relationResourceId:dto.type==='RELATION'?dto.relationResourceId:null,position:dto.position??0}});}
  catch(e){if((e as {code?:string})?.code==='P2002') throw new ConflictException('A field with this key already exists.');throw e;}
 }
 private async validateData(resourceId:string,data:Record<string,unknown>,partial=false){
  if(!data||typeof data!=='object'||Array.isArray(data)) throw new BadRequestException('Record data must be an object.');
  const fields=await this.prisma.resourceField.findMany({where:{resourceId},orderBy:{position:'asc'}});
  const allowed=new Set(fields.map((f)=>f.key));
  const unknown=Object.keys(data).filter((key)=>!allowed.has(key));
  if(unknown.length) throw new BadRequestException(`Unknown field(s): ${unknown.join(', ')}.`);
  for(const field of fields as Field[]){
   const value=data[field.key];
   if(value===undefined||value===null||value===''){
    if(!partial&&field.required) throw new BadRequestException(`${field.name} is required.`);
    continue;
   }
   let valid=true;
   switch(field.type){
    case 'TEXT': valid=typeof value==='string';break;
    case 'NUMBER': valid=typeof value==='number'&&Number.isFinite(value);break;
    case 'BOOLEAN': valid=typeof value==='boolean';break;
    case 'DATE': valid=typeof value==='string'&&!Number.isNaN(Date.parse(value));break;
    case 'SELECT': valid=typeof value==='string'&&field.options.includes(value);break;
    case 'RELATION':
     valid=typeof value==='string'&&!!field.relationResourceId;
     if(valid){const target=await this.prisma.dynamicRecord.findFirst({where:{id:value as string,resourceId:field.relationResourceId!},select:{id:true}});valid=!!target;}
     break;
   }
   if(!valid) throw new BadRequestException(`Invalid value for field "${field.name}".`);
  }
 }
 async createRecord(userId:string,tenantId:string,applicationId:string,resourceId:string,data:Record<string,unknown>){
  const resource=await this.resource(userId,tenantId,applicationId,resourceId);
  await this.validateData(resource.id,data);
  return this.prisma.dynamicRecord.create({data:{resourceId,data:data as never}});
 }
 async updateRecord(userId:string,tenantId:string,applicationId:string,resourceId:string,recordId:string,patch:Record<string,unknown>){
  const resource=await this.resource(userId,tenantId,applicationId,resourceId);
  const current=await this.prisma.dynamicRecord.findFirst({where:{id:recordId,resourceId}});
  if(!current) throw new NotFoundException('Record not found.');
  const data={...(current.data as Record<string,unknown>),...patch};
  await this.validateData(resource.id,data);
  return this.prisma.dynamicRecord.update({where:{id:recordId},data:{data:data as never}});
 }
 async deleteRecord(userId:string,tenantId:string,applicationId:string,resourceId:string,recordId:string){
  await this.resource(userId,tenantId,applicationId,resourceId);
  const result=await this.prisma.dynamicRecord.deleteMany({where:{id:recordId,resourceId}});
  if(result.count!==1) throw new NotFoundException('Record not found.');
  return {message:'Record deleted.'};
 }
 async listRecords(userId:string,tenantId:string,applicationId:string,resourceId:string,query:Record<string,string>){
  const resource=await this.resource(userId,tenantId,applicationId,resourceId);
  const page=Math.max(1,Number.parseInt(query.page??'1',10)||1);
  const pageSize=Math.min(100,Math.max(1,Number.parseInt(query.pageSize??'20',10)||20));
  const sortBy=query.sortBy??'updatedAt',sortOrder=query.sortOrder==='asc'?'asc':'desc';
  const fields=resource.fields as Field[];
  if(sortBy!=='createdAt'&&sortBy!=='updatedAt'&&!fields.some(f=>f.key===sortBy)) throw new BadRequestException('Invalid sort field.');
  let filter:Record<string,string>={};
  if(query.filter){try{const parsed:unknown=JSON.parse(query.filter);if(!parsed||typeof parsed!=='object'||Array.isArray(parsed))throw new Error();filter=parsed as Record<string,string>;}catch{throw new BadRequestException('Filter must be a JSON object.');}}
  if(Object.entries(filter).some(([key,value])=>!fields.some(f=>f.key===key)||typeof value!=='string'))throw new BadRequestException('Filter contains an invalid field or value.');
  const rows=await this.prisma.dynamicRecord.findMany({where:{resourceId},orderBy:{updatedAt:'desc'},take:500});
  const q=(query.q??'').trim().toLowerCase();
  const filtered=rows.filter(row=>{
   const data=row.data as Record<string,unknown>;
   if(q&&!Object.values(data).some(v=>String(v??'').toLowerCase().includes(q))) return false;
   return Object.entries(filter).every(([key,value])=>fields.some(f=>f.key===key)&&String(data[key]??'')===value);
  });
  filtered.sort((a,b)=>{
   const av=sortBy==='createdAt'?a.createdAt:sortBy==='updatedAt'?a.updatedAt:(a.data as Record<string,unknown>)[sortBy];
   const bv=sortBy==='createdAt'?b.createdAt:sortBy==='updatedAt'?b.updatedAt:(b.data as Record<string,unknown>)[sortBy];
   const result=String(av??'').localeCompare(String(bv??''),undefined,{numeric:true,sensitivity:'base'});
   return sortOrder==='asc'?result:-result;
  });
  return {items:filtered.slice((page-1)*pageSize,page*pageSize),page,pageSize,total:filtered.length,hasMore:page*pageSize<filtered.length,scanned:rows.length,scanLimit:500};
 }
}