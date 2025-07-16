import { drizzle } from 'drizzle-orm/d1';
import { migrate } from 'drizzle-orm/d1/migrator';
import * as schema from './schema/index';

export async function runMigrations(d1Database: D1Database) {
  const db = drizzle(d1Database, { schema });
  
  try {
    await migrate(db, { migrationsFolder: './src/migrations' });
    console.log('✅ Database migrations completed successfully');
  } catch (error) {
    console.error('❌ Database migration failed:', error);
    throw error;
  }
}