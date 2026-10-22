import 'reflect-metadata';
import { existsSync } from 'node:fs';
import { loadEnvFile } from 'node:process';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  if (existsSync('.env')) loadEnvFile('.env');

  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api');
  app.enableCors({ origin: process.env.WEB_ORIGIN ?? 'http://localhost:3000' });
  app.enableShutdownHooks();
  await app.listen(Number(process.env.PORT ?? 3001));
}

bootstrap().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
