import {
  ScoringEngine,
  SessionMode,
  createMockSession,
  createMockFocusMetrics,
} from "./helpers";

describe("ScoringEngine", () => {
  let engine: ScoringEngine;

  beforeEach(() => {
    engine = new ScoringEngine();
  });

  describe("Mode Differentiation", () => {
    it("applies deep work XP and strict pause penalties", () => {
      const baseSession = createMockSession({ pauses: 3, pausedTime: 10000 });
      const deepSession = createMockSession({
        pauses: 3,
        pausedTime: 31000,
        config: { ...baseSession.config, sessionMode: SessionMode.DEEP_WORK },
      });
      const metrics = createMockFocusMetrics({
        consistencyScore: 95,
        overallScore: 95,
      });
      const baseCalc = engine.calculateScore(baseSession, metrics);
      const deepCalc = engine.calculateScore(deepSession, metrics);
      expect(deepCalc.basePoints).toBeGreaterThan(baseCalc.basePoints);
      expect(deepCalc.pausePenalty).toBeGreaterThan(baseCalc.pausePenalty);
    });

    it("halves light focus pause penalties", () => {
      const baseSession = createMockSession({
        pauses: 5,
        config: {
          ...createMockSession().config,
          sessionMode: SessionMode.STUDY,
        },
      });
      const lightSession = createMockSession({
        pauses: 5,
        config: { ...baseSession.config, sessionMode: SessionMode.LIGHT_FOCUS },
      });
      const metrics = createMockFocusMetrics();
      expect(
        engine.calculateScore(lightSession, metrics).pausePenalty,
      ).toBeLessThan(engine.calculateScore(baseSession, metrics).pausePenalty);
    });

    it("adds study quiz bonus points", () => {
      const session = createMockSession({
        config: {
          ...createMockSession().config,
          sessionMode: SessionMode.STUDY,
          quizBonusPoints: 10,
        },
      });
      const calculation = engine.calculateScore(
        session,
        createMockFocusMetrics(),
      );
      expect(calculation.intervalBonus).toBeGreaterThanOrEqual(10);
    });

    it("adds creative mood bonus points", () => {
      const session = createMockSession({
        config: {
          ...createMockSession().config,
          sessionMode: SessionMode.CREATIVE,
          creativeMoodBonus: 10,
        },
      });
      expect(
        engine.calculateScore(session, createMockFocusMetrics()).intervalBonus,
      ).toBeGreaterThanOrEqual(10);
    });

    it("adds sprint chain bonus points", () => {
      const session = createMockSession({
        config: {
          ...createMockSession().config,
          sessionMode: SessionMode.SPRINT,
          sprintChainCount: 4,
        },
      });
      expect(
        engine.calculateScore(session, createMockFocusMetrics()).intervalBonus,
      ).toBeGreaterThan(0);
    });
  });
});
