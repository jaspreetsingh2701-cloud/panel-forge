import 'dotenv/config';
import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    throw new Error('DATABASE_URL is required. Copy apps/api/.env.example to apps/api/.env.');
  }

  const port = Number(process.env.PORT ?? 4000);

  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error('PORT must be an integer between 1 and 65535.');
  }

  const app = await NestFactory.create(AppModule);

  // Keep all platform API routes versioned from the very beginning.
  app.setGlobalPrefix('api/v1');
  app.enableShutdownHooks();

  // The port can be overridden by the environment in local and hosted setups.
  await app.listen(port, '0.0.0.0');
}

void bootstrap();
