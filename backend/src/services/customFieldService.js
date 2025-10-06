// backend/src/services/customFieldService.js
import { CustomField, CustomFieldValue } from '../models/index.js';
import sequelize from '../config/database.js';

export const ALLOWED_FIELD_TYPES = [
  'Text',
  'Number',
  'Date',
  'Dropdown',
  'Checkbox',
  'Radio',
  'FileUpload',
];

export const isPrismaUniqueError = (error) => {
  return error.name === 'SequelizeUniqueConstraintError';
};

export const isPrismaNotFoundError = (error) => {
  return error.name === 'SequelizeEmptyResultError';
};

export const createCustomField = async (input, userId) => {
  const transaction = await sequelize.transaction();
  
  try {
    // Get the highest order for the entity
    const maxOrderField = await CustomField.findOne({
      where: { entity: input.entity },
      order: [['order', 'DESC']],
      transaction
    });
    
    const order = maxOrderField ? maxOrderField.order + 1 : 0;
    
    const customField = await CustomField.create({
      ...input,
      order,
      createdBy: userId
    }, { transaction });
    
    await transaction.commit();
    return customField;
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

export const listCustomFields = async (entity) => {
  return CustomField.findAll({
    where: { entity },
    order: [
      ['group', 'ASC'],
      ['order', 'ASC']
    ]
  });
};

export const getCustomFieldById = async (id) => {
  return CustomField.findByPk(id);
};

export const updateCustomField = async (id, data, userId) => {
  const field = await CustomField.findByPk(id);
  
  if (!field) {
    throw new Error('Custom field not found');
  }
  
  field.set({
    ...data,
    updatedBy: userId
  });
  
  await field.save();
  return field;
};

export const deleteCustomField = async (id) => {
  const field = await CustomField.findByPk(id);
  
  if (!field) {
    throw new Error('Custom field not found');
  }
  
  await field.destroy();
  return true;
};

export const reorderCustomFields = async (fields) => {
  const transaction = await sequelize.transaction();
  
  try {
    for (const field of fields) {
      await CustomField.update(
        { 
          order: field.order,
          group: field.group
        },
        { 
          where: { id: field.id },
          transaction
        }
      );
    }
    
    await transaction.commit();
    return true;
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};