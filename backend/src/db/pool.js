import { Pool } from 'pg';
import { config } from '../config/env.js';

export const pool = new Pool({ connectionString: config.databaseUrl });

export const query = async (text, params) => {
  const client = await pool.connect();
  try {
    return await client.query(text, params);
  } finally {
    client.release();
  }
};
