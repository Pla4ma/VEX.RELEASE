import { isAfter, isBefore, isEqual } from '../dateFns';

describe('dateFns comparison', () => {
  describe('isAfter', () => {
    it('returns true when first date is later', () => {
      expect(isAfter(new Date(2024, 1, 1), new Date(2024, 0, 1))).toBe(true);
    });

    it('returns false when first date is earlier', () => {
      expect(isAfter(new Date(2024, 0, 1), new Date(2024, 1, 1))).toBe(false);
    });
  });

  describe('isBefore', () => {
    it('returns true when first date is earlier', () => {
      expect(isBefore(new Date(2024, 0, 1), new Date(2024, 1, 1))).toBe(true);
    });

    it('returns false when first date is later', () => {
      expect(isBefore(new Date(2024, 1, 1), new Date(2024, 0, 1))).toBe(false);
    });
  });

  describe('isEqual', () => {
    it('returns true for same timestamps', () => {
      const a = new Date(2024, 0, 1);
      const b = new Date(2024, 0, 1);
      expect(isEqual(a, b)).toBe(true);
    });

    it('returns false for different timestamps', () => {
      expect(isEqual(new Date(2024, 0, 1), new Date(2024, 0, 2))).toBe(false);
    });
  });
});
