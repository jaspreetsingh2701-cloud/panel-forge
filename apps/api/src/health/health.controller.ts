import { Controller, Get } from '@nestjs/common';

@Controller('health')
export class HealthController {
  @Get()
  getHealth() {
    // This endpoint is intentionally lightweight for uptime checks and local setup.
    return {
      status: 'ok',
      service: 'panelforge-api',
      timestamp: new Date().toISOString(),
    };
  }
}
