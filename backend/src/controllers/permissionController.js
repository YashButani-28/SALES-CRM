import { validationResult } from 'express-validator';
import { createPermission, listPermissions } from '../services/permissionService.js';

export const createPermissionController = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { name, description } = req.body;

  try {
    const permission = await createPermission({ name, description });
    return res.status(201).json({ permission });
  } catch (error) {
    return next(error);
  }
};

export const listPermissionsController = async (req, res, next) => {
  try {
    const permissions = await listPermissions();
    return res.json({ permissions });
  } catch (error) {
    return next(error);
  }
};
