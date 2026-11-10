import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Keep all platform API routes versioned from the very beginning.
  app.setGlobalPrefix('api/v1');

  // The port can be overridden by the environment in local and hosted setups.
  const port = Number(process.env.PORT ?? 4000);
  await app.listen(port, '0.0.0.0');
}

void bootstrap();
