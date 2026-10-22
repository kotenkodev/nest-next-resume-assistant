import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { getDatabaseOptions } from '../../database/database-options';
import { createAuth } from './auth';

const dataSource = new DataSource(getDatabaseOptions());

export const auth = createAuth(dataSource);
