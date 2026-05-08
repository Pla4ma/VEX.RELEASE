import { describe, it, expect } from '@jest/globals';
import { calculateBasicSoloBossDamage } from '../basic-solo-boss-calculator';

describe('Basic Solo Boss Calculator', () => {
  it('should calculate deterministic damage from session data', () => {
    const testCases = [
      {
        input: { sessionDurationMinutes: 30, sessionQuality: 80, streakDays: 0 },
        expected: 19, // 30 * 0.8 * 0.8 = 19.2 -> 19
      },
      {
        input: { sessionDurationMinutes: 60, sessionQuality: 100, streakDays: 5 },
        expected: 58, // 60 * 0.8 * 1.0 * 1.2 = 57.6 -> 58
      },
      {
        input: { sessionDurationMinutes: 45, sessionQuality: 60, streakDays: 2 },
        expected: 22, // 45 * 0.8 * 0.6 = 21.6 -> 22
      },
    ];

    testCases.forEach(({ input, expected }) => {
      const result = calculateBasicSoloBossDamage(input);
      expect(result).toBe(expected);
    });
  });

  it('should handle minimum values correctly', () => {
    const result = calculateBasicSoloBossDamage({
      sessionDurationMinutes: 0,
      sessionQuality: 0,
      streakDays: 0
    });
    expect(result).toBe(1); // min base damage 1 * 0.5 quality multiplier = 0.5 -> rounded 1
  });
});
