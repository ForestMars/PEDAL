import { createClient } from '@supabase/supabase-js';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { OpenAPISchema } from './oas-generator';

export async function setupDatabase(input: { oas: OpenAPISchema }): Promise<{
  supabase: any;
  drizzle: any;
}> {
  const { oas } = input;
  
  // Initialize Supabase client
  const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_KEY!
  );
  
  // Initialize PostgreSQL connection
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL
  });
  
  // Initialize Drizzle ORM
  const db = drizzle(pool);
  
  // Create tables based on OAS schemas
  for (const [name, schema] of Object.entries(oas.components.schemas)) {
    const columns = Object.entries(schema.properties).map(([propName, prop]) => {
      let type = 'text';
      
      switch (prop.type) {
        case 'string':
          type = 'text';
          break;
        case 'number':
          type = 'numeric';
          break;
        case 'boolean':
          type = 'boolean';
          break;
        case 'array':
          type = 'jsonb';
          break;
        case 'object':
          type = 'jsonb';
          break;
      }
      
      return {
        name: propName,
        type,
        required: schema.required?.includes(propName) ?? false
      };
    });
    
    // Create table SQL
    const createTableSQL = `
      CREATE TABLE IF NOT EXISTS ${name.toLowerCase()} (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        ${columns.map(col => 
          `${col.name} ${col.type}${col.required ? ' NOT NULL' : ''}`
        ).join(',\n')}
      );
    `;
    
    // Execute table creation
    await pool.query(createTableSQL);
  }
  
  return {
    supabase,
    drizzle: db
  };
} 