// backend/src/utils/validation.js
import dayjs from 'dayjs';

/**
 * Validates a value against a custom field's validation rules
 * @param {Object} field - The field definition
 * @param {string} field.fieldType - The type of field
 * @param {string} field.label - The label of the field
 * @param {boolean} field.required - Whether the field is required
 * @param {Object} field.validation - Validation rules for the field
 * @param {*} value - The value to validate
 * @returns {Object} - { valid: boolean, error: string | null }
 */
export const validateValueAgainstField = (field, value) => {
  // Check required fields
  if (field.required && (value === null || value === undefined || value === '')) {
    return { valid: false, error: `${field.label} is required` };
  }
  
  // If not required and no value, it's valid
  if (!field.required && (value === null || value === undefined || value === '')) {
    return { valid: true, error: null };
  }
  
  // Type-specific validation
  switch (field.fieldType) {
    case 'Text':
      return validateText(field, value);
    case 'Number':
      return validateNumber(field, value);
    case 'Date':
      return validateDate(field, value);
    case 'Dropdown':
      return validateDropdown(field, value);
    case 'Checkbox':
      return validateBoolean(field, value);
    case 'Radio':
      return validateDropdown(field, value);
    case 'FileUpload':
      return validateFileUpload(field, value);
    default:
      return { valid: true, error: null };
  }
};

const validateText = (field, value) => {
  if (typeof value !== 'string') {
    return { valid: false, error: `${field.label} must be a string` };
  }
  
  const validation = field.validation || {};
  
  // Check max length
  if (validation.maxLength && value.length > validation.maxLength) {
    return { 
      valid: false, 
      error: `${field.label} must be at most ${validation.maxLength} characters` 
    };
  }
  
  // Check regex pattern
  if (validation.regex && !new RegExp(validation.regex).test(value)) {
    return { 
      valid: false, 
      error: `${field.label} must match the pattern: ${validation.regex}` 
    };
  }
  
  return { valid: true, error: null };
};

const validateNumber = (field, value) => {
  const numValue = Number(value);
  
  if (isNaN(numValue)) {
    return { valid: false, error: `${field.label} must be a number` };
  }
  
  const validation = field.validation || {};
  
  // Check min value
  if (validation.min !== undefined && numValue < validation.min) {
    return { 
      valid: false, 
      error: `${field.label} must be at least ${validation.min}` 
    };
  }
  
  // Check max value
  if (validation.max !== undefined && numValue > validation.max) {
    return { 
      valid: false, 
      error: `${field.label} must be at most ${validation.max}` 
    };
  }
  
  return { valid: true, error: null };
};

const validateDate = (field, value) => {
  const date = dayjs(value);
  
  if (!date.isValid()) {
    return { valid: false, error: `${field.label} must be a valid date` };
  }
  
  const validation = field.validation || {};
  
  // Check min date
  if (validation.minDate && date.isBefore(dayjs(validation.minDate))) {
    return { 
      valid: false, 
      error: `${field.label} must be after ${validation.minDate}` 
    };
  }
  
  // Check max date
  if (validation.maxDate && date.isAfter(dayjs(validation.maxDate))) {
    return { 
      valid: false, 
      error: `${field.label} must be before ${validation.maxDate}` 
    };
  }
  
  return { valid: true, error: null };
};

const validateDropdown = (field, value) => {
  const validation = field.validation || {};
  
  if (!validation.options || !Array.isArray(validation.options)) {
    return { valid: true, error: null };
  }
  
  if (!validation.options.includes(value)) {
    return { 
      valid: false, 
      error: `${field.label} must be one of: ${validation.options.join(', ')}` 
    };
  }
  
  return { valid: true, error: null };
};

const validateBoolean = (field, value) => {
  if (typeof value !== 'boolean') {
    return { valid: false, error: `${field.label} must be a boolean` };
  }
  
  return { valid: true, error: null };
};

const validateFileUpload = (field, value) => {
  if (typeof value !== 'string') {
    return { valid: false, error: `${field.label} must be a file path` };
  }
  
  return { valid: true, error: null };
};
