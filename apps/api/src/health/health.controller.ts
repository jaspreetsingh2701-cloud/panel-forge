import { Controller, Get } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';

@Controller('health')
export class HealthController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  async getHealth() {
    // A successful response confirms that the API can reach PostgreSQL.
    await this.prisma.$queryRaw`SELECT 1`;

    return {
      status: 'ok',
      service: 'panelforge-api',
      dependencies: {
        database: 'ok',
      },
      timestamp: new Date().toISOString(),
    };
  }
}
