import {
  ScoringEngine,
  SessionMode,
  createMockSession,
  createMockFocusMetrics,
} from './ScoringEngine.helpers';

describe('ScoringEngine', () => {
  let engine: ScoringEngine;

  beforeEach(() => {
    engine = new ScoringEngine();
  });

  describe('Score Calculation', () => {
    it('should calculate base points from session duration', () => {
      const session = createMockSession();
      const metrics = createMockFocusMetrics();
      const calculation = engine.calculateScore(session, metrics);
      expect(calculation.basePoints).toBeGreaterThan(0);
      expect(calculation.basePoints).toBe(625);
    });

    it('should apply time multiplier based on completion', () => {
      const fullSession = createMockSession({ completionPercentage: 100 });
      const partialSession = createMockSession({ completionPercentage: 50 });
      const metrics = createMockFocusMetrics();
      const fullCalc = engine.calculateScore(fullSession, metrics);
      const partialCalc = engine.calculateScore(partialSession, metrics);
      expect(fullCalc.timeMultiplier).toBeGreaterThan(
        partialCalc.timeMultiplier,
      );
    });

    it('should calculate pause penalties', () => {
      const noPause = createMockSession({ pauses: 0 });
      const withPauses = createMockSession({ pauses: 5 });
      const metrics = createMockFocusMetrics();
      const noPauseCalc = engine.calculateScore(noPause, metrics);
      const withPausesCalc = engine.calculateScore(withPauses, metrics);
      expect(withPausesCalc.pausePenalty).toBeGreaterThan(
        noPauseCalc.pausePenalty,
      );
    });

    it('should calculate interruption penalties', () => {
      const noInterrupt = createMockSession({ interruptions: 0 });
      const withInterrupts = createMockSession({ interruptions: 3 });
      const metrics = createMockFocusMetrics();
      const noInterruptCalc = engine.calculateScore(noInterrupt, metrics);
      const withInterruptsCalc = engine.calculateScore(withInterrupts, metrics);
      expect(withInterruptsCalc.interruptionPenalty).toBeGreaterThan(
        noInterruptCalc.interruptionPenalty,
      );
    });

    it('should calculate final score', () => {
      const session = createMockSession();
      const metrics = createMockFocusMetrics();
      const calculation = engine.calculateScore(session, metrics);
      const finalScore = engine.calculateFinalScore(calculation);
      expect(finalScore).toBeGreaterThan(0);
    });

    it('should apply comeback multiplier bonus when configured', () => {
      const session = createMockSession({
        config: { ...createMockSession().config, comebackMultiplier: 2 },
      });
      const metrics = createMockFocusMetrics();
      const calculation = engine.calculateScore(session, metrics);
      expect(calculation.comebackMultiplier).toBe(2);
      expect(calculation.comebackBonus).toBeGreaterThan(0);
    });
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
