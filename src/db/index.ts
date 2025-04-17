import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema';

// Initialize PostgreSQL connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

// Initialize Drizzle ORM
export const db = drizzle(pool, { schema });

// Export schema
export { schema }; 