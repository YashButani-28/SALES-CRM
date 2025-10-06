import { z } from 'zod';
import {
  ALLOWED_FIELD_TYPES,
  createCustomField,
  deleteCustomField,
  isPrismaNotFoundError,
  isPrismaUniqueError,
  listCustomFields,
  reorderCustomFields,
  updateCustomField,
} from '../services/customFieldService.js';

const querySchema = z.object({
  entity: z.string().min(1, 'entity is required'),
});

const baseFieldSchema = z.object({
  entity: z.string().min(1),
  fieldType: z.enum(ALLOWED_FIELD_TYPES),
  label: z.string().min(1),
  key: z
    .string()
    .min(1)
    .regex(/^[A-Za-z0-9_]+$/, 'key must be alphanumeric with underscores'),
  required: z.boolean(),
  validation: z
    .object({
      maxLength: z.number().int().positive().optional(),
      regex: z.string().optional(),
      min: z.number().optional(),
      max: z.number().optional(),
      options: z.array(z.string()).optional(),
    })
    .partial()
    .optional(),
  defaultValue: z.string().optional().nullable(),
  order: z.number().int().nonnegative().optional(),
  group: z.string().optional().nullable(),
});

const updateFieldSchema = baseFieldSchema.partial({ key: true, fieldType: true, entity: true });

const reorderSchema = z.object({
  fields: z
    .array(
      z.object({
        id: z.string().min(1),
        order: z.number().int().nonnegative(),
        group: z.string().optional().nullable(),
      })
    )
    .min(1),
});

export const getCustomFieldsHandler = async (req, res) => {
  const parse = querySchema.safeParse(req.query);

  if (!parse.success) {
    return res.status(400).json({ success: false, error: parse.error.message });
  }

  try {
    const fields = await listCustomFields(parse.data.entity);
    return res.json({ success: true, data: fields });
  } catch (error) {
    console.error('Failed to fetch custom fields', error);
    return res.status(500).json({ success: false, error: 'Failed to fetch custom fields' });
  }
};

export const createCustomFieldHandler = async (req, res) => {
  const parse = baseFieldSchema.safeParse(req.body);

  if (!parse.success) {
    return res.status(400).json({ success: false, error: parse.error.message });
  }

  if (!req.user) {
    return res.status(401).json({ success: false, error: 'Unauthorized' });
  }

  try {
    const field = await createCustomField(parse.data, req.user.id);
    return res.status(201).json({ success: true, data: field });
  } catch (error) {
    if (isPrismaUniqueError(error)) {
      return res.status(409).json({ success: false, error: 'Field key must be unique' });
    }
    console.error('Failed to create custom field', error);
    return res.status(500).json({ success: false, error: 'Failed to create custom field' });
  }
};

export const updateCustomFieldHandler = async (req, res) => {
  const { id } = req.params;
  const parse = updateFieldSchema.safeParse(req.body);

  if (!parse.success) {
    return res.status(400).json({ success: false, error: parse.error.message });
  }

  if (!req.user) {
    return res.status(401).json({ success: false, error: 'Unauthorized' });
  }

  try {
    const field = await updateCustomField(id, parse.data, req.user.id);
    return res.json({ success: true, data: field });
  } catch (error) {
    if (isPrismaUniqueError(error)) {
      return res.status(409).json({ success: false, error: 'Field key must be unique' });
    }
    if (isPrismaNotFoundError(error)) {
      return res.status(404).json({ success: false, error: 'Custom field not found' });
    }
    console.error('Failed to update custom field', error);
    return res.status(500).json({ success: false, error: 'Failed to update custom field' });
  }
};

export const deleteCustomFieldHandler = async (req, res) => {
  const { id } = req.params;

  try {
    await deleteCustomField(id);
    return res.json({ success: true, data: true });
  } catch (error) {
    if (isPrismaNotFoundError(error)) {
      return res.status(404).json({ success: false, error: 'Custom field not found' });
    }
    console.error('Failed to delete custom field', error);
    return res.status(500).json({ success: false, error: 'Failed to delete custom field' });
  }
};

export const reorderCustomFieldsHandler = async (req, res) => {
  const parse = reorderSchema.safeParse(req.body);

  if (!parse.success) {
    return res.status(400).json({ success: false, error: parse.error.message });
  }

  try {
    await reorderCustomFields(parse.data.fields);
    return res.json({ success: true, data: true });
  } catch (error) {
    console.error('Failed to reorder custom fields', error);
    return res.status(500).json({ success: false, error: 'Failed to reorder custom fields' });
  }
};
