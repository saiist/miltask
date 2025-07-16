import { drizzle } from 'drizzle-orm/d1';
import * as schema from './schema/index';

export function createConnection(d1Database: D1Database) {
  return drizzle(d1Database, { schema });
}

export type Database = ReturnType<typeof createConnection>;