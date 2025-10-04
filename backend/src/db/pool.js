import { Pool } from 'pg';
import { config } from '../config/env.js';

const connectionOptions = config.databaseUrl
  ? { connectionString: config.databaseUrl }
  : {
      host: config.db.host,
      port: config.db.port,
      user: config.db.user,
      password: config.db.password,
      database: config.db.database,
    };

export const pool = new Pool(connectionOptions);

export const verifyDatabaseConnection = async () => {
  const client = await pool.connect();
  try {
    await client.query('SELECT 1');
  } finally {
    client.release();
  }
};

export const query = async (text, params) => {
  const client = await pool.connect();
  try {
    return await client.query(text, params);
  } finally {
    client.release();
  }
};
