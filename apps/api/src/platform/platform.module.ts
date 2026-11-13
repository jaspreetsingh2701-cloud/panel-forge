import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { PlatformDocsController } from './platform-docs.controller';
import { PlatformSuperAdminGuard } from './platform-super-admin.guard';

@Module({
  imports: [AuthModule],
  controllers: [PlatformDocsController],
  providers: [PlatformSuperAdminGuard],
})
export class PlatformModule {}
