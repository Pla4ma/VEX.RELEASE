import {
  addDays,
  addMonths,
  addYears,
  subDays,
  subMonths,
  subYears,
} from '../dateFns';

describe('dateFns arithmetic', () => {
  describe('addDays', () => {
    it('adds days to a date', () => {
      const d = new Date(2024, 0, 1);
      const result = addDays(d, 5);
      expect(result.getDate()).toBe(6);
      expect(result.getMonth()).toBe(0);
    });

    it('handles month rollover', () => {
      const d = new Date(2024, 0, 30);
      const result = addDays(d, 5);
      expect(result.getMonth()).toBe(1);
      expect(result.getDate()).toBe(4);
    });

    it('handles negative days (subtract)', () => {
      const d = new Date(2024, 0, 5);
      const result = addDays(d, -3);
      expect(result.getDate()).toBe(2);
    });
  });

  describe('addMonths', () => {
    it('adds months to a date', () => {
      const d = new Date(2024, 0, 15);
      const result = addMonths(d, 2);
      expect(result.getMonth()).toBe(2);
    });

    it('handles year rollover', () => {
      const d = new Date(2024, 10, 15);
      const result = addMonths(d, 3);
      expect(result.getFullYear()).toBe(2025);
      expect(result.getMonth()).toBe(1);
    });
  });

  describe('addYears', () => {
    it('adds years to a date', () => {
      const d = new Date(2024, 5, 15);
      const result = addYears(d, 1);
      expect(result.getFullYear()).toBe(2025);
    });
  });

  describe('subDays', () => {
    it('subtracts days from a date', () => {
      const d = new Date(2024, 0, 10);
      const result = subDays(d, 3);
      expect(result.getDate()).toBe(7);
    });
  });

  describe('subMonths', () => {
    it('subtracts months from a date', () => {
      const d = new Date(2024, 5, 15);
      const result = subMonths(d, 2);
      expect(result.getMonth()).toBe(3);
    });
  });

  describe('subYears', () => {
    it('subtracts years from a date', () => {
      const d = new Date(2024, 5, 15);
      const result = subYears(d, 1);
      expect(result.getFullYear()).toBe(2023);
    });
  });
});
