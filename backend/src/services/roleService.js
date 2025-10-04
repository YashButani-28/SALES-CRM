import { pool } from '../db/pool.js';
import { query } from '../db/pool.js';
import { MODULE_ACTIONS } from '../constants/modules.js';

export const createRole = async ({ name, description, permissionIds = [] }) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const roleResult = await client.query(
      `INSERT INTO roles (name, description)
       VALUES ($1, $2)
       RETURNING id, name, description, created_at, updated_at`,
      [name, description || null]
    );

    const role = roleResult.rows[0];

    if (permissionIds.length > 0) {
      await client.query(
        `INSERT INTO role_permissions (role_id, permission_id)
         SELECT $1, UNNEST($2::int[])
         ON CONFLICT (role_id, permission_id) DO NOTHING`,
        [role.id, permissionIds]
      );
    }

    await client.query('COMMIT');

    return role;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

export const listRolesWithPermissions = async () => {
  const result = await query(
    `SELECT r.id,
            r.name,
            r.description,
            r.created_at,
            r.updated_at,
            COALESCE(json_agg(DISTINCT jsonb_build_object('id', p.id, 'name', p.name))
                     FILTER (WHERE p.id IS NOT NULL), '[]') AS permissions,
            COALESCE(json_agg(DISTINCT jsonb_build_object(
                'module', rmp.module,
                'can_read', rmp.can_read,
                'can_create', rmp.can_create,
                'can_update', rmp.can_update,
                'can_delete', rmp.can_delete
            )) FILTER (WHERE rmp.module IS NOT NULL), '[]') AS module_permissions
     FROM roles r
     LEFT JOIN role_permissions rp ON rp.role_id = r.id
     LEFT JOIN permissions p ON p.id = rp.permission_id
     LEFT JOIN role_module_permissions rmp ON rmp.role_id = r.id
     GROUP BY r.id
     ORDER BY r.name`
  );

  return result.rows.map((row) => {
    const rawModulePermissions = Array.isArray(row.module_permissions) ? row.module_permissions : [];

    const rawPermissions = Array.isArray(row.permissions) ? row.permissions : [];

    return {
      id: row.id,
      name: row.name,
      description: row.description,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      permissions: rawPermissions,
      modulePermissions: rawModulePermissions.map((item) => ({
        module: item.module,
        actions: MODULE_ACTIONS.filter((action) => item[`can_${action}`]),
      })),
    };
  });
};

export const getRoleModulePermissions = async (roleId) => {
  const result = await query(
    `SELECT module, can_read, can_create, can_update, can_delete
     FROM role_module_permissions
     WHERE role_id = $1
     ORDER BY module`,
    [roleId]
  );

  return result.rows.map((row) => ({
    module: row.module,
    actions: MODULE_ACTIONS.filter((action) => row[`can_${action}`]),
  }));
};

export const setRoleModulePermissions = async (roleId, moduleAssignments = []) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    await client.query('DELETE FROM role_module_permissions WHERE role_id = $1', [roleId]);

    for (const assignment of moduleAssignments) {
      if (!assignment?.module) {
        continue;
      }
      const moduleKey = String(assignment.module);
      const actions = Array.isArray(assignment.actions) ? assignment.actions : [];
      const values = MODULE_ACTIONS.reduce(
        (acc, action) => ({ ...acc, [action]: actions.includes(action) }),
        {}
      );

      await client.query(
        `INSERT INTO role_module_permissions (
            role_id,
            module,
            can_read,
            can_create,
            can_update,
            can_delete
         )
         VALUES ($1, $2, $3, $4, $5, $6)
         ON CONFLICT (role_id, module)
         DO UPDATE SET
           can_read = EXCLUDED.can_read,
           can_create = EXCLUDED.can_create,
           can_update = EXCLUDED.can_update,
           can_delete = EXCLUDED.can_delete,
           updated_at = NOW();`,
        [
          roleId,
          moduleKey,
          values.read || false,
          values.create || false,
          values.update || false,
          values.delete || false,
        ]
      );
    }

    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};
