import bcrypt from 'bcrypt';
import { config } from '../config/env.js';
import { User, Role, Permission, ModulePermission } from '../models/index.js';
import { MODULE_ACTIONS } from '../constants/modules.js';

export const findUserByEmail = async (email) => {
  const user = await User.findOne({
    where: { email },
    include: [
      {
        model: Role,
        as: 'role',
        attributes: ['id', 'name']
      }
    ],
    raw: true,
    nest: true
  });
  
  if (user) {
    user.role_name = user.role?.name;
  }
  
  return user;
};

export const findUserById = async (id) => {
  const user = await User.findOne({
    where: { id },
    include: [
      {
        model: Role,
        as: 'role',
        attributes: ['id', 'name']
      }
    ],
    raw: true,
    nest: true
  });
  
  if (user) {
    user.role_name = user.role?.name;
  }
  
  return user;
};

export const getUserByIdWithPermissions = async (id) => {
  const user = await User.findOne({
    where: { id },
    include: [
      {
        model: Role,
        as: 'role',
        attributes: ['id', 'name'],
        include: [
          {
            model: Permission,
            as: 'permissions',
            attributes: ['id', 'name'],
            through: { attributes: [] }
          }
        ]
      }
    ]
  });

  if (!user) return null;

  // Get module permissions
  let modulePermissions = [];
  try {
    modulePermissions = await ModulePermission.findAll({
      where: { role_id: user.role_id },
      raw: true
    });
  } catch (error) {
    console.error('Error fetching module permissions:', error);
    // Continue without module permissions if table doesn't exist
  }

  const userObj = user.toJSON();
  
  return {
    id: userObj.id,
    name: userObj.name,
    email: userObj.email,
    status: userObj.status,
    role_id: userObj.role_id,
    role: {
      id: userObj.role?.id,
      name: userObj.role?.name
    },
    permissions: userObj.role?.permissions.map(p => p.name) || [],
    modulePermissions: modulePermissions.map(mp => ({
      module: mp.module,
      actions: mp.actions
    }))
  };
};

export const createUser = async ({ name, email, password, roleId, status = 'active' }) => {
  const passwordHash = await bcrypt.hash(password, config.bcryptSaltRounds);
  
  const user = await User.create({
    name,
    email,
    password_hash: passwordHash,
    role_id: roleId,
    status
  });
  
  return getUserByIdWithPermissions(user.id);
};

export const updatePasswordById = async (userId, newPassword) => {
  const passwordHash = await bcrypt.hash(newPassword, config.bcryptSaltRounds);
  
  await User.update(
    { password_hash: passwordHash, updated_at: new Date() },
    { where: { id: userId } }
  );
  
  return true;
};

export const updatePasswordByEmail = async (email, newPassword) => {
  const passwordHash = await bcrypt.hash(newPassword, config.bcryptSaltRounds);
  
  await User.update(
    { password_hash: passwordHash, updated_at: new Date() },
    { where: { email } }
  );
  
  return true;
};