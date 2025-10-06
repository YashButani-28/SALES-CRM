// backend/src/models/ModulePermission.js
import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const ModulePermission = sequelize.define('ModulePermission', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  role_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'roles',
      key: 'id'
    }
  },
  module: {
    type: DataTypes.STRING,
    allowNull: false
  },
  actions: {
    type: DataTypes.JSONB,
    allowNull: false,
    defaultValue: []
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  updated_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'module_permissions',
  timestamps: false
});

export default ModulePermission;