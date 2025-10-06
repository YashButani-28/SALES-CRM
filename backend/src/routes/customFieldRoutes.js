// backend/src/routes/customFieldRoutes.js
import { Router } from 'express';
import { body, param, query, validationResult } from 'express-validator';
import { authenticate } from '../middleware/auth.js';
import CustomField from '../models/CustomField.js';
import sequelize from '../config/database.js';

const router = Router();

const fieldTypeOptions = [
  'Text',
  'Number',
  'Date',
  'Dropdown',
  'Checkbox',
  'Radio',
  'FileUpload',
];

const handleValidation = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, error: errors.array()[0].msg });
  }
  return next();
};

// Use authentication middleware
router.use(authenticate);

// GET /api/custom-fields?entity=Lead
router.get(
  '/',
  [query('entity').isString().notEmpty().withMessage('entity is required')],
  handleValidation,
  async (req, res) => {
    try {
      const { entity } = req.query;
      const fields = await CustomField.findAll({
        where: { entity },
        order: [
          ['group', 'ASC'],
          ['order', 'ASC']
        ],
        raw: true
      });
      return res.json({ success: true, data: fields });
    } catch (error) {
      console.error('Failed to fetch custom fields', error);
      return res.status(500).json({ success: false, error: 'Failed to fetch custom fields' });
    }
  }
);

// POST /api/custom-fields
router.post(
  '/',
  [
    body('entity').isString().notEmpty(),
    body('fieldType').isIn(fieldTypeOptions),
    body('label').isString().notEmpty(),
    body('key').matches(/^[A-Za-z0-9_]+$/).withMessage('key must be alphanumeric with underscores'),
    body('required').isBoolean(),
  ],
  handleValidation,
  async (req, res) => {
    try {
      const data = req.body;
      
      // Log the incoming request for debugging
      console.log('Creating custom field with data:', JSON.stringify(data, null, 2));
      
      // Ensure validation is a valid JSON object
      let validation = {};
      if (data.validation) {
        try {
          // If validation is a string, try to parse it
          if (typeof data.validation === 'string') {
            validation = JSON.parse(data.validation);
          } else {
            validation = data.validation;
          }
          
          // Handle empty regex string
          if (validation.regex === '') {
            delete validation.regex;
          }
        } catch (e) {
          console.error('Error parsing validation JSON:', e);
          validation = {};
        }
      }
      
      // Find the maximum order for the entity
      let maxOrder = 0;
      try {
        maxOrder = await CustomField.max('order', {
          where: { entity: data.entity }
        }) || 0;
      } catch (e) {
        console.error('Error getting max order:', e);
        // Continue with default maxOrder = 0
      }
      
      const order = typeof data.order === 'number' ? data.order : maxOrder + 1;

      // Create the custom field
      const created = await CustomField.create({
        entity: data.entity,
        fieldType: data.fieldType,
        label: data.label,
        key: data.key,
        required: data.required,
        validation: validation,
        defaultValue: data.defaultValue || null,
        order,
        group: data.group || null,
        createdBy: req.user?.id || 'system',
        updatedBy: req.user?.id || 'system',
      });

      console.log('Custom field created successfully:', created.id);
      return res.status(201).json({ success: true, data: created });
    } catch (error) {
      console.error('Failed to create custom field:', error);
      
      if (error.name === 'SequelizeUniqueConstraintError') {
        return res.status(409).json({ success: false, error: 'Field key must be unique' });
      }
      
      return res.status(500).json({ 
        success: false, 
        error: 'Failed to create custom field',
        details: error.message
      });
    }
  }
);

// GET /api/custom-fields/:id
router.get(
  '/:id',
  [param('id').isString().notEmpty()],
  handleValidation,
  async (req, res) => {
    try {
      const { id } = req.params;
      
      console.log(`Fetching custom field with ID: ${id}`);
      
      const field = await CustomField.findByPk(id);
      
      if (!field) {
        console.log(`Custom field with ID ${id} not found`);
        return res.status(404).json({ success: false, error: 'Custom field not found' });
      }
      
      return res.json({ success: true, data: field });
    } catch (error) {
      console.error('Failed to fetch custom field:', error);
      return res.status(500).json({ success: false, error: 'Failed to fetch custom field' });
    }
  }
);

// PUT /api/custom-fields/:id
router.put(
  '/:id',
  [
    param('id').isString().notEmpty(),
    body('fieldType').optional().isIn(fieldTypeOptions),
    body('label').optional().isString().notEmpty(),
    body('required').optional().isBoolean(),
  ],
  handleValidation,
  async (req, res) => {
    try {
      const { id } = req.params;
      const data = req.body;
      
      console.log(`Updating custom field ${id} with data:`, JSON.stringify(data, null, 2));
      
      // Find the field
      const field = await CustomField.findByPk(id);
      
      if (!field) {
        console.log(`Custom field with ID ${id} not found`);
        return res.status(404).json({ success: false, error: 'Custom field not found' });
      }
      
      // Process validation if provided
      if (data.validation) {
        try {
          if (typeof data.validation === 'string') {
            data.validation = JSON.parse(data.validation);
          }
        } catch (e) {
          console.error('Error parsing validation JSON:', e);
          data.validation = {};
        }
      }
      
      // Update the field
      await field.update({
        ...data,
        updatedBy: req.user?.id || 'system'
      });
      
      return res.json({ success: true, data: field });
    } catch (error) {
      console.error('Failed to update custom field:', error);
      
      if (error.name === 'SequelizeUniqueConstraintError') {
        return res.status(409).json({ success: false, error: 'Field key must be unique' });
      }
      
      return res.status(500).json({ 
        success: false, 
        error: 'Failed to update custom field',
        details: error.message
      });
    }
  }
);

// DELETE /api/custom-fields/:id
router.delete(
  '/:id',
  [param('id').isString().notEmpty()],
  handleValidation,
  async (req, res) => {
    try {
      const { id } = req.params;
      
      console.log(`Deleting custom field ${id}`);
      
      // Find the field
      const field = await CustomField.findByPk(id);
      
      if (!field) {
        console.log(`Custom field with ID ${id} not found`);
        return res.status(404).json({ success: false, error: 'Custom field not found' });
      }
      
      // Delete the field
      await field.destroy();
      
      return res.json({ success: true, data: true });
    } catch (error) {
      console.error('Failed to delete custom field:', error);
      return res.status(500).json({ 
        success: false, 
        error: 'Failed to delete custom field',
        details: error.message
      });
    }
  }
);

// POST /api/custom-fields/reorder
router.post(
  '/reorder',
  [
    body('fields').isArray().withMessage('fields must be an array'),
    body('fields.*.id').isString().withMessage('Invalid field ID'),
    body('fields.*.order').isInt().withMessage('order must be an integer'),
  ],
  handleValidation,
  async (req, res) => {
    try {
      const { fields } = req.body;
      
      console.log(`Reordering ${fields.length} custom fields`);
      
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
        return res.json({ success: true, data: true });
      } catch (error) {
        await transaction.rollback();
        throw error;
      }
    } catch (error) {
      console.error('Failed to reorder custom fields:', error);
      return res.status(500).json({ 
        success: false, 
        error: 'Failed to reorder custom fields',
        details: error.message
      });
    }
  }
);

export default router;