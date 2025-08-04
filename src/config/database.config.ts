import { registerAs } from '@nestjs/config';
import * as process from 'node:process';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';

export default registerAs(
  'database',
  (): TypeOrmModuleOptions => ({
    type: 'postgres',
    host: process.env.PG_HOST,
    port: Number(process.env.PG_PORT ?? 3306),
    username: process.env.PG_USER,
    password: process.env.PG_PASS,
    database: process.env.PG_NAME,
    autoLoadEntities: true,
    synchronize: true,
  }),
);
