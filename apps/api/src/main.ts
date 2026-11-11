
import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { env } from './config/env';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Validate incoming requests globally using DTO decorators.
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );

  // Keep all platform API routes versioned.
  app.setGlobalPrefix('api/v1');

  // Allow NestJS to handle graceful shutdown signals.
  app.enableShutdownHooks();

  // Use the validated configuration.
  await app.listen(env.PORT, '0.0.0.0');

  console.log(`PanelForge API running on port ${env.PORT}`);
}

void bootstrap();
