import {
  GAMER_PROFILE,
  CALM_PROFILE,
  STUDENT_PROFILE,
  buildFeatureAccess,
  buildRootExposureFlags,
  buildHomeFeatureRuntime,
  allFlagsOn,
} from "./helpers";

// ============================================================================
// 0.9 — Route registration contract: locked features must not register routes
// ============================================================================

describe("route registration contract", () => {
  it("does not register routes for final-release deactivated features", () => {
    const { features } = buildFeatureAccess({ totalCompletedSessions: 99 });
    const show = buildRootExposureFlags({ features, isEnabled: allFlagsOn });

    expect(show.battlePass).toBe(false);
    expect(show.shop).toBe(false);
    expect(show.inventory).toBe(false);
    expect(show.vault).toBe(false);
    expect(show.guild).toBe(false);
  });

  it("does not register routes for new users", () => {
    const { features } = buildFeatureAccess({ totalCompletedSessions: 0 });
    const show = buildRootExposureFlags({ features, isEnabled: allFlagsOn });

    expect(show.challenges).toBe(false);
    expect(show.boss).toBe(false);
    expect(show.study).toBe(false);
    expect(show.coach).toBe(false);
  });

  it("registers challenge route after unlock", () => {
    const { features } = buildFeatureAccess({ totalCompletedSessions: 5 });
    const show = buildRootExposureFlags({ features, isEnabled: allFlagsOn });

    expect(show.challenges).toBe(true);
  });

  it("registers boss route for gamer profile at 5 sessions", () => {
    const { features } = buildFeatureAccess({
      totalCompletedSessions: 5,
      motivationProfile: GAMER_PROFILE,
    });
    const show = buildRootExposureFlags({ features, isEnabled: allFlagsOn });

    expect(show.boss).toBe(true);
  });

  it("does not register boss route for calm profile at 5 sessions", () => {
    const { features } = buildFeatureAccess({
      totalCompletedSessions: 5,
      motivationProfile: CALM_PROFILE,
    });
    const show = buildRootExposureFlags({ features, isEnabled: allFlagsOn });

    expect(show.boss).toBe(false);
  });

  it("registers study route for student profile at 5 sessions", () => {
    const { features } = buildFeatureAccess({
      totalCompletedSessions: 5,
      motivationProfile: STUDENT_PROFILE,
    });
    const show = buildRootExposureFlags({ features, isEnabled: allFlagsOn });

    expect(show.study).toBe(true);
  });

  it("does not register study route for default profile at 5 sessions", () => {
    const { features } = buildFeatureAccess({
      totalCompletedSessions: 5,
    });
    const show = buildRootExposureFlags({ features, isEnabled: allFlagsOn });

    expect(show.study).toBe(false);
  });
});

// ============================================================================
// 0.9 — Query gating contract: locked features must not fire queries
// ============================================================================

describe("query gating contract", () => {
  it("blocks challenge queries before unlock", () => {
    const { features, productTier } = buildFeatureAccess({
      totalCompletedSessions: 0,
    });
    const runtime = buildHomeFeatureRuntime(features, productTier);
    expect(runtime.canQueryChallenges).toBe(false);
  });

  it("allows challenge queries after unlock", () => {
    const { features, productTier } = buildFeatureAccess({
      totalCompletedSessions: 5,
    });
    const runtime = buildHomeFeatureRuntime({
      features,
      productTier,
      totalSessions: 5,
    });
    expect(runtime.canQueryChallenges).toBe(true);
  });

  it("blocks boss query before unlock", () => {
    const { features, productTier } = buildFeatureAccess({
      totalCompletedSessions: 3,
    });
    const runtime = buildHomeFeatureRuntime(features, productTier);
    expect(runtime.canQueryBoss).toBe(false);
  });

  it("blocks study query before unlock", () => {
    const { features, productTier } = buildFeatureAccess({
      totalCompletedSessions: 5,
    });
    const runtime = buildHomeFeatureRuntime(features, productTier);
    expect(runtime.canQueryStudy).toBe(false);
  });

  it("blocks economy query for new users", () => {
    const { features, productTier } = buildFeatureAccess({
      totalCompletedSessions: 0,
    });
    const runtime = buildHomeFeatureRuntime(features, productTier);
    expect(runtime.canQueryEconomy).toBe(false);
  });

  it("blocks coach query for new users", () => {
    const { features, productTier } = buildFeatureAccess({
      totalCompletedSessions: 0,
    });
    const runtime = buildHomeFeatureRuntime(features, productTier);
    expect(runtime.canQueryCoach).toBe(false);
  });
});
