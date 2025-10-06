// backend/src/services/permissionService.js
import { Permission } from '../models/index.js';

export const listPermissions = async () => {
  return Permission.findAll({
    order: [['name', 'ASC']]
  });
};

export const createPermission = async ({ name, description }) => {
  return Permission.create({
    name,
    description
  });
};

export const getPermissionById = async (id) => {
  return Permission.findByPk(id);
};