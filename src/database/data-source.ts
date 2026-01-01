import { DataSource } from 'typeorm';
import { config } from 'dotenv';
import * as path from 'path';

config();

export default new DataSource({
  type: 'postgres',
  host: process.env.DATABASE_HOST || 'localhost',
  port: parseInt(process.env.DATABASE_PORT, 10) || 5432,
  username: process.env.DATABASE_USER || 'postgres',
  password: process.env.DATABASE_PASSWORD || 'postgres',
  database: process.env.DATABASE_NAME || 'verisite_db',
  ssl: process.env.DATABASE_SSL === 'true',
  synchronize: false,
  logging: true,
  entities: [path.join(__dirname, 'entities', '**', '*.entity{.ts,.js}')],
  migrations: [path.join(__dirname, 'migrations', '**', '*.{.ts,.js}')],
});

