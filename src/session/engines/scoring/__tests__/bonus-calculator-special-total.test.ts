import {
  BonusCalculator,
  calculateSpecialBonuses,
  BONUS_CONSTANTS,
} from './bonus-calculator-helpers';

describe('BonusCalculator', () => {
  describe('calculateSpecialBonuses', () => {
    const createMockSession = (overrides: Record<string, unknown> = {}) => ({
      id: 'test', completionPercentage: 100, interruptions: 0,
      pauses: 0, config: { duration: 1500 }, ...overrides,
    });

    it('should identify perfect session', () => {
      const result = calculateSpecialBonuses({
        session: createMockSession(),
        startTime: Date.now() - 1500000, endTime: Date.now(),
        noPauses: true, noInterruptions: true,
      });
      expect(result.perfectSession).toBe(true);
      expect(result.totalBonus).toBeGreaterThan(0);
      expect(result.badges).toContain('PERFECT_SESSION');
    });

    it('should identify marathon session', () => {
      const startTime = Date.now() - 3600000;
      const result = calculateSpecialBonuses({
        session: createMockSession(),
        startTime, endTime: Date.now(),
        noPauses: false, noInterruptions: false,
      });
      expect(result.marathon).toBe(true);
      expect(result.badges).toContain('MARATHON');
    });

    it('should identify early bird', () => {
      const startTime = new Date().setHours(6, 0, 0, 0);
      const result = calculateSpecialBonuses({
        session: createMockSession(),
        startTime, endTime: startTime + 1500000,
        noPauses: false, noInterruptions: false,
      });
      expect(result.earlyBird).toBe(true);
      expect(result.badges).toContain('EARLY_BIRD');
    });

    it('should identify night owl', () => {
      const startTime = new Date().setHours(23, 0, 0, 0);
      const result = calculateSpecialBonuses({
        session: createMockSession(),
        startTime, endTime: startTime + 1500000,
        noPauses: false, noInterruptions: false,
      });
      expect(result.nightOwl).toBe(true);
      expect(result.badges).toContain('NIGHT_OWL');
    });

    it('should accumulate multiple bonuses', () => {
      const startTime = new Date().setHours(6, 0, 0, 0);
      const result = calculateSpecialBonuses({
        session: createMockSession(),
        startTime, endTime: Date.now(),
        noPauses: true, noInterruptions: true,
      });
      expect(result.badges.length).toBeGreaterThanOrEqual(2);
      expect(result.totalBonus).toBeGreaterThan(
        BONUS_CONSTANTS.PERFECT_SESSION_BONUS + BONUS_CONSTANTS.EARLY_BIRD_BONUS,
      );
    });
  });

  describe('BonusCalculator.calculateTotalBonus', () => {
    it('should sum all bonus types', () => {
      const result = BonusCalculator.calculateTotalBonus({
        timeBonus: 50, streakBonus: 30, qualityBonus: 100,
        intervalBonus: 50, specialBonus: 200,
      });
      expect(result.total).toBe(430);
      expect(result.breakdown.time).toBe(50);
      expect(result.breakdown.streak).toBe(30);
      expect(result.breakdown.quality).toBe(100);
      expect(result.breakdown.interval).toBe(50);
      expect(result.breakdown.special).toBe(200);
    });

    it('should handle zero bonuses', () => {
      const result = BonusCalculator.calculateTotalBonus({
        timeBonus: 0, streakBonus: 0, qualityBonus: 0,
        intervalBonus: 0, specialBonus: 0,
      });
      expect(result.total).toBe(0);
    });
  });
});
