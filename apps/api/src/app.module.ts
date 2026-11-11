import { Module } from '@nestjs/common';
import { DatabaseModule } from './database/prisma.module';
import { HealthController } from './health/health.controller';
import { ValidationDemoController } from './validation-demo/validation-demo.controller';

@Module({
  imports: [DatabaseModule],
  controllers: [HealthController, ValidationDemoController],
  providers: [],
})
export class AppModule {}
