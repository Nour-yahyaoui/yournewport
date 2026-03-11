// lib/db.ts
import { neon } from '@neondatabase/serverless';

const connectionString = process.env.DATABASE_URL;
if (!connectionString) throw new Error('DATABASE_URL is not set in environment variables');

const sql = neon(connectionString);

export async function taggedQuery<T>(
  strings: TemplateStringsArray,
  ...values: any[]
): Promise<T[]> {
  try {
    const result = await sql(strings, ...values);
    return result as T[];
  } catch (error) {
    console.error('Tagged query error:', error);
    throw error;
  }
}

export async function parameterizedQuery<T>(
  query: string,
  params: any[] = []
): Promise<T[]> {
  try {
    const result = await sql.query(query, params);
    return result as T[];
  } catch (error) {
    console.error('Parameterized query error:', error);
    throw error;
  }
}