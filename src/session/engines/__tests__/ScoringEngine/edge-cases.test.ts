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

  describe('Edge Cases', () => {
    it('should handle zero duration session', () => {
      const session = createMockSession({
        config: { ...createMockSession().config, duration: 0 },
        effectiveTime: 0,
      });
      const metrics = createMockFocusMetrics();
      const calculation = engine.calculateScore(session, metrics);
      expect(calculation.basePoints).toBe(0);
    });

    it('should not return negative final score', () => {
      const session = createMockSession({ pauses: 1000, interruptions: 1000 });
      const metrics = createMockFocusMetrics({ overallScore: 0 });
      const calculation = engine.calculateScore(session, metrics);
      const finalScore = engine.calculateFinalScore(calculation);
      expect(finalScore).toBeGreaterThanOrEqual(0);
    });
  });
});
