import {
  CoachRecommendationService,
  createCoachRecommendationService,
  convertToHomeRecommendation,
  COACH_PERSONAS,
  type RecommendationContext,
  type CoachPersonaId,
} from "../services/CoachRecommendationService";

describe("CoachRecommendationService - Refresh & Edge Cases", () => {
  const createBaseContext = (
    overrides: Partial<RecommendationContext> = {},
  ): RecommendationContext => ({
    userId: "test-user",
    currentTime: new Date(),
    streakDays: 5,
    hasCompletedSessionToday: false,
    hoursUntilStreakBreak: 6,
    activeStudyPlan: null,
    studyPlanProgress: 0,
    studyPlanDaysBehind: 0,
    activeBoss: null,
    totalSessions: 20,
    currentLevel: 3,
    daysSinceLastSession: 0.5,
    behaviorProfile: null,
    coachPersonaId: "mentor",
    ...overrides,
  });

  describe("Home Recommendation Conversion", () => {
    it("should convert coach recommendation to home format", () => {
      const context = createBaseContext({
        streakDays: 5,
        hoursUntilStreakBreak: 3,
      });
      const service = new CoachRecommendationService(context);
      const coachRec = service.getRecommendation();
      const homeRec = convertToHomeRecommendation(coachRec);
      expect(homeRec.id).toBe(coachRec.id);
      expect(homeRec.type).toBe(coachRec.type);
      expect(homeRec.headline).toBe(coachRec.headline);
      expect(homeRec.subtext).toBe(coachRec.subtext);
      expect(homeRec.ctaText).toBe(coachRec.ctaText);
      expect(homeRec.ctaAction).toBe(coachRec.ctaAction);
      expect(homeRec.aiCoachMessage).toBe(coachRec.coachMessage);
      expect(homeRec.visualCue).toBe(coachRec.visualCue);
    });
  });

  describe("Refresh Logic", () => {
    it("should refresh after 5 minutes", () => {
      const context = createBaseContext();
      const service = new CoachRecommendationService(context);
      const recommendation = service.getRecommendation();
      const sixMinutesAgo = Date.now() - 6 * 60 * 1000;
      expect(service.shouldRefresh(sixMinutesAgo, recommendation)).toBe(true);
    });
    it("should NOT refresh before 5 minutes", () => {
      const context = createBaseContext();
      const service = new CoachRecommendationService(context);
      const recommendation = service.getRecommendation();
      const oneMinuteAgo = Date.now() - 60 * 1000;
      expect(service.shouldRefresh(oneMinuteAgo, recommendation)).toBe(false);
    });
    it("should refresh more frequently for critical streak protection", () => {
      const context = createBaseContext({
        streakDays: 5,
        hoursUntilStreakBreak: 1,
      });
      const service = new CoachRecommendationService(context);
      const recommendation = service.getRecommendation();
      const twoMinutesAgo = Date.now() - 2 * 60 * 1000;
      expect(service.shouldRefresh(twoMinutesAgo, recommendation)).toBe(true);
    });
  });

  describe("Factory Function", () => {
    it("should create service via factory function", () => {
      const context = createBaseContext();
      const service = createCoachRecommendationService(context);
      expect(service).toBeInstanceOf(CoachRecommendationService);
      const recommendation = service.getRecommendation();
      expect(recommendation).toBeDefined();
    });
  });

  describe("Edge Cases", () => {
    it("should handle null active study plan", () => {
      const context = createBaseContext({ activeStudyPlan: null });
      const service = new CoachRecommendationService(context);
      const recommendation = service.getRecommendation();
      expect(recommendation).toBeDefined();
      expect(recommendation.type).not.toBe("study_plan");
    });
    it("should handle null active boss", () => {
      const context = createBaseContext({ activeBoss: null });
      const service = new CoachRecommendationService(context);
      const recommendation = service.getRecommendation();
      expect(recommendation).toBeDefined();
      expect(recommendation.type).not.toBe("boss_battle");
      expect(recommendation.type).not.toBe("boss_opportunity");
    });
    it("should handle zero streak days", () => {
      const context = createBaseContext({
        streakDays: 0,
        hoursUntilStreakBreak: null,
      });
      const service = new CoachRecommendationService(context);
      const recommendation = service.getRecommendation();
      expect(recommendation.type).not.toBe("protect_streak");
    });
    it("should handle invalid persona gracefully", () => {
      const context = createBaseContext({
        coachPersonaId: "invalid-persona" as CoachPersonaId,
      });
      const service = new CoachRecommendationService(context);
      expect(() => service.getRecommendation()).not.toThrow();
      const recommendation = service.getRecommendation();
      expect(recommendation).toBeDefined();
    });
  });

  describe("All Applicable Recommendations", () => {
    it("should return multiple applicable recommendations", () => {
      const context = createBaseContext({
        hasCompletedSessionToday: true,
        streakDays: 5,
        activeBoss: {
          id: "boss-1",
          name: "Test Boss",
          healthRemaining: 80,
          maxHealth: 100,
          timeRemaining: 24,
        },
      });
      const service = new CoachRecommendationService(context);
      const allRecs = service.getAllApplicable();
      expect(allRecs.length).toBeGreaterThan(1);
      const momentumRec = allRecs.find((r) => r.type === "momentum_building");
      expect(momentumRec).toBeDefined();
      const bossRec = allRecs.find((r) => r.type === "boss_battle");
      expect(bossRec).toBeDefined();
    });
  });

  describe("Personas", () => {
    it("should have all four personas defined", () => {
      expect(COACH_PERSONAS.mentor).toBeDefined();
      expect(COACH_PERSONAS.trainer).toBeDefined();
      expect(COACH_PERSONAS.peer).toBeDefined();
      expect(COACH_PERSONAS.professor).toBeDefined();
    });
    it("should have correct voice tone for each persona", () => {
      expect(COACH_PERSONAS.mentor.voiceTone).toBe("WISE");
      expect(COACH_PERSONAS.trainer.voiceTone).toBe("STERN");
      expect(COACH_PERSONAS.peer.voiceTone).toBe("PLAYFUL");
      expect(COACH_PERSONAS.professor.voiceTone).toBe("WISE");
    });
    it("should have correct sentence structure guidelines", () => {
      expect(COACH_PERSONAS.mentor.sentenceStructure).toBe("MEASURED");
      expect(COACH_PERSONAS.trainer.sentenceStructure).toBe("SHORT_DIRECT");
      expect(COACH_PERSONAS.peer.sentenceStructure).toBe("CONVERSATIONAL");
      expect(COACH_PERSONAS.professor.sentenceStructure).toBe("MEASURED");
    });
  });
});
