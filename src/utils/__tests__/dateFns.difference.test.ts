import {
  differenceInDays,
  differenceInHours,
  differenceInMinutes,
  differenceInSeconds,
} from '../dateFns';

describe('dateFns difference', () => {
  describe('differenceInDays', () => {
    it('returns correct day difference', () => {
      const a = new Date(2024, 0, 1);
      const b = new Date(2024, 0, 10);
      expect(differenceInDays(a, b)).toBe(9);
    });

    it('returns absolute difference regardless of order', () => {
      const a = new Date(2024, 0, 10);
      const b = new Date(2024, 0, 1);
      expect(differenceInDays(a, b)).toBe(9);
    });
  });

  describe('differenceInHours', () => {
    it('returns correct hour difference', () => {
      const a = new Date(2024, 0, 1, 10);
      const b = new Date(2024, 0, 1, 15);
      expect(differenceInHours(a, b)).toBe(5);
    });
  });

  describe('differenceInMinutes', () => {
    it('returns correct minute difference', () => {
      const a = new Date(2024, 0, 1, 10, 0);
      const b = new Date(2024, 0, 1, 10, 30);
      expect(differenceInMinutes(a, b)).toBe(30);
    });
  });

  describe('differenceInSeconds', () => {
    it('returns correct second difference', () => {
      const a = new Date(2024, 0, 1, 10, 0, 0);
      const b = new Date(2024, 0, 1, 10, 0, 45);
      expect(differenceInSeconds(a, b)).toBe(45);
    });
  });
});
