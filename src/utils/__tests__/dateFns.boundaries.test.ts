import {
  startOfDay,
  endOfDay,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
} from '../dateFns';

describe('dateFns boundaries', () => {
  describe('startOfDay', () => {
    it('sets time to 00:00:00.000', () => {
      const d = new Date(2024, 5, 15, 14, 30, 45, 500);
      const result = startOfDay(d);
      expect(result.getHours()).toBe(0);
      expect(result.getMinutes()).toBe(0);
      expect(result.getSeconds()).toBe(0);
      expect(result.getMilliseconds()).toBe(0);
      expect(result.getDate()).toBe(15);
    });
  });

  describe('endOfDay', () => {
    it('sets time to 23:59:59.999', () => {
      const d = new Date(2024, 5, 15, 10, 0, 0);
      const result = endOfDay(d);
      expect(result.getHours()).toBe(23);
      expect(result.getMinutes()).toBe(59);
      expect(result.getSeconds()).toBe(59);
      expect(result.getMilliseconds()).toBe(999);
    });
  });

  describe('startOfWeek', () => {
    it('returns Monday for a Wednesday', () => {
      const d = new Date(2024, 5, 12); // Wednesday
      const result = startOfWeek(d);
      expect(result.getDay()).toBe(1); // Monday
    });

    it('returns Monday for a Sunday', () => {
      const d = new Date(2024, 5, 16); // Sunday
      const result = startOfWeek(d);
      expect(result.getDay()).toBe(1); // Monday
    });
  });

  describe('endOfWeek', () => {
    it('returns Sunday of the same week', () => {
      const d = new Date(2024, 5, 12); // Wednesday
      const result = endOfWeek(d);
      expect(result.getDay()).toBe(0); // Sunday
      expect(result.getHours()).toBe(23);
    });
  });

  describe('startOfMonth', () => {
    it('returns the 1st of the month', () => {
      const d = new Date(2024, 5, 15);
      const result = startOfMonth(d);
      expect(result.getDate()).toBe(1);
      expect(result.getHours()).toBe(0);
    });
  });

  describe('endOfMonth', () => {
    it('returns the last day of the month', () => {
      const d = new Date(2024, 1, 15); // February 2024 (leap year)
      const result = endOfMonth(d);
      expect(result.getDate()).toBe(29);
      expect(result.getHours()).toBe(23);
    });

    it('handles December', () => {
      const d = new Date(2024, 11, 15);
      const result = endOfMonth(d);
      expect(result.getDate()).toBe(31);
    });
  });
});
