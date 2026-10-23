import { existsSync } from 'node:fs';
import { loadEnvFile } from 'node:process';
import { join, resolve } from 'node:path';
import type { DataSourceOptions } from 'typeorm';

export function getDatabaseOptions(): DataSourceOptions {
  const envPath = resolve(__dirname, '../../../../.env');

  if (existsSync(envPath)) {
    loadEnvFile(envPath);
  }

  const url = process.env.DATABASE_URL;

  if (!url) {
    throw new Error('DATABASE_URL is required');
  }

  const directory = __dirname.replace(/\\/g, '/');

  return {
    type: 'postgres',
    url,
    entities: [
      join(directory, '../modules/**/entities/*.entity.{js,ts}').replace(
        /\\/g,
        '/',
      ),
    ],
    migrations: [join(directory, 'migrations', '*.js').replace(/\\/g, '/')],
    synchronize: false,
    migrationsRun: false,
  };
}
