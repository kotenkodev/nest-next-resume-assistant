import 'reflect-metadata';
import { existsSync } from 'node:fs';
import { loadEnvFile } from 'node:process';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  if (existsSync('.env')) loadEnvFile('.env');

  const app = await NestFactory.create(AppModule, {
    bodyParser: false,
  });

  app.setGlobalPrefix('api');

  const webOrigin =
    process.env.WEB_ORIGIN ?? 'http://localhost:3000';

  app.enableCors({
    origin: webOrigin,
    credentials: true,
  });

  app.enableShutdownHooks();

  const port = Number(process.env.PORT ?? 3001);
  await app.listen(port);
}

bootstrap().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
