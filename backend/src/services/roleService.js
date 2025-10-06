// backend/src/services/roleService.js
import { Role, Permission, RolePermission, ModulePermission } from '../models/index.js';
import sequelize from '../config/database.js';

export const createRole = async ({ name, description, permissionIds }) => {
  const transaction = await sequelize.transaction();
  
  try {
    const role = await Role.create(
      { name, description },
      { transaction }
    );
    
    if (permissionIds && permissionIds.length > 0) {
      const rolePermissions = permissionIds.map(permissionId => ({
        role_id: role.id,
        permission_id: permissionId
      }));
      
      await RolePermission.bulkCreate(rolePermissions, { transaction });
    }
    
    await transaction.commit();
    
    return getRoleWithPermissions(role.id);
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

export const listRolesWithPermissions = async () => {
  const roles = await Role.findAll({
    include: [
      {
        model: Permission,
        as: 'permissions',
        through: { attributes: [] }
      }
    ]
  });
  
  return roles.map(role => {
    const roleObj = role.toJSON();
    return {
      id: roleObj.id,
      name: roleObj.name,
      description: roleObj.description,
      permissions: roleObj.permissions.map(p => ({
        id: p.id,
        name: p.name,
        description: p.description
      }))
    };
  });
};

export const getRoleWithPermissions = async (roleId) => {
  const role = await Role.findByPk(roleId, {
    include: [
      {
        model: Permission,
        as: 'permissions',
        through: { attributes: [] }
      }
    ]
  });
  
  if (!role) return null;
  
  const roleObj = role.toJSON();
  return {
    id: roleObj.id,
    name: roleObj.name,
    description: roleObj.description,
    permissions: roleObj.permissions.map(p => ({
      id: p.id,
      name: p.name,
      description: p.description
    }))
  };
};

export const getRoleModulePermissions = async (roleId) => {
  const modulePermissions = await ModulePermission.findAll({
    where: { role_id: roleId },
    raw: true
  });
  
  return modulePermissions.map(mp => ({
    module: mp.module,
    actions: mp.actions
  }));
};

export const setRoleModulePermissions = async (roleId, permissions) => {
  const transaction = await sequelize.transaction();
  
  try {
    // Delete existing permissions
    await ModulePermission.destroy({
      where: { role_id: roleId },
      transaction
    });
    
    // Create new permissions
    if (permissions && permissions.length > 0) {
      const modulePermissions = permissions.map(p => ({
        role_id: roleId,
        module: p.module,
        actions: p.actions
      }));
      
      await ModulePermission.bulkCreate(modulePermissions, { transaction });
    }
    
    await transaction.commit();
    return true;
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};