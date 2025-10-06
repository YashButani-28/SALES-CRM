import { validationResult } from 'express-validator';
import {
  createRole,
  listRolesWithPermissions,
  getRoleModulePermissions,
  setRoleModulePermissions,
} from '../services/roleService.js';
import { getModuleActions, listModules } from '../services/moduleService.js';

export const createRoleController = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { name, description, permissionIds } = req.body;
  const normalizedPermissionIds = Array.isArray(permissionIds) ? permissionIds : [];

  try {
    const role = await createRole({ name, description, permissionIds: normalizedPermissionIds });
    return res.status(201).json({ role });
  } catch (error) {
    return next(error);
  }
};

export const listRolesController = async (req, res, next) => {
  try {
    const roles = await listRolesWithPermissions();
    return res.json({ roles });
  } catch (error) {
    return next(error);
  }
};

export const getRoleModulePermissionsController = async (req, res, next) => {
  const { roleId } = req.params;
  try {
    const permissions = await getRoleModulePermissions(Number(roleId));
    return res.json({ permissions });
  } catch (error) {
    return next(error);
  }
};

export const updateRoleModulePermissionsController = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { roleId } = req.params;
  const { permissions } = req.body;

  try {
    const allowedActions = new Set(getModuleActions());
    const validModules = new Set(listModules().map((module) => module.key));
    const normalized = (permissions || []).map((entry) => ({
      module: entry.module,
      actions: Array.isArray(entry.actions)
        ? entry.actions.filter((action) => allowedActions.has(action))
        : [],
    })).filter((entry) => validModules.has(entry.module));

    await setRoleModulePermissions(Number(roleId), normalized);
    const updated = await getRoleModulePermissions(Number(roleId));
    return res.json({ permissions: updated });
  } catch (error) {
    return next(error);
  }
};
