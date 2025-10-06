// backend/src/models/CustomFieldValue.js
import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';
import CustomField from './CustomField.js';

const CustomFieldValue = sequelize.define('CustomFieldValue', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  entity: {
    type: DataTypes.STRING,
    allowNull: false
  },
  entityId: {
    type: DataTypes.STRING,
    allowNull: false,
    field: 'entity_id'
  },
  fieldId: {
    type: DataTypes.UUID,
    allowNull: false,
    field: 'field_id',
    references: {
      model: 'custom_fields',
      key: 'id'
    }
  },
  value: {
    type: DataTypes.TEXT,
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
  tableName: 'custom_field_values',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

// Define the association
CustomFieldValue.belongsTo(CustomField, { foreignKey: 'field_id', as: 'field' });

export default CustomFieldValue;