import {
  availabilityFor,
  GAMER_PROFILE,
  CALM_PROFILE,
  STUDENT_PROFILE,
  WORKER_PROFILE,
  INTENSE_PROFILE,
  buildFeatureAccess,
  buildHomeFeatureRuntime,
  buildRootExposureFlags,
  allFlagsOn,
} from "./helpers";

// ============================================================================
// 0.3 — Home stage progression: what each stage sees
// ============================================================================

describe("home stage progression", () => {
  it("NEW_USER (0 sessions) has CORE tier only", () => {
    const { features, productTier, stage } = buildFeatureAccess({
      totalCompletedSessions: 0,
    });
    expect(stage).toBe("NEW_USER");
    expect(productTier).toBe("CORE_EXECUTION");

    const runtime = buildHomeFeatureRuntime(features, productTier);
    expect(runtime.shouldShowSecondarySystems).toBe(false);
    expect(runtime.shouldShowExpansionSystems).toBe(false);
    expect(runtime.canQueryBoss).toBe(false);
    expect(runtime.canQueryChallenges).toBe(false);
    expect(runtime.canQueryStudy).toBe(false);
    expect(runtime.canQueryCoach).toBe(false);
    expect(runtime.canQueryEconomy).toBe(false);
  });

  it("ACTIVATING (1-2 sessions) has CORE tier only", () => {
    const { features, productTier, stage } = buildFeatureAccess({
      totalCompletedSessions: 1,
    });
    expect(stage).toBe("ACTIVATING");
    expect(productTier).toBe("CORE_EXECUTION");

    const runtime = buildHomeFeatureRuntime(features, productTier);
    expect(runtime.shouldShowSecondarySystems).toBe(false);
  });

  it("ENGAGED (3-9 sessions) has SECONDARY tier", () => {
    const { features, productTier, stage } = buildFeatureAccess({
      totalCompletedSessions: 5,
    });
    expect(stage).toBe("ENGAGED");
    expect(productTier).toBe("COACHING");

    const runtime = buildHomeFeatureRuntime(features, productTier);
    expect(runtime.shouldShowSecondarySystems).toBe(true);
    expect(runtime.shouldShowExpansionSystems).toBe(false);
  });

  it("POWER_USER (10+ sessions) has EXPANSION tier", () => {
    const { features, productTier, stage } = buildFeatureAccess({
      totalCompletedSessions: 15,
    });
    expect(stage).toBe("POWER_USER");
    expect(productTier).toBe("STUDY_OS");

    const runtime = buildHomeFeatureRuntime(features, productTier);
    expect(runtime.shouldShowSecondarySystems).toBe(true);
    expect(runtime.shouldShowExpansionSystems).toBe(true);
  });
});

// ============================================================================
// 0.7 — Challenges threshold moved from 1 to 5 sessions
// ============================================================================

describe("challenges unlock timing", () => {
  it("stays locked at 1 session (old threshold)", () => {
    const avail = availabilityFor(1, "challenges");
    expect(avail.state).toBe("locked");
    expect(avail.canNavigate).toBe(false);
  });

  it("teases at 4 sessions", () => {
    const avail = availabilityFor(4, "challenges");
    expect(avail.state).toBe("teased");
    expect(avail.canRenderEntryPoint).toBe(true);
    expect(avail.canNavigate).toBe(false);
  });

  it("unlocks at 5 sessions for default profile", () => {
    const avail = availabilityFor(5, "challenges");
    expect(avail.state).toBe("unlocked");
    expect(avail.canNavigate).toBe(true);
  });
});

// ============================================================================
// 0.5 + 0.6 — Content Study and Boss intent-based gating
// ============================================================================

describe("intent-based feature gating", () => {
  it("Content Study unlocks at 5 sessions for student profile", () => {
    const avail = availabilityFor(5, "content_study", STUDENT_PROFILE);
    expect(avail.state).toBe("unlocked");
  });

  it("Content Study unlocks at 12 sessions for worker profile", () => {
    const avail = availabilityFor(12, "content_study", WORKER_PROFILE);
    expect(avail.state).toBe("unlocked");
  });

  it("Boss unlocks at 5 sessions for game_like profile", () => {
    const avail = availabilityFor(5, "boss_tab", GAMER_PROFILE);
    expect(avail.state).toBe("unlocked");
  });

  it("Boss unlocks at 9 sessions for intense profile", () => {
    const avail = availabilityFor(5, "boss_tab", INTENSE_PROFILE);
    expect(avail.state).toBe("unlocked");
  });
});
