// backend/src/services/customFieldValueService.js
import { CustomField, CustomFieldValue } from '../models/index.js';
import sequelize from '../config/database.js';

export const getCustomFieldValues = async (entity, entityId) => {
  const values = await CustomFieldValue.findAll({
    where: { entity, entityId },
    include: [
      {
        model: CustomField,
        as: 'field',
        attributes: ['id', 'key', 'fieldType', 'label', 'required']
      }
    ]
  });
  
  return values.map(value => {
    const valueObj = value.toJSON();
    return {
      id: valueObj.id,
      fieldId: valueObj.fieldId,
      key: valueObj.field.key,
      fieldType: valueObj.field.fieldType,
      label: valueObj.field.label,
      value: valueObj.value
    };
  });
};

export const createCustomFieldValue = async (input, userId) => {
  return CustomFieldValue.create({
    ...input,
    createdBy: userId
  });
};

export const updateCustomFieldValue = async (id, value, userId) => {
  const fieldValue = await CustomFieldValue.findByPk(id); if (!fieldValue) {
    throw new Error('Custom field value not found');
  }
  
  return fieldValue.update({
    value,
    updatedBy: userId
  });
};

export const deleteCustomFieldValue = async (id) => {
  return CustomFieldValue.destroy({
    where: { id }
  });
};

export const bulkUpsertCustomFieldValues = async (values, userId) => {
  const transaction = await sequelize.transaction();
  
  try {
    const results = [];
    
    for (const item of values) {
      // Check if value exists
      const existing = await CustomFieldValue.findOne({
        where: {
          fieldId: item.fieldId,
          entity: item.entity,
          entityId: item.entityId
        },
        transaction
      });
      
      if (existing) {
        // Update
        const updated = await existing.update({
          value: item.value,
          updatedBy: userId
        }, { transaction });
        
        results.push(updated);
      } else {
        // Create
        const created = await CustomFieldValue.create({
          fieldId: item.fieldId,
          entity: item.entity,
          entityId: item.entityId,
          value: item.value,
          createdBy: userId
        }, { transaction });
        
        results.push(created);
      }
    }
    
    await transaction.commit();
    return results;
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};
