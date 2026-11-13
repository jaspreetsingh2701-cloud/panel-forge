import { Module } from '@nestjs/common';
import { AccessTokenGuard } from '../auth/guards/access-token.guard';
import { PlatformDocsController } from './platform-docs.controller';
import { PlatformSuperAdminGuard } from './platform-super-admin.guard';

@Module({
  controllers: [PlatformDocsController],
  providers: [AccessTokenGuard, PlatformSuperAdminGuard],
})
export class PlatformModule {}
