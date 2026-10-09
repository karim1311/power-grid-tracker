import { readFileSync } from 'node:fs';
import { Pool } from '@neondatabase/serverless';

const file = process.argv[2];
if (!file) throw new Error('Usage: node --env-file=.env.local scripts/run-sql.mjs <file.sql>');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
try {
  const result = await pool.query(readFileSync(file, 'utf8'));
  console.log('Done.', Array.isArray(result) ? result.at(-1).rows : result.rows);
} finally {
  await pool.end();
}