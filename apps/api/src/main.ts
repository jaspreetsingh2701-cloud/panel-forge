import 'reflect-metadata';
import { randomUUID } from 'node:crypto';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import type { NextFunction, Request, Response } from 'express';
import { AppModule } from './app.module';
import { env } from './config/env';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from './database/prisma.service';

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

  const config = new DocumentBuilder()
    .setTitle('PanelForge API')
    .setDescription('Versioned PanelForge platform API')
    .setVersion('1.0')
    .addBearerAuth()
    .addCookieAuth('pf_refresh', { type: 'apiKey', in: 'cookie', name: 'pf_refresh' }, 'pf_refresh')
    .build();
  const document = SwaggerModule.createDocument(app, config);

  // Production API reference is exposed only through this authenticated endpoint.
  app.use('/api/v1/platform/openapi.json', async (request: Request, response: Response) => {
    if (request.method !== 'GET') { response.sendStatus(405); return; }
    const match = request.headers.authorization ? /^Bearer\s+(\S+)$/i.exec(request.headers.authorization) : null;
    if (!match) { response.sendStatus(401); return; }
    try {
      const jwtService = app.get(JwtService);
      const prisma = app.get(PrismaService);
      const payload = await jwtService.verifyAsync<{ sub: string; sid: string }>(match[1]);
      if (!payload.sub || !payload.sid) { response.sendStatus(401); return; }
      const activeSession = await prisma.authSession.findFirst({ where: { id: payload.sid, userId: payload.sub, revokedAt: null, expiresAt: { gt: new Date() } }, select: { id: true } });
      if (!activeSession) { response.sendStatus(401); return; }
      const user = await prisma.user.findUnique({ where: { id: payload.sub }, select: { platformRole: true } });
      if (user?.platformRole !== 'SUPER_ADMIN') { response.sendStatus(403); return; }
      response.setHeader('Cache-Control', 'private, no-store');
      response.json(document);
    } catch {
      response.sendStatus(401);
    }
  });

  if (env.NODE_ENV !== 'production') {
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
