import {
  validateArray,
  validateDateRange,
  validatePassword,
} from '../advanced-validation';

describe('advanced-validation', () => {
  describe('validateArray', () => {
    const isNumber = (v: unknown): v is number => typeof v === 'number';

    it('returns valid for array of valid items', () => {
      const result = validateArray([1, 2, 3], isNumber);
      expect(result.valid).toBe(true);
      expect(result.data).toEqual([1, 2, 3]);
      expect(result.errors).toEqual([]);
    });

    it('returns invalid for non-array', () => {
      const result = validateArray('not an array', isNumber);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Value is not an array');
    });

    it('filters out invalid items', () => {
      const result = validateArray([1, 'two', 3], isNumber);
      expect(result.valid).toBe(false);
      expect(result.data).toEqual([1, 3]);
      expect(result.errors.some((e) => e.includes('Invalid items'))).toBe(true);
    });

    it('enforces minLength', () => {
      const result = validateArray([1], isNumber, { minLength: 2 });
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Array must have at least 2 items');
    });

    it('enforces maxLength', () => {
      const result = validateArray([1, 2, 3], isNumber, { maxLength: 2 });
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Array must have at most 2 items');
    });

    it('enforces unique values', () => {
      const result = validateArray([1, 2, 1], isNumber, { unique: true });
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Array contains duplicate values');
    });

    it('enforces unique by key', () => {
      type Item = { id: number; name: string };
      const isItem = (v: unknown): v is Item =>
        typeof v === 'object' && v !== null && 'id' in v && 'name' in v;
      const items: Item[] = [
        { id: 1, name: 'a' },
        { id: 1, name: 'b' },
      ];
      const result = validateArray(items, isItem, { unique: true, uniqueKey: 'id' });
      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.includes('Duplicate'))).toBe(true);
    });

    it('returns valid for empty array with no constraints', () => {
      const result = validateArray([], isNumber);
      expect(result.valid).toBe(true);
    });
  });

  describe('validateDateRange', () => {
    it('returns valid for valid range', () => {
      const start = new Date('2024-01-01');
      const end = new Date('2024-01-31');
      const result = validateDateRange(start, end);
      expect(result.valid).toBe(true);
      expect(result.errors).toEqual([]);
    });

    it('returns invalid when end is before start', () => {
      const start = new Date('2024-01-31');
      const end = new Date('2024-01-01');
      const result = validateDateRange(start, end);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('End date must be after start date');
    });

    it('returns invalid for invalid start date', () => {
      const result = validateDateRange(new Date('invalid'), new Date('2024-01-01'));
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Start date is invalid');
    });

    it('returns invalid for invalid end date', () => {
      const result = validateDateRange(new Date('2024-01-01'), new Date('invalid'));
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('End date is invalid');
    });

    it('rejects same dates by default', () => {
      const date = new Date('2024-01-01');
      const result = validateDateRange(date, date);
      expect(result.valid).toBe(false);
    });

    it('allows same dates with allowSame option', () => {
      const date = new Date('2024-01-01');
      const result = validateDateRange(date, date, { allowSame: true });
      expect(result.valid).toBe(true);
    });

    it('enforces maxDuration', () => {
      const start = new Date('2024-01-01');
      const end = new Date('2024-02-01');
      const result = validateDateRange(start, end, { maxDuration: 86400000 });
      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.includes('exceeds maximum'))).toBe(true);
    });
  });

  describe('validatePassword', () => {
    it('returns strong for complex password', () => {
      const result = validatePassword('MyP@ssw0rd!');
      expect(result.valid).toBe(true);
      expect(result.strength).toBe('strong');
      expect(result.score).toBeGreaterThanOrEqual(5);
      expect(result.feedback).toEqual([]);
    });

    it('returns medium for moderate password', () => {
      const result = validatePassword('Password1');
      expect(result.strength).toBe('medium');
      expect(result.score).toBeGreaterThanOrEqual(3);
    });

    it('returns weak for simple password', () => {
      const result = validatePassword('abc');
      expect(result.valid).toBe(false);
      expect(result.strength).toBe('weak');
      expect(result.feedback.length).toBeGreaterThan(0);
    });

    it('rejects password shorter than 8 characters', () => {
      const result = validatePassword('Ab1!');
      expect(result.valid).toBe(false);
      expect(result.feedback).toContain('Password must be at least 8 characters');
    });

    it('provides feedback for missing character types', () => {
      const result = validatePassword('password');
      expect(result.feedback).toContain('Add uppercase letters');
      expect(result.feedback).toContain('Add numbers');
      expect(result.feedback).toContain('Add special characters');
    });

    it('returns valid false when score is below 3', () => {
      const result = validatePassword('ab');
      expect(result.valid).toBe(false);
    });
  });
});
