import {
  ScoringEngine,
  createMockSession,
  createMockFocusMetrics,
} from './helpers';

describe('ScoringEngine', () => {
  let engine: ScoringEngine;

  beforeEach(() => {
    engine = new ScoringEngine();
  });

  describe('Streak Multipliers', () => {
    it('should apply streak multiplier', () => {
      engine.setUserStats(7, 1);
      const session = createMockSession();
      const metrics = createMockFocusMetrics();
      const calculation = engine.calculateScore(session, metrics);
      expect(calculation.streakMultiplier).toBe(1.25);
    });

    it('should calculate streak bonus', () => {
      engine.setUserStats(7, 1);
      const session = createMockSession();
      const metrics = createMockFocusMetrics();
      const calculation = engine.calculateScore(session, metrics);
      expect(calculation.streakBonus).toBeGreaterThan(0);
    });
  });

  describe('Quality Multipliers', () => {
    it('should apply quality multiplier from focus metrics', () => {
      const highQuality = createMockFocusMetrics({ overallScore: 95 });
      const lowQuality = createMockFocusMetrics({ overallScore: 40 });
      const session = createMockSession();
      const highCalc = engine.calculateScore(session, highQuality);
      const lowCalc = engine.calculateScore(session, lowQuality);
      expect(highCalc.qualityMultiplier).toBeGreaterThan(
        lowCalc.qualityMultiplier,
      );
    });
  });
});
