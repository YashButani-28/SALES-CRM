import { describe, expect, it } from '@jest/globals';
import * as yup from 'yup';
import { validationJsonToYup } from '../validationJsonToYup';

describe('validationJsonToYup', () => {
  const baseField = {
    id: '1',
    entity: 'Lead',
    fieldType: 'Text',
    label: 'Name',
    key: 'name',
    required: true,
    order: 0,
    createdBy: 'admin',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  } as any;

  it('validates required string with max and pattern', async () => {
    const schema = validationJsonToYup({
      ...baseField,
      validation: { type: 'string', max: 5, pattern: '^[A-Za-z]+$' },
    } as any) as yup.StringSchema;

    await expect(schema.validate('Alice')).resolves.toBe('Alice');
    await expect(schema.validate('')).rejects.toThrow('Name is required');
    await expect(schema.validate('TooLong')).rejects.toThrow('Name must be <= 5 characters');
    await expect(schema.validate('123')).rejects.toThrow('Name format is invalid');
  });

  it('validates number with min/max', async () => {
    const schema = validationJsonToYup({
      ...baseField,
      fieldType: 'Number',
      key: 'score',
      label: 'Score',
      validation: { type: 'number', min: 1, max: 10 },
    } as any) as yup.NumberSchema;

    await expect(schema.validate(5)).resolves.toBe(5);
    await expect(schema.validate(0)).rejects.toThrow('Score must be >= 1');
    await expect(schema.validate(11)).rejects.toThrow('Score must be <= 10');
  });

  it('allows optional field when not required', async () => {
    const schema = validationJsonToYup({
      ...baseField,
      required: false,
      key: 'nickname',
      label: 'Nickname',
    } as any) as yup.StringSchema;

    await expect(schema.validate(null)).resolves.toBeNull();
    await expect(schema.validate('Hi')).resolves.toBe('Hi');
  });

  it('validates dates', async () => {
    const schema = validationJsonToYup({
      ...baseField,
      fieldType: 'Date',
      key: 'dueDate',
      label: 'Due Date',
    } as any) as yup.DateSchema;

    await expect(schema.validate('2024-01-01')).resolves.toBeInstanceOf(Date);
    await expect(schema.validate('invalid')).rejects.toThrow('Due Date must be a valid date');
  });

  it('validates boolean', async () => {
    const schema = validationJsonToYup({
      ...baseField,
      fieldType: 'Checkbox',
      key: 'active',
      label: 'Active',
    } as any) as yup.BooleanSchema;

    await expect(schema.validate(true)).resolves.toBe(true);
    await expect(schema.validate('true')).rejects.toThrow('Active must be a boolean');
  });
});
