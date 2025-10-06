// backend/src/routes/customFieldValueRoutes.js
import { Router } from 'express';
import { body, param, query, validationResult } from 'express-validator';
import { authenticate } from '../middleware/auth.js';
import { CustomField, CustomFieldValue } from '../models/index.js';
import { validateValueAgainstField } from '../utils/validation.js';

const router = Router();

const handleValidation = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, error: errors.array()[0].msg });
  }
  return next();
};

router.use(authenticate);

router.get(
  '/',
  [
    query('entity').isString().notEmpty().withMessage('entity is required'),
    query('entityId').isString().notEmpty().withMessage('entityId is required'),
  ],
  handleValidation,
  async (req, res) => {
    try {
      const { entity, entityId } = req.query;
      
      const values = await CustomFieldValue.findAll({
        where: { entity, entityId },
        include: [
          {
            model: CustomField,
            as: 'field',
            attributes: ['id', 'key', 'fieldType', 'label', 'required']
          }
        ],
        order: [
          [{ model: CustomField, as: 'field' }, 'group', 'ASC'],
          [{ model: CustomField, as: 'field' }, 'order', 'ASC']
        ]
      });
      
      const formattedValues = values.map(value => {
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
      
      return res.json({ success: true, data: formattedValues });
    } catch (error) {
      console.error('Failed to fetch custom field values', error);
      return res.status(500).json({ success: false, error: 'Failed to fetch custom field values' });
    }
  }
);

router.post(
  '/',
  [
    body('entity').isString().notEmpty(),
    body('entityId').isString().notEmpty(),
    body('fieldId').isString().notEmpty(),
    body('value').exists(),
  ],
  handleValidation,
  async (req, res) => {
    try {
      const { entity, entityId, fieldId, value } = req.body;
      
      // Find the field to validate against
      const field = await CustomField.findByPk(fieldId);
      if (!field) {
        return res.status(404).json({ success: false, error: 'Field not found' });
      }
      
      // Validate the value against the field
      const validationResult = validateValueAgainstField(
        {
          fieldType: field.fieldType,
          label: field.label,
          required: field.required,
          validation: field.validation
        },
        value
      );
      
      if (!validationResult.valid) {
        return res.status(400).json({ 
          success: false, 
          error: validationResult.error || 'Invalid value for field' 
        });
      }
      
      // Create the field value
      const created = await CustomFieldValue.create({
        entity,
        entityId,
        fieldId,
        value,
        createdBy: req.user.id
      });
      
      return res.status(201).json({ success: true, data: created });
    } catch (error) {
      console.error('Failed to create custom field value', error);
      return res.status(500).json({ success: false, error: 'Failed to create custom field value' });
    }
  }
);

router.put(
  '/:id',
  [
    param('id').isString().notEmpty(),
    body('value').exists(),
  ],
  handleValidation,
  async (req, res) => {
    try {
      const { id } = req.params;
      const { value } = req.body;
      
      // Find the value record with its field
      const record = await CustomFieldValue.findByPk(id, {
        include: [{ model: CustomField, as: 'field' }]
      });
      
      if (!record || !record.field) {
        return res.status(404).json({ success: false, error: 'Custom field value not found' });
      }
      
      // Validate the value against the field
      const validationResult = validateValueAgainstField(
        {
          fieldType: record.field.fieldType,
          label: record.field.label,
          required: record.field.required,
          validation: record.field.validation
        },
        value
      );
      
      if (!validationResult.valid) {
        return res.status(400).json({ 
          success: false, 
          error: validationResult.error || 'Invalid value for field' 
        });
      }
      
      // Update the value
      await record.update({
        value,
        updatedBy: req.user.id
      });
      
      return res.json({ success: true, data: record });
    } catch (error) {
      console.error('Failed to update custom field value', error);
      return res.status(500).json({ success: false, error: 'Failed to update custom field value' });
    }
  }
);

router.delete(
  '/:id',
  [param('id').isString().notEmpty()],
  handleValidation,
  async (req, res) => {
    try {
      const { id } = req.params;
      const record = await CustomFieldValue.findByPk(id);
      
      if (!record) {
        return res.status(404).json({ success: false, error: 'Custom field value not found' });
      }
      
      await record.destroy();
      return res.json({ success: true, data: true });
    } catch (error) {
      console.error('Failed to delete custom field value', error);
      return res.status(500).json({ success: false, error: 'Failed to delete custom field value' });
    }
  }
);

router.post(
  '/bulk',
  [
    body('values').isArray().withMessage('values must be an array'),
    body('values.*.entity').isString().notEmpty(),
    body('values.*.entityId').isString().notEmpty(),
    body('values.*.fieldId').isString().notEmpty(),
    body('values.*.value').exists(),
  ],
  handleValidation,
  async (req, res) => {
    try {
      const { values } = req.body;
      const results = [];
      
      // Use a transaction to ensure all operations succeed or fail together
      await sequelize.transaction(async (transaction) => {
        for (const item of values) {
          // Find the field to validate against
          const field = await CustomField.findByPk(item.fieldId, { transaction });
          if (!field) {
            throw new Error(`Field not found: ${item.fieldId}`);
          }
          
          // Validate the value against the field
          const validationResult = validateValueAgainstField(
            {
              fieldType: field.fieldType,
              label: field.label,
              required: field.required,
              validation: field.validation
            },
            item.value
          );
          
          if (!validationResult.valid) {
            throw new Error(`Invalid value for field ${field.label}: ${validationResult.error}`);
          }
          
          // Check if value exists
          const existing = await CustomFieldValue.findOne({
            where: {
              fieldId: item.fieldId,
              entity: item.entity,
              entityId: item.entityId
            },
            transaction
          });
          
          let result;
          if (existing) {
            // Update
            result = await existing.update({
              value: item.value,
              updatedBy: req.user.id
            }, { transaction });
          } else {
            // Create
            result = await CustomFieldValue.create({
              fieldId: item.fieldId,
              entity: item.entity,
              entityId: item.entityId,
              value: item.value,
              createdBy: req.user.id
            }, { transaction });
          }
          
          results.push(result);
        }
      });
      
      return res.json({ success: true, data: results });
    } catch (error) {
      console.error('Failed to bulk upsert custom field values', error);
      return res.status(400).json({ success: false, error: error.message });
    }
  }
);

export default router;