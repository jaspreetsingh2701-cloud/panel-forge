
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';

import { env } from '../config/env';
import { DatabaseModule } from '../database/prisma.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { AccessTokenGuard } from './guards/access-token.guard';

@Module({
  imports: [
    DatabaseModule,
    JwtModule.register({
      secret: env.JWT_ACCESS_SECRET,
      signOptions: {
        expiresIn: env.JWT_ACCESS_TTL,
      },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, AccessTokenGuard],
  exports: [
    AuthService,
    AccessTokenGuard,
    JwtModule,
  ],
})
export class AuthModule {}
