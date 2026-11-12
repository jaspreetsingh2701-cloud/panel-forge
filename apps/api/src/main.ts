import 'reflect-metadata';
import { randomUUID } from 'node:crypto';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import type { NextFunction, Request, Response } from 'express';
import { AppModule } from './app.module';
import { env } from './config/env';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use((request: Request & { requestId?: string }, response: Response, next: NextFunction) => {
    const requestId = randomUUID();
    request.requestId = requestId;
    response.setHeader('X-Request-Id', requestId);
    next();
  });
  app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true, forbidNonWhitelisted: true }));
  app.useGlobalFilters(new HttpExceptionFilter());
  app.setGlobalPrefix('api/v1');

  if (env.NODE_ENV !== 'production') {
    const config = new DocumentBuilder()
      .setTitle('PanelForge API')
      .setDescription('Versioned PanelForge platform API')
      .setVersion('1.0')
      .addBearerAuth()
      .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/v1/docs', app, document, {
      jsonDocumentUrl: 'api/v1/openapi.json',
      swaggerOptions: { persistAuthorization: false },
    });
  }

  app.enableShutdownHooks();
  await app.listen(env.PORT, '0.0.0.0');
  console.log(`PanelForge API running on port ${env.PORT}`);
}

void bootstrap();
