// backend/src/models/CustomField.js
import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const CustomField = sequelize.define('CustomField', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  entity: {
    type: DataTypes.STRING,
    allowNull: false
  },
  fieldType: {
    type: DataTypes.STRING,
    allowNull: false,
    field: 'field_type'
  },
  label: {
    type: DataTypes.STRING,
    allowNull: false
  },
  key: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  required: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false
  },
  validation: {
    type: DataTypes.JSONB,
    allowNull: true,
    defaultValue: {}
  },
  defaultValue: {
    type: DataTypes.STRING,
    allowNull: true,
    field: 'default_value'
  },
  order: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  },
  group: {
    type: DataTypes.STRING,
    allowNull: true
  },
  createdBy: {
    type: DataTypes.STRING,
    allowNull: true,
    field: 'created_by'
  },
  updatedBy: {
    type: DataTypes.STRING,
    allowNull: true,
    field: 'updated_by'
  }
}, {
  tableName: 'custom_fields',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

export default CustomField;