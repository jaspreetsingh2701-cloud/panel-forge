import { Module } from '@nestjs/common';
import { DatabaseModule } from './database/prisma.module';
import { HealthController } from './health/health.controller';
import { ValidationDemoController } from './validation-demo/validation-demo.controller';
import { AuthModule } from './auth/auth.module';
import { TenantsModule } from './tenants/tenants.module';
import { ApplicationsModule } from './applications/applications.module';
import { MembersModule } from './members/members.module';
import { DataEngineModule } from './data-engine/data-engine.module';
import { PlatformModule } from './platform/platform.module';
@Module({
 imports:[DatabaseModule,AuthModule,TenantsModule,ApplicationsModule,MembersModule,DataEngineModule,PlatformModule],
 controllers:[HealthController,ValidationDemoController],
 providers:[],
})
export class AppModule {}