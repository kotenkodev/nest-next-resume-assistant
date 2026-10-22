import { existsSync } from 'node:fs';
import { loadEnvFile } from 'node:process';
import { join } from 'node:path';
import type { DataSourceOptions } from 'typeorm';

export function getDatabaseOptions(): DataSourceOptions {
  if (existsSync('.env')) {
    loadEnvFile('.env');
  }

  const url = process.env.DATABASE_URL;

  if (!url) {
    throw new Error('DATABASE_URL is required');
  }

  const directory = __dirname.replace(/\\/g, '/');

  return {
    type: 'postgres',
    url,
    entities: [join(directory, 'entities', '*.js').replace(/\\/g, '/')],
    migrations: [join(directory, 'migrations', '*.js').replace(/\\/g, '/')],
    synchronize: false,
    migrationsRun: false,
  };
}
