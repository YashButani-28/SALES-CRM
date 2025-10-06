import { Request, Response } from 'express';
import { z } from 'zod';
import {
  createCustomFieldValue,
  getCustomFieldValues,
  updateCustomFieldValue,
} from '../services/customFieldValueService';

const querySchema = z.object({
  entity: z.string().min(1),
  entityId: z.string().min(1),
});

const createSchema = z.object({
  entity: z.string().min(1),
  entityId: z.string().min(1),
  fieldId: z.string().min(1),
  value: z.any(),
});

const updateSchema = z.object({
  value: z.any(),
});

export const getCustomFieldValuesHandler = async (req: Request, res: Response) => {
  const parse = querySchema.safeParse(req.query);

  if (!parse.success) {
    return res.status(400).json({ success: false, error: parse.error.message });
  }

  try {
    const values = await getCustomFieldValues(parse.data.entity, parse.data.entityId);
    return res.json({ success: true, data: values });
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Failed to fetch values' });
  }
};

export const createCustomFieldValueHandler = async (req: Request, res: Response) => {
  const parse = createSchema.safeParse(req.body);

  if (!parse.success) {
    return res.status(400).json({ success: false, error: parse.error.message });
  }

  try {
    const value = await createCustomFieldValue(
      parse.data.entity,
      parse.data.entityId,
      parse.data.fieldId,
      parse.data.value
    );
    return res.status(201).json({ success: true, data: value });
  } catch (error: any) {
    return res.status(400).json({ success: false, error: error.message || 'Failed to create value' });
  }
};

export const updateCustomFieldValueHandler = async (req: Request, res: Response) => {
  const { id } = req.params;
  const parse = updateSchema.safeParse(req.body);

  if (!parse.success) {
    return res.status(400).json({ success: false, error: parse.error.message });
  }

  try {
    const value = await updateCustomFieldValue(id, parse.data.value);
    return res.json({ success: true, data: value });
  } catch (error: any) {
    return res.status(400).json({ success: false, error: error.message || 'Failed to update value' });
  }
};
