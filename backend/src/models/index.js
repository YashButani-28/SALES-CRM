// backend/src/models/index.js
import sequelize from '../config/database.js';
import User from './User.js';
import Role from './Role.js';
import Permission from './Permission.js';
import RolePermission from './RolePermission.js';
import CustomField from './CustomField.js';
import CustomFieldValue from './CustomFieldValue.js';
import ModulePermission from './ModulePermission.js';

export {
  sequelize,
  User,
  Role,
  Permission,
  RolePermission,
  CustomField,
  CustomFieldValue,
  ModulePermission
};