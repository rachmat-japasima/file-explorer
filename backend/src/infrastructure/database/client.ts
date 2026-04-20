import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('DATABASE_URL environment variable is required');
}

// postgres-js client — Bun-compatible
const client = postgres(connectionString, {
  max: 20, // connection pool size — tune for your workload
  idle_timeout: 30,
  connect_timeout: 10,
});

export const db = drizzle(client, { schema });

export type Database = typeof db;
