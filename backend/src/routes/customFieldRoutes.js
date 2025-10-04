import { Router } from 'express';
import { body, param, query, validationResult } from 'express-validator';
import { PrismaClient } from '@prisma/client';
import { jwtAuth } from '../middleware/jwtAuth.js';
import { requireAdmin } from '../middleware/requireAdmin.js';

const prisma = new PrismaClient();
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

router.use(jwtAuth, requireAdmin);

router.get(
  '/',
  [query('entity').isString().notEmpty().withMessage('entity is required')],
  handleValidation,
  async (req, res) => {
    try {
      const { entity } = req.query;
      const fields = await prisma.customField.findMany({
        where: { entity },
        orderBy: [{ group: 'asc' }, { order: 'asc' }],
      });
      return res.json({ success: true, data: fields });
    } catch (error) {
      console.error('Failed to fetch custom fields', error);
      return res.status(500).json({ success: false, error: 'Failed to fetch custom fields' });
    }
  }
);

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
      const existingMax = await prisma.customField.aggregate({
        where: { entity: data.entity },
        _max: { order: true },
      });

      const order = typeof data.order === 'number' ? data.order : (existingMax._max.order ?? 0) + 1;

      const created = await prisma.customField.create({
        data: {
          entity: data.entity,
          fieldType: data.fieldType,
          label: data.label,
          key: data.key,
          required: data.required,
          validation: data.validation ?? null,
          defaultValue: data.defaultValue ?? null,
          order,
          group: data.group ?? null,
          createdBy: req.user.id,
          updatedBy: req.user.id,
        },
      });

      return res.status(201).json({ success: true, data: created });
    } catch (error) {
      if (error.code === 'P2002') {
        return res.status(409).json({ success: false, error: 'Field key must be unique' });
      }
      console.error('Failed to create custom field', error);
      return res.status(500).json({ success: false, error: 'Failed to create custom field' });
    }
  }
);

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
      const updated = await prisma.customField.update({
        where: { id },
        data: {
          ...data,
          validation: data.validation ?? undefined,
          defaultValue: data.defaultValue ?? undefined,
          group: typeof data.group === 'undefined' ? undefined : data.group,
          updatedBy: req.user.id,
        },
      });
      return res.json({ success: true, data: updated });
    } catch (error) {
      if (error.code === 'P2002') {
        return res.status(409).json({ success: false, error: 'Field key must be unique' });
      }
      if (error.code === 'P2025') {
        return res.status(404).json({ success: false, error: 'Custom field not found' });
      }
      console.error('Failed to update custom field', error);
      return res.status(500).json({ success: false, error: 'Failed to update custom field' });
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
      await prisma.customField.delete({ where: { id } });
      return res.json({ success: true, data: true });
    } catch (error) {
      if (error.code === 'P2025') {
        return res.status(404).json({ success: false, error: 'Custom field not found' });
      }
      console.error('Failed to delete custom field', error);
      return res.status(500).json({ success: false, error: 'Failed to delete custom field' });
    }
  }
);

export default router;
