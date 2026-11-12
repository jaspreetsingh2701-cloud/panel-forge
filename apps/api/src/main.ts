
import 'reflect-metadata';
import { randomUUID } from 'node:crypto';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import type { NextFunction, Request, Response } from 'express';
import { AppModule } from './app.module';
import { env } from './config/env';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Assign a unique ID to every incoming request.
  // This middleware runs before validation and controller execution.
  app.use(
    (
      request: Request & { requestId?: string },
      response: Response,
      next: NextFunction,
    ) => {
      const requestId = randomUUID();

      request.requestId = requestId;

      // Also expose the ID in the HTTP response header.
      response.setHeader('X-Request-Id', requestId);

      next();
    },
  );

  // Validate incoming API requests globally.
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );

  // Standardise all API error responses.
  app.useGlobalFilters(new HttpExceptionFilter());

  // Keep all platform API routes versioned.
  app.setGlobalPrefix('api/v1');

  // Allow NestJS to handle graceful shutdown signals.
  app.enableShutdownHooks();

  // Use the validated configuration.
  await app.listen(env.PORT, '0.0.0.0');

  console.log(`PanelForge API running on port ${env.PORT}`);
}

void bootstrap();
