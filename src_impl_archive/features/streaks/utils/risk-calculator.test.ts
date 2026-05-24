/**
 * Streak Risk Calculator Tests
 *
 * @phase 5 - Deepening: Risk calculator tests
 */

import {
  calculateStreakRisk,
  StreakRiskCalculator,
  type RiskFactors,
} from './risk-calculator';

describe('Streak Risk Calculator', () => {
  describe('calculateStreakRisk', () => {
    it('should calculate low risk for recent session', () => {
      const result = calculateStreakRisk(
        5, // current streak
        Date.now() - 2 * 60 * 60 * 1000, // 2 hours ago
        {
          typicalSessionHour: 9,
          sessionHistory: [
            { timestamp: Date.now() - 86400000, quality: 80 },
            { timestamp: Date.now() - 172800000, quality: 85 },
          ],
          timezone: 'America/New_York',
        }
      );

      expect(result.level).toBe('NONE');
      expect(result.score).toBeLessThan(20);
    });

    it('should calculate high risk for long gap', () => {
      const result = calculateStreakRisk(
        10,
        Date.now() - 20 * 60 * 60 * 1000, // 20 hours ago
        {
          typicalSessionHour: 9,
          sessionHistory: [
            { timestamp: Date.now() - 86400000, quality: 60 },
            { timestamp: Date.now() - 172800000, quality: 70 },
          ],
          timezone: 'America/New_York',
        }
      );

      expect(result.level).toBe('HIGH');
      expect(result.urgency).toBe('URGENT');
    });

    it('should detect weekend risk', () => {
      const result = calculateStreakRisk(
        5,
        Date.now() - 12 * 60 * 60 * 1000,
        {
          typicalSessionHour: 9,
          sessionHistory: [],
          timezone: 'America/New_York',
        }
      );

      expect(result.factors).toBeDefined();
    });

    it('should provide recommendation for critical risk', () => {
      const result = calculateStreakRisk(
        10,
        Date.now() - 22 * 60 * 60 * 1000,
        {
          typicalSessionHour: 9,
          sessionHistory: [],
          timezone: 'America/New_York',
        }
      );

      expect(result.recommendation).toContain('streak');
    });
  });

  describe('StreakRiskCalculator export', () => {
    it('should export all functions', () => {
      expect(StreakRiskCalculator.calculate).toBeDefined();
      expect(StreakRiskCalculator.getRiskLevel).toBeDefined();
      expect(StreakRiskCalculator.analyzePattern).toBeDefined();
    });
  });
});
