import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { getDatabaseOptions } from './database/database-options';
import { createAuth } from './modules/auth/auth';
import { AuthModule } from '@thallesp/nestjs-better-auth';
import { DataSource } from 'typeorm';

@Module({
  imports: [
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
