import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { PrismaService } from '../database/prisma.service';

@ApiTags('Health')
@Controller('health')
export class HealthController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  @ApiOperation({ summary: 'Check API and PostgreSQL health' })
  @ApiResponse({ status: 200, description: 'API and database are healthy.' })
  async getHealth() {
    await this.prisma.$queryRaw`SELECT 1`;
    return {
      status: 'ok',
      service: 'panelforge-api',
      dependencies: { database: 'ok' },
      timestamp: new Date().toISOString(),
    };
  }
}