import * as yup from 'yup';
import type { CustomField } from '../api/customFieldsApi';

type ValidationRule = Record<string, any> | null | undefined;

const mapFieldToSchema = (field: CustomField): yup.AnySchema => {
  const rule: ValidationRule = field.validation;
  const type = rule?.type || inferType(field.fieldType);
  const isRequired = (rule?.required ?? field.required) === true;

  let schema: yup.AnySchema;

  switch (type) {
    case 'number':
      schema = yup
        .number()
        .typeError(`${field.label} must be a number`);
      if (typeof rule?.min === 'number') {
        schema = schema.min(rule.min, `${field.label} must be >= ${rule.min}`);
      }
      if (typeof rule?.max === 'number') {
        schema = schema.max(rule.max, `${field.label} must be <= ${rule.max}`);
      }
      break;
    case 'date':
      schema = yup.date().typeError(`${field.label} must be a valid date`);
      break;
    case 'boolean':
      schema = yup.boolean();
      break;
    case 'string':
    default:
      schema = yup.string();
      if (typeof rule?.max === 'number') {
        schema = (schema as yup.StringSchema).max(rule.max, `${field.label} must be <= ${rule.max} characters`);
      }
      if (typeof rule?.min === 'number') {
        schema = (schema as yup.StringSchema).min(rule.min, `${field.label} must be >= ${rule.min} characters`);
      }
      if (rule?.pattern) {
        schema = (schema as yup.StringSchema).matches(new RegExp(rule.pattern), `${field.label} format is invalid`);
      }
  }

  if (isRequired) {
    schema = schema.required(`${field.label} is required`);
  } else {
    schema = schema.optional().nullable(true);
  }

  return schema;
};

const inferType = (fieldType: string): 'string' | 'number' | 'date' | 'boolean' => {
  switch (fieldType) {
    case 'Number':
      return 'number';
    case 'Date':
      return 'date';
    case 'Checkbox':
      return 'boolean';
    default:
      return 'string';
  }
};

export const validationJsonToYup = (field: CustomField): yup.AnySchema => {
  return mapFieldToSchema(field);
};

export const buildCustomFieldsSchema = (fields: CustomField[]) => {
  const shape: Record<string, yup.AnySchema> = {};
  fields.forEach((field) => {
    shape[field.key] = validationJsonToYup(field);
  });
  return yup.object().shape(shape);
};
