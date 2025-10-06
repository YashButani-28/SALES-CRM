import { PrismaClient } from '@prisma/client';
import { validateValueAgainstField } from '../utils/validation';

const prisma = new PrismaClient();

export const getCustomFieldValues = async (entity: string, entityId: string) => {
  return prisma.customFieldValue.findMany({
    where: { entity, entityId },
    include: { field: true },
    orderBy: [{ field: { group: 'asc' } }, { field: { order: 'asc' } }],
  });
};

export const createCustomFieldValue = async (
  entity: string,
  entityId: string,
  fieldId: string,
  value: unknown
) => {
  const field = await prisma.customField.findUnique({ where: { id: fieldId } });
  if (!field) {
    throw new Error('Field not found');
  }

  const validationResult = validateValueAgainstField(
    {
      fieldType: field.fieldType,
      label: field.label,
      required: field.required,
      validation: field.validation as any,
    },
    value
  );

  if (!validationResult.valid) {
    throw new Error(validationResult.error ?? 'Invalid value');
  }

  const serializedValue = serializeValue(field.fieldType, value);

  return prisma.customFieldValue.create({
    data: {
      entity,
      entityId,
      fieldId,
      value: serializedValue,
    },
  });
};

export const updateCustomFieldValue = async (
  id: string,
  value: unknown
) => {
  const record = await prisma.customFieldValue.findUnique({
    where: { id },
    include: { field: true },
  });

  if (!record || !record.field) {
    throw new Error('Custom field value not found');
  }

  const validationResult = validateValueAgainstField(
    {
      fieldType: record.field.fieldType,
      label: record.field.label,
      required: record.field.required,
      validation: record.field.validation as any,
    },
    value
  );

  if (!validationResult.valid) {
    throw new Error(validationResult.error ?? 'Invalid value');
  }

  const serializedValue = serializeValue(record.field.fieldType, value);

  return prisma.customFieldValue.update({
    where: { id },
    data: { value: serializedValue },
  });
};

const serializeValue = (fieldType: string, value: unknown): string => {
  if (value === null || value === undefined) {
    return '';
  }

  switch (fieldType) {
    case 'Number':
      return String(value);
    case 'Date':
      return value instanceof Date ? value.toISOString() : String(value);
    case 'Checkbox':
      return value === true ? 'true' : 'false';
    default:
      return String(value);
  }
};
