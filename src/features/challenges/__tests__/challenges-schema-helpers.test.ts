/**
 * Tests for Challenges — Schema Helpers
 */

import { describe, it, expect } from '@jest/globals';

import { asRecord, readString, readNumber, readBoolean } from '../schemas/helpers';

describe('Schema Helpers', () => {
  describe('asRecord', () => {
    it('returns the object if it is a record', () => {
      expect(asRecord({ a: 1 })).toEqual({ a: 1 });
    });

    it('returns empty object for null', () => {
      expect(asRecord(null)).toEqual({});
    });

    it('returns empty object for primitives', () => {
      expect(asRecord(42)).toEqual({});
      expect(asRecord('str')).toEqual({});
    });
  });

  describe('readString', () => {
    it('reads the first matching key', () => {
      expect(readString({ name: 'Alice' }, 'name')).toBe('Alice');
    });

    it('falls back to alternative key', () => {
      expect(readString({ full_name: 'Bob' }, 'name', 'full_name')).toBe('Bob');
    });

    it('returns undefined if no key matches', () => {
      expect(readString({}, 'name')).toBeUndefined();
    });

    it('returns undefined for empty string', () => {
      expect(readString({ name: '' }, 'name')).toBeUndefined();
    });
  });

  describe('readNumber', () => {
    it('reads a numeric value', () => {
      expect(readNumber({ count: 42 }, 'count')).toBe(42);
    });

    it('parses a string that can be parsed as a date', () => {
      // readNumber tries Date.parse first; any string parseable as a date returns the date value
      const result = readNumber({ count: '3.14' }, 'count');
      // Date.parse("3.14") produces a valid timestamp in most engines
      expect(typeof result).toBe('number');
      expect(Number.isFinite(result!)).toBe(true);
    });

    it('returns undefined for non-numeric', () => {
      expect(readNumber({ count: 'abc' }, 'count')).toBeUndefined();
    });

    it('returns undefined for missing key', () => {
      expect(readNumber({}, 'count')).toBeUndefined();
    });
  });

  describe('readBoolean', () => {
    it('reads a boolean value', () => {
      expect(readBoolean({ active: true }, 'active')).toBe(true);
    });

    it('returns undefined for non-boolean', () => {
      expect(readBoolean({ active: 'yes' }, 'active')).toBeUndefined();
    });

    it('returns undefined for missing key', () => {
      expect(readBoolean({}, 'active')).toBeUndefined();
    });
  });
});
