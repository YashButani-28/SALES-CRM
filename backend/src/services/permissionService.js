import { query } from '../db/pool.js';

export const createPermission = async ({ name, description }) => {
  const result = await query(
    `INSERT INTO permissions (name, description)
     VALUES ($1, $2)
     RETURNING id, name, description, created_at, updated_at`,
    [name, description || null]
  );

  return result.rows[0];
};

export const listPermissions = async () => {
  const result = await query(
    `SELECT id, name, description, created_at, updated_at
     FROM permissions
     ORDER BY name`
  );
  return result.rows;
};
