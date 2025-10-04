import bcrypt from 'bcrypt';
import { config } from '../config/env.js';
import { query } from '../db/pool.js';
import { MODULE_ACTIONS } from '../constants/modules.js';

export const findUserByEmail = async (email) => {
  const result = await query(
    `SELECT u.*, r.name as role_name
     FROM users u
     LEFT JOIN roles r ON u.role_id = r.id
     WHERE u.email = $1`,
    [email]
  );
  return result.rows[0];
};

export const findUserById = async (id) => {
  const result = await query(
    `SELECT u.*, r.name AS role_name
     FROM users u
     LEFT JOIN roles r ON u.role_id = r.id
     WHERE u.id = $1`,
    [id]
  );
  return result.rows[0];
};

export const getUserByIdWithPermissions = async (id) => {
  const result = await query(
    `SELECT 
        u.id,
        u.name,
        u.email,
        u.status,
        u.created_at,
        u.updated_at,
        r.id AS role_id,
        r.name AS role_name,
        json_agg(DISTINCT p.name) FILTER (WHERE p.name IS NOT NULL) AS permissions,
        COALESCE(json_agg(DISTINCT jsonb_build_object(
            'module', rmp.module,
            'can_read', rmp.can_read,
            'can_create', rmp.can_create,
            'can_update', rmp.can_update,
            'can_delete', rmp.can_delete
        )) FILTER (WHERE rmp.module IS NOT NULL), '[]') AS module_permissions
     FROM users u
     LEFT JOIN roles r ON u.role_id = r.id
     LEFT JOIN role_permissions rp ON rp.role_id = r.id
     LEFT JOIN permissions p ON p.id = rp.permission_id
     LEFT JOIN role_module_permissions rmp ON rmp.role_id = r.id
     WHERE u.id = $1 AND u.status = 'active'
     GROUP BY u.id, r.id`,
    [id]
  );

  const row = result.rows[0];
  if (!row) {
    return null;
  }

  const rawModulePermissions = Array.isArray(row.module_permissions) ? row.module_permissions : [];

  return {
    id: row.id,
    name: row.name,
    email: row.email,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    role: row.role_id
      ? { id: row.role_id, name: row.role_name }
      : null,
    permissions: row.permissions ? row.permissions.filter(Boolean) : [],
    modulePermissions: rawModulePermissions.map((item) => ({
          module: item.module,
          actions: MODULE_ACTIONS.filter((action) => item[`can_${action}`]),
        })),
  };
};

export const createUser = async ({ name, email, password, roleId, status = 'active' }) => {
  const existing = await findUserByEmail(email);
  if (existing) {
    const error = new Error('Email is already in use');
    error.status = 409;
    throw error;
  }

  const passwordHash = await bcrypt.hash(password, config.bcryptSaltRounds);

  const result = await query(
    `INSERT INTO users (name, email, password_hash, role_id, status)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id, name, email, role_id, status, created_at, updated_at`,
    [name, email, passwordHash, roleId ?? null, status]
  );

  return result.rows[0];
};

export const updatePasswordById = async (id, newPassword) => {
  const passwordHash = await bcrypt.hash(newPassword, config.bcryptSaltRounds);
  await query(
    `UPDATE users
     SET password_hash = $1,
         updated_at = NOW()
     WHERE id = $2`,
    [passwordHash, id]
  );
};

export const updatePasswordByEmail = async (email, newPassword) => {
  const passwordHash = await bcrypt.hash(newPassword, config.bcryptSaltRounds);
  const result = await query(
    `UPDATE users
     SET password_hash = $1,
         updated_at = NOW()
     WHERE LOWER(email) = LOWER($2)
     RETURNING id, email`,
    [passwordHash, email]
  );
  return result.rows[0];
};
