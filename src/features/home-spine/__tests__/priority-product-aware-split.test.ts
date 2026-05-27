import {
  getPriorityCandidates,
  makeSnapshot,
  mockFeatureAccess,
  calmDayZeroProductContext,
  type ProductContext,
} from "./priority-product-aware.helpers";

describe("product-aware priority checkers", () => {
  it("does not return OPEN_BOSS for calm Day 0 user", () => {
    const snapshot = makeSnapshot({
      boss: { hasActiveEncounter: true, isFinalStrike: false },
    });
    const candidates = getPriorityCandidates(
      snapshot,
      mockFeatureAccess,
      calmDayZeroProductContext,
    );
    const bossCandidate = candidates.find((c) => c.cta.action === "OPEN_BOSS");
    expect(bossCandidate).toBeUndefined();
  });

  it("does not return OPEN_CHALLENGES when challenge surface blocked", () => {
    const snapshot = makeSnapshot({
      challenge: {
        id: "550e8400-e29b-41d4-a716-446655440001",
        isNearDone: true,
        progressPercent: 85,
      },
    });
    const blockedContext: ProductContext = {
      surfaceMap: {
        challenge_teaser: "blocked",
        weekly_quest: "blocked",
      },
    };
    const candidates = getPriorityCandidates(
      snapshot,
      mockFeatureAccess,
      blockedContext,
    );
    const challengeCandidate = candidates.find(
      (c) => c.cta.action === "OPEN_CHALLENGES",
    );
    expect(challengeCandidate).toBeUndefined();
  });

  it("returns OPEN_SESSION_SETUP if top action blocked", () => {
    const snapshot = makeSnapshot({
      boss: { hasActiveEncounter: true, isFinalStrike: false },
    });
    const candidates = getPriorityCandidates(
      snapshot,
      mockFeatureAccess,
      calmDayZeroProductContext,
    );
    const defaultCandidate = candidates.find(
      (c) => c.type === "DEFAULT_SESSION",
    );
    expect(defaultCandidate).toBeDefined();
    expect(defaultCandidate?.cta.action).toBe("OPEN_SESSION_SETUP");
  });

  it("study user can get Study CTA only when study_layer allowed", () => {
    const studySnapshot = makeSnapshot({
      onboarding: { firstSessionCompleted: true, isComplete: true },
      streak: { currentDays: 3, isAtRisk: false, isComeback: false },
    });
    const studyContext: ProductContext = {
      userStage: "engaged",
      totalCompletedSessions: 5,
      motivationStyle: "study_focused",
      surfaceMap: {
        study_layer: "secondary",
      },
    };
    const candidates = getPriorityCandidates(
      studySnapshot,
      mockFeatureAccess,
      studyContext,
    );
    expect(candidates.length).toBeGreaterThan(0);
    expect(candidates.every((c) => c.urgency >= 10)).toBe(true);
  });

  it("game-like engaged user can get Boss CTA when surface allows", () => {
    const gameSnapshot = makeSnapshot({
      boss: { hasActiveEncounter: true, isFinalStrike: false },
      onboarding: { firstSessionCompleted: true, isComplete: true },
    });
    const gameContext: ProductContext = {
      userStage: "engaged",
      totalCompletedSessions: 12,
      motivationStyle: "game_like",
      firstWeekExperience: {
        bossIntensity: "visible",
        currentDayStage: "POST_DAY_7",
        premiumMoment: "none",
        allowedHomeSurfaces: ["boss_compact", "start_session"],
      },
      surfaceMap: {
        boss_compact: "secondary",
        boss_full_cta: "hidden",
      },
    };
    const candidates = getPriorityCandidates(
      gameSnapshot,
      undefined,
      gameContext,
    );
    const bossCandidate = candidates.find((c) => c.cta.action === "OPEN_BOSS");
    expect(bossCandidate).toBeDefined();
  });

  it("premium action filtered before premiumMoment", () => {
    const snapshot = makeSnapshot({
      onboarding: { firstSessionCompleted: true, isComplete: true },
      streak: { currentDays: 5, isAtRisk: false, isComeback: false },
    });
    const noPremiumContext: ProductContext = {
      userStage: "engaged",
      totalCompletedSessions: 6,
      firstWeekExperience: {
        bossIntensity: "subtle",
        currentDayStage: "POST_DAY_7",
        premiumMoment: "none",
        allowedHomeSurfaces: ["start_session"],
      },
    };
    const candidates = getPriorityCandidates(
      snapshot,
      mockFeatureAccess,
      noPremiumContext,
    );
    const defaultCandidate = candidates.find(
      (c) => c.type === "DEFAULT_SESSION",
    );
    expect(defaultCandidate).toBeDefined();
    expect(candidates.length).toBe(1);
  });
});
