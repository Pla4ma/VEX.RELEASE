import {
  validateRange,
  validateSchema,
  createValidator,
} from '../validation';
import { z } from 'zod';

describe('validation', () => {
  describe('validateRange', () => {
    it('returns valid when value is within range', () => {
      const result = validateRange(5, 0, 10);
      expect(result.valid).toBe(true);
      expect(result.clamped).toBe(5);
      expect(result.violations).toEqual([]);
    });

    it('clamps value to min when below range', () => {
      const result = validateRange(-5, 0, 10);
      expect(result.valid).toBe(false);
      expect(result.clamped).toBe(0);
      expect(result.violations).toContain('value must be at least 0');
    });

    it('clamps value to max when above range', () => {
      const result = validateRange(15, 0, 10);
      expect(result.valid).toBe(false);
      expect(result.clamped).toBe(10);
      expect(result.violations).toContain('value must be at most 10');
    });

    it('returns invalid for NaN', () => {
      const result = validateRange(NaN, 0, 10);
      expect(result.valid).toBe(false);
      expect(result.clamped).toBe(0);
      expect(result.violations).toContain('value is not a valid number');
    });

    it('uses custom name in violation messages', () => {
      const result = validateRange(-1, 0, 10, { name: 'score' });
      expect(result.violations).toContain('score must be at least 0');
    });

    it('enforces integer constraint', () => {
      const result = validateRange(3.7, 0, 10, { integer: true });
      expect(result.valid).toBe(false);
      expect(result.clamped).toBe(4);
      expect(result.violations).toContain('value must be a whole number');
    });

    it('uses exclusive bounds when inclusive is false', () => {
      const result = validateRange(0, 0, 10, { inclusive: false });
      expect(result.valid).toBe(false);
      expect(result.violations).toContain('value must be greater than 0');
    });

    it('handles value at exact boundaries (inclusive)', () => {
      expect(validateRange(0, 0, 10).valid).toBe(true);
      expect(validateRange(10, 0, 10).valid).toBe(true);
    });
  });

  describe('validateSchema', () => {
    const TestSchema = z.object({
      name: z.string().min(1),
      age: z.number().int().positive(),
    });

    it('returns success for valid data', () => {
      const result = validateSchema(TestSchema, { name: 'Alice', age: 30 });
      expect(result.success).toBe(true);
      expect(result.data).toEqual({ name: 'Alice', age: 30 });
      expect(result.errors).toEqual([]);
      expect(result.fieldErrors).toEqual({});
    });

    it('returns errors for invalid data', () => {
      const result = validateSchema(TestSchema, { name: '', age: -1 });
      expect(result.success).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('returns fieldErrors keyed by path', () => {
      const result = validateSchema(TestSchema, { name: '', age: -1 });
      expect(result.fieldErrors).toBeDefined();
      expect(Object.keys(result.fieldErrors).length).toBeGreaterThan(0);
    });

    it('handles wrong type', () => {
      const result = validateSchema(TestSchema, 'not an object');
      expect(result.success).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('handles missing fields', () => {
      const result = validateSchema(TestSchema, {});
      expect(result.success).toBe(false);
    });
  });

  describe('createValidator', () => {
    const NumberSchema = z.number().positive();
    const validate = createValidator(NumberSchema);

    it('returns success for valid data', () => {
      const result = validate(42);
      expect(result.success).toBe(true);
      expect(result.data).toBe(42);
    });

    it('returns failure for invalid data', () => {
      const result = validate(-1);
      expect(result.success).toBe(false);
    });

    it('returns failure for wrong type', () => {
      const result = validate('not a number');
      expect(result.success).toBe(false);
    });
  });
});
