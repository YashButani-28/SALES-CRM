export type ValidationRule = {
  type: 'string' | 'number' | 'date' | 'boolean' | 'file';
  required?: boolean;
  max?: number;
  min?: number;
  pattern?: string;
};

export type CustomFieldDefinition = {
  fieldType: string;
  label: string;
  required: boolean;
  validation?: ValidationRule;
};

export const validateValueAgainstField = (
  field: CustomFieldDefinition,
  value: unknown
): { valid: true } | { valid: false; error: string } => {
  const rules = field.validation ?? {};
  const type = rules.type ?? normalizeFieldType(field.fieldType);
  const isRequired = rules.required ?? field.required;

  if (isRequired && (value === null || value === undefined || value === '')) {
    return { valid: false, error: `${field.label} is required` };
  }

  if (!isRequired && (value === null || value === undefined || value === '')) {
    return { valid: true };
  }

  switch (type) {
    case 'string':
      if (typeof value !== 'string') {
        return { valid: false, error: `${field.label} must be a string` };
      }
      if (typeof rules.max === 'number' && value.length > rules.max) {
        return { valid: false, error: `${field.label} must be at most ${rules.max} characters` };
      }
      if (typeof rules.min === 'number' && value.length < rules.min) {
        return { valid: false, error: `${field.label} must be at least ${rules.min} characters` };
      }
      if (rules.pattern) {
        const regex = new RegExp(rules.pattern);
        if (!regex.test(value)) {
          return { valid: false, error: `${field.label} format is invalid` };
        }
      }
      break;

    case 'number':
      if (typeof value !== 'number' || Number.isNaN(value)) {
        return { valid: false, error: `${field.label} must be a number` };
      }
      if (typeof rules.max === 'number' && value > rules.max) {
        return { valid: false, error: `${field.label} must be <= ${rules.max}` };
      }
      if (typeof rules.min === 'number' && value < rules.min) {
        return { valid: false, error: `${field.label} must be >= ${rules.min}` };
      }
      break;

    case 'date':
      if (!(value instanceof Date) || Number.isNaN(value.getTime())) {
        if (typeof value === 'string') {
          const parsed = new Date(value);
          if (Number.isNaN(parsed.getTime())) {
            return { valid: false, error: `${field.label} must be a valid date` };
          }
        } else {
          return { valid: false, error: `${field.label} must be a valid date` };
        }
      }
      break;

    case 'boolean':
      if (typeof value !== 'boolean') {
        return { valid: false, error: `${field.label} must be a boolean` };
      }
      break;

    case 'file':
      if (typeof value !== 'string') {
        return { valid: false, error: `${field.label} must be a file key` };
      }
      break;

    default:
      return { valid: false, error: `${field.label} has unsupported type` };
  }

  return { valid: true };
};

const normalizeFieldType = (fieldType: string): ValidationRule['type'] => {
  switch (fieldType) {
    case 'Text':
    case 'Dropdown':
    case 'Radio':
    case 'FileUpload':
      return 'string';
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
