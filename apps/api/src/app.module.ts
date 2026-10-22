import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { resolve } from 'node:path';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { getDatabaseOptions } from './database/database-options';
import { createAuth } from './modules/auth/auth';
import { AuthModule } from '@thallesp/nestjs-better-auth';
import { DataSource } from 'typeorm';
import { validateEnv } from './config/env.validate';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: resolve(__dirname, '../../../.env'),
      validate: validateEnv,
    }),
    TypeOrmModule.forRootAsync({
      useFactory: () => getDatabaseOptions(),
    }),
    AuthModule.forRootAsync({
      inject: [DataSource],
      useFactory: (dataSource: DataSource) => ({
        auth: createAuth(dataSource),
      }),
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
