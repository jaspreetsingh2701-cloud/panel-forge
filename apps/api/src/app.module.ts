import { Module } from '@nestjs/common';
import { DatabaseModule } from './database/prisma.module';
import { HealthController } from './health/health.controller';
import { ValidationDemoController } from './validation-demo/validation-demo.controller';
import { AuthModule } from './auth/auth.module';
import { TenantsModule } from './tenants/tenants.module';

@Module({
  imports: [DatabaseModule, AuthModule, TenantsModule],
  controllers: [HealthController, ValidationDemoController],
  providers: [],
})
export class AppModule {}
