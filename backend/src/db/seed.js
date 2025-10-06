import 'dotenv/config';
import bcrypt from 'bcrypt';
import sequelize from '../config/database.js';
import { User, Role, Permission, RolePermission } from '../models/index.js';
import { config } from '../config/env.js';

const ADMIN_USER = {
  name: 'Super Admin',
  email: 'admin@example.com',
  password: 'admin123',
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

const ensurePermissions = async (transaction) => {
  const permissionMap = new Map();
  
  for (const perm of ADMIN_PERMISSIONS) {
    const [permission] = await Permission.findOrCreate({
      where: { name: perm.name },
      defaults: { description: perm.description },
      transaction
    });
    
    permissionMap.set(perm.name, permission.id);
  }
  
  return permissionMap;
};

const ensureAdminRole = async (transaction, permissionIds) => {
  const [role] = await Role.findOrCreate({
    where: { name: ADMIN_ROLE.name },
    defaults: { description: ADMIN_ROLE.description },
    transaction
  });
  
  // Ensure role has all permissions
  const existingPermissions = await RolePermission.findAll({
    where: { role_id: role.id },
    transaction
  });
  
  const existingPermissionIds = new Set(existingPermissions.map(rp => rp.permission_id));
  
  const newPermissions = permissionIds.filter(id => !existingPermissionIds.has(id))
    .map(permissionId => ({
      role_id: role.id,
      permission_id: permissionId
    }));
  
  if (newPermissions.length > 0) {
    await RolePermission.bulkCreate(newPermissions, { transaction });
  }
  
  return role.id;
};

const createAdminUser = async (transaction, roleId) => {
  const passwordHash = await bcrypt.hash(ADMIN_USER.password, config.bcryptSaltRounds);
  
  const [user] = await User.findOrCreate({
    where: { email: ADMIN_USER.email },
    defaults: {
      name: ADMIN_USER.name,
      password_hash: passwordHash,
      role_id: roleId,
      status: ADMIN_USER.status
    },
    transaction
  });
  
  return user;
};


const seed = async () => {
  const transaction = await sequelize.transaction();
  
  try {
    // Check if users exist
    const userCount = await User.count({ transaction });
    
    if (userCount > 0) {
      await transaction.commit();
      console.log('Users already exist. Skipping seed.');
      return;
    }
    
    const permissionMap = await ensurePermissions(transaction);
    const permissionIds = Array.from(permissionMap.values());
    const roleId = await ensureAdminRole(transaction, permissionIds);
    await createAdminUser(transaction, roleId);
    
    // Add this line to set up default module permissions
    await setupDefaultModulePermissions(transaction, roleId);
    
    await transaction.commit();
    console.log('Seed completed: default admin user created.');
  } catch (error) {
    await transaction.rollback();
    console.error('Seed failed:', error.message);
    throw error;
  } finally {
    await sequelize.close();
  }
};

const setupDefaultModulePermissions = async (transaction, roleId) => {
  // Check if module permissions already exist for this role
  const existingPermissions = await ModulePermission.count({
    where: { role_id: roleId },
    transaction
  });
  
  if (existingPermissions > 0) {
    console.log('Module permissions already exist for this role. Skipping.');
    return;
  }
  
  // Add default permissions for all modules
  const modules = APPLICATION_MODULES.map(module => module.key);
  const allActions = ['read', 'create', 'update', 'delete'];
  
  const modulePermissions = modules.map(module => ({
    role_id: roleId,
    module,
    actions: allActions
  }));
  
  await ModulePermission.bulkCreate(modulePermissions, { transaction });
  console.log(`Added default module permissions for role ID ${roleId}`);
};
seed();