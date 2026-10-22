import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { getDatabaseOptions } from './database-options';

export default new DataSource(getDatabaseOptions());
