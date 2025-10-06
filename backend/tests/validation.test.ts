import { describe, expect, it } from 'vitest';
import { validateValueAgainstField } from '../src/utils/validation';

describe('validateValueAgainstField', () => {
  it('validates required string', () => {
    const result = validateValueAgainstField(
      { fieldType: 'Text', label: 'Name', required: true },
      'Alice'
    );
    expect(result).toEqual({ valid: true });
  });

  it('fails required string', () => {
    const result = validateValueAgainstField(
      { fieldType: 'Text', label: 'Name', required: true },
      ''
    );
    expect(result.valid).toBe(false);
  });

  it('enforces max length', () => {
    const result = validateValueAgainstField(
      {
        fieldType: 'Text',
        label: 'Code',
        required: false,
        validation: { type: 'string', max: 3 },
      },
      'abcd'
    );
    expect(result.valid).toBe(false);
  });

  it('validates number range', () => {
    const result = validateValueAgainstField(
      {
        fieldType: 'Number',
        label: 'Score',
        required: true,
        validation: { type: 'number', min: 1, max: 10 },
      },
      5
    );
    expect(result).toEqual({ valid: true });
  });

  it('rejects invalid number', () => {
    const result = validateValueAgainstField(
      {
        fieldType: 'Number',
        label: 'Score',
        required: true,
      },
      'NaN'
    );
    expect(result.valid).toBe(false);
  });

  it('allows optional empty', () => {
    const result = validateValueAgainstField(
      { fieldType: 'Date', label: 'Due', required: false },
      null
    );
    expect(result).toEqual({ valid: true });
  });
});
