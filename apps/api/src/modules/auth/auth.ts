import { betterAuth } from 'better-auth';
import { typeormAdapter } from '@hedystia/better-auth-typeorm';
import type { DataSource } from 'typeorm';

export function createAuth(dataSource: DataSource) {
  const secret = process.env.BETTER_AUTH_SECRET;

  if (!secret) {
    throw new Error('BETTER_AUTH_SECRET is required');
  }

  return betterAuth({
    secret,
    baseURL: process.env.BETTER_AUTH_URL ?? 'http://localhost:3001',
    basePath: '/api/auth',
    trustedOrigins: [process.env.WEB_ORIGIN ?? 'http://localhost:3000'],

    database: typeormAdapter(dataSource, {
      outputDir: './src/database',
    }),

    emailAndPassword: {
      enabled: true,
    },
  });
}
