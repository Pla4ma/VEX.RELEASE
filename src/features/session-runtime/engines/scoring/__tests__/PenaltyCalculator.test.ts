import {
  PENALTY_CONSTANTS,
  calculateAbandonPenalty,
  calculateAntiCheatPenalty,
  calculateInterruptionPenalty,
  calculatePausePenalty,
  calculateQualityPenalty,
  calculateTotalPenalty,
  getSeverityFromTimeLost,
} from '../PenaltyCalculator';
import type { FocusQualityMetrics } from '../../../types';

function createFocusMetrics(overallScore: number): FocusQualityMetrics {
  return {
    calculatedAt: 1_700_000_000_000,
    consistencyScore: overallScore,
    depthScore: overallScore,
    focusSegments: [],
    overallScore,
    recoveryScore: overallScore,
    sessionId: '550e8400-e29b-41d4-a716-446655440000',
    timeDistracted: 0,
    timeInDeepFocus: 1_200,
    timeInShallowFocus: 300,
  };
}

describe('PenaltyCalculator', () => {
  describe('calculatePausePenalty', () => {
    it('returns no penalty when the session was never paused', () => {
      expect(
        calculatePausePenalty({
          pauseCount: 0,
          totalPauseDurationSeconds: 600,
        }),
      ).toBe(0);
    });

    it('caps repeated long pauses at the maximum pause penalty', () => {
      const penalty = calculatePausePenalty({
        pauseCount: 50,
        totalPauseDurationSeconds: 60 * 60,
      });

      expect(penalty).toBe(PENALTY_CONSTANTS.PAUSE_PENALTY_MAX);
    });
  });

  describe('calculateInterruptionPenalty', () => {
    it('weights interruption severity and softens auto-recovered interruptions', () => {
      const result = calculateInterruptionPenalty({
        interruptions: [
          { autoRecovered: true, duration: 15, severity: 'MINOR' },
          { autoRecovered: false, duration: 180, severity: 'MAJOR' },
          { autoRecovered: false, duration: 420, severity: 'CRITICAL' },
        ],
      });

      expect(result.breakdown.MINOR).toBe(2.5);
      expect(result.breakdown.MAJOR).toBe(20);
      expect(result.breakdown.CRITICAL).toBe(40);
      expect(result.total).toBe(62.5);
    });

    it('maps time lost into user-visible interruption severity bands', () => {
      expect(getSeverityFromTimeLost(30)).toBe('MINOR');
      expect(getSeverityFromTimeLost(31)).toBe('MODERATE');
      expect(getSeverityFromTimeLost(121)).toBe('MAJOR');
      expect(getSeverityFromTimeLost(301)).toBe('CRITICAL');
    });
  });

  describe('calculateQualityPenalty', () => {
    it('combines distraction ratio and poor focus quality without penalizing empty timers', () => {
      expect(
        calculateQualityPenalty({
          distractionTime: 900,
          focusMetrics: createFocusMetrics(35),
          totalSessionTime: 1_500,
        }),
      ).toBe(
        PENALTY_CONSTANTS.BAD_QUALITY_PENALTY +
          PENALTY_CONSTANTS.POOR_QUALITY_PENALTY,
      );

      expect(
        calculateQualityPenalty({
          distractionTime: 900,
          focusMetrics: createFocusMetrics(10),
          totalSessionTime: 0,
        }),
      ).toBe(0);
    });
  });

  describe('calculateAntiCheatPenalty', () => {
    it('escalates action to the highest violation severity', () => {
      const result = calculateAntiCheatPenalty({
        violations: [
          {
            severity: 'LOW',
            timestamp: 1_700_000_000_000,
            type: 'DEVICE_CHANGE',
          },
          {
            severity: 'HIGH',
            timestamp: 1_700_000_000_500,
            type: 'RAPID_COMPLETION',
          },
        ],
      });

      expect(result.actionRequired).toBe('DISQUALIFY');
      expect(result.total).toBe(725);
      expect(result.violations).toEqual([
        { penalty: 125, type: 'DEVICE_CHANGE' },
        { penalty: 600, type: 'RAPID_COMPLETION' },
      ]);
    });
  });

  describe('calculateAbandonPenalty', () => {
    it('preserves streaks only when a streak save exists and grants partial credit after halfway', () => {
      const result = calculateAbandonPenalty({
        hasStreakSave: true,
        progressPercentage: 75,
        streakAtRisk: true,
        timeInvestedSeconds: 1_200,
      });

      expect(result.streakPreserved).toBe(true);
      expect(result.partialCredit).toBe(true);
      expect(result.creditPercentage).toBe(37.5);
      expect(result.scorePenalty).toBe(156.25);
    });

    it('doubles the abandon penalty when the streak is at risk without a save', () => {
      const protectedResult = calculateAbandonPenalty({
        hasStreakSave: true,
        progressPercentage: 50,
        streakAtRisk: true,
        timeInvestedSeconds: 900,
      });
      const exposedResult = calculateAbandonPenalty({
        hasStreakSave: false,
        progressPercentage: 50,
        streakAtRisk: true,
        timeInvestedSeconds: 900,
      });

      expect(exposedResult.scorePenalty).toBe(protectedResult.scorePenalty * 2);
    });
  });

  describe('calculateTotalPenalty', () => {
    it('caps total penalties at 80 percent of base score and keeps the raw breakdown', () => {
      const result = calculateTotalPenalty({
        antiCheatPenalty: 500,
        baseScore: 400,
        interruptionPenalty: 150,
        pausePenalty: 100,
        qualityPenalty: 100,
      });

      expect(result.total).toBe(320);
      expect(result.percentage).toBe(80);
      expect(result.capped).toBe(true);
      expect(result.breakdown.antiCheat).toBe(500);
    });

    it('does not produce invalid percentages when base score is zero', () => {
      const result = calculateTotalPenalty({
        antiCheatPenalty: 10,
        baseScore: 0,
        interruptionPenalty: 10,
        pausePenalty: 10,
        qualityPenalty: 10,
      });

      expect(result.total).toBe(0);
      expect(result.percentage).toBe(0);
      expect(result.capped).toBe(true);
    });
  });
});
