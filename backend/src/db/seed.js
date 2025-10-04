import 'dotenv/config';
import bcrypt from 'bcrypt';
import { pool } from './pool.js';
import { config } from '../config/env.js';

const ADMIN_USER = {
  name: 'Super Admin',
  email: 'admin@example.com',
  password: 'password123',
  status: 'active',
};

const ADMIN_ROLE = {
  name: 'Admin',
  description: 'System administrator with full access',
};

const ADMIN_PERMISSIONS = [
  { name: 'manage_users', description: 'Create and manage user accounts' },
  { name: 'manage_roles', description: 'Create and manage roles' },
  { name: 'manage_permissions', description: 'Create and manage permissions' },
];

const ensurePermissions = async (client) => {
  const names = ADMIN_PERMISSIONS.map((permission) => permission.name);
  const existing = await client.query(
    'SELECT id, name FROM permissions WHERE name = ANY($1)',
    [names]
  );

  const idByName = new Map(existing.rows.map((row) => [row.name, row.id]));

  for (const permission of ADMIN_PERMISSIONS) {
    if (!idByName.has(permission.name)) {
      const result = await client.query(
        `INSERT INTO permissions (name, description)
         VALUES ($1, $2)
         RETURNING id, name`,
        [permission.name, permission.description]
      );
      const inserted = result.rows[0];
      idByName.set(inserted.name, inserted.id);
    }
  }

  return idByName;
};

const ensureAdminRole = async (client, permissionIds) => {
  const existing = await client.query(
    'SELECT id FROM roles WHERE LOWER(name) = LOWER($1) LIMIT 1',
    [ADMIN_ROLE.name]
  );

  let roleId;
  if (existing.rows.length > 0) {
    roleId = existing.rows[0].id;
    await client.query(
      'UPDATE roles SET description = $2 WHERE id = $1',
      [roleId, ADMIN_ROLE.description]
    );
  } else {
    const result = await client.query(
      `INSERT INTO roles (name, description)
       VALUES ($1, $2)
       RETURNING id`,
      [ADMIN_ROLE.name, ADMIN_ROLE.description]
    );
    roleId = result.rows[0].id;
  }

  if (permissionIds.length > 0) {
    await client.query(
      `INSERT INTO role_permissions (role_id, permission_id)
       SELECT $1, UNNEST($2::int[])
       ON CONFLICT (role_id, permission_id) DO NOTHING`,
      [roleId, permissionIds]
    );
  }

  return roleId;
};

const createAdminUser = async (client, roleId) => {
  const passwordHash = await bcrypt.hash(ADMIN_USER.password, config.bcryptSaltRounds);

  await client.query(
    `INSERT INTO users (name, email, password_hash, role_id, status)
     VALUES ($1, $2, $3, $4, $5)
     ON CONFLICT (email) DO NOTHING`,
    [ADMIN_USER.name, ADMIN_USER.email, passwordHash, roleId, ADMIN_USER.status]
  );
};

const seed = async () => {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const { rows } = await client.query('SELECT COUNT(*)::int AS count FROM users');
    const userCount = rows[0]?.count ?? 0;

    if (userCount > 0) {
      await client.query('COMMIT');
      console.log('Users already exist. Skipping seed.');
      return;
    }

    const permissionMap = await ensurePermissions(client);
    const permissionIds = Array.from(permissionMap.values());
    const roleId = await ensureAdminRole(client, permissionIds);
    await createAdminUser(client, roleId);

    await client.query('COMMIT');
    console.log('Seed completed: default admin user created.');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Seed failed:', error.message);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
};

seed().catch((error) => {
  console.error(error);
  process.exit(1);
});
