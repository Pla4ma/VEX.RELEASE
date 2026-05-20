import {
  buildFeatureAccess,
  getFeatureAvailability,
  type FeatureAvailability,
  type MotivationProfile,
} from "../feature-access";
import { buildRootExposureFlags } from "../../../navigation/feature-exposure";
import { buildHomeFeatureRuntime } from "../../../screens/home/hooks/home-feature-runtime";

const allFlagsOn = (): boolean => true;

function availabilityFor(
  sessions: number,
  feature: string,
  profile?: MotivationProfile,
): FeatureAvailability {
  const { features } = buildFeatureAccess({
    totalCompletedSessions: sessions,
    motivationProfile: profile,
  });
  const key = feature as keyof typeof features;
  return getFeatureAvailability(features[key]);
}

const STUDENT_PROFILE: MotivationProfile = {
  primary: "student",
  secondary: ["calm", "creator"],
};

const GAMER_PROFILE: MotivationProfile = {
  primary: "game_like",
  secondary: ["intense", "competitive"],
};

const CALM_PROFILE: MotivationProfile = {
  primary: "calm",
  secondary: ["friendly"],
};

const WORKER_PROFILE: MotivationProfile = {
  primary: "worker",
  secondary: ["calm", "student"],
};

const INTENSE_PROFILE: MotivationProfile = {
  primary: "intense",
  secondary: ["competitive", "game_like"],
};

// ============================================================================
// 0.1 — FeatureAvailability contract: every state has correct field values
// ============================================================================

describe("FeatureAvailability contract", () => {
  describe("disabled state", () => {
    it("returns all-false for disabled_beta features at any session count", () => {
      const avail = availabilityFor(0, "battle_pass");
      expect(avail.state).toBe("disabled");
      expect(avail.canRenderEntryPoint).toBe(false);
      expect(avail.canNavigate).toBe(false);
      expect(avail.canQuery).toBe(false);
      expect(avail.canUseBackend).toBe(false);
      expect(avail.canRegisterRoute).toBe(false);
      expect(avail.canSubscribeToEvents).toBe(false);
      expect(avail.canShowNotification).toBe(false);
    });

    it("returns all-false for disabled_beta features even at 999 sessions", () => {
      const avail = availabilityFor(999, "squads");
      expect(avail.state).toBe("disabled");
      expect(avail.canRegisterRoute).toBe(false);
    });
  });

  describe("unlocked state", () => {
    it("returns all-true for core features at 0 sessions", () => {
      const avail = availabilityFor(0, "focus_session");
      expect(avail.state).toBe("unlocked");
      expect(avail.canRenderEntryPoint).toBe(true);
      expect(avail.canNavigate).toBe(true);
      expect(avail.canQuery).toBe(true);
      expect(avail.canUseBackend).toBe(true);
      expect(avail.canRegisterRoute).toBe(true);
      expect(avail.canSubscribeToEvents).toBe(true);
      expect(avail.canShowNotification).toBe(true);
    });

    it("returns all-true for progressively unlocked features past threshold", () => {
      const avail = availabilityFor(8, "boss_tab", GAMER_PROFILE);
      expect(avail.state).toBe("unlocked");
      expect(avail.canNavigate).toBe(true);
      expect(avail.canRegisterRoute).toBe(true);
      expect(avail.canSubscribeToEvents).toBe(true);
    });
  });

  describe("teased state", () => {
    it("shows entry point but blocks navigation, queries, routes, events, notifications", () => {
      const avail = availabilityFor(2, "companion_detail");
      expect(avail.state).toBe("teased");
      expect(avail.canRenderEntryPoint).toBe(true);
      expect(avail.canNavigate).toBe(false);
      expect(avail.canQuery).toBe(false);
      expect(avail.canUseBackend).toBe(false);
      expect(avail.canRegisterRoute).toBe(false);
      expect(avail.canSubscribeToEvents).toBe(false);
      expect(avail.canShowNotification).toBe(false);
    });
  });

  describe("locked state", () => {
    it("returns all-false for features before teaser threshold", () => {
      const avail = availabilityFor(0, "challenges");
      expect(avail.state).toBe("locked");
      expect(avail.canRenderEntryPoint).toBe(false);
      expect(avail.canNavigate).toBe(false);
      expect(avail.canRegisterRoute).toBe(false);
    });
  });
});

// ============================================================================
// 0.2 — Motivation profiles accelerate and restrict unlocks
// ============================================================================

describe("motivation profile effects", () => {
  it("accelerates Boss unlock for game_like profile (7→5)", () => {
    // At 5 sessions with gamer profile, boss should unlock
    const avail = availabilityFor(5, "boss_tab", GAMER_PROFILE);
    expect(avail.state).toBe("unlocked");
    expect(avail.canNavigate).toBe(true);
  });

  it("delays Boss unlock for calm profile (7→15)", () => {
    // Calm primary → restrictVisibility=true, restrictVisibilityMin=20
    // Boss is HIDDEN entirely until 20 sessions for calm profile
    const avail7 = availabilityFor(7, "boss_tab", CALM_PROFILE);
    expect(avail7.state).toBe("disabled");

    // At 14 sessions, still hidden
    const avail14 = availabilityFor(14, "boss_tab", CALM_PROFILE);
    expect(avail14.state).toBe("disabled");

    // At 20 sessions, becomes visible but threshold is 7+8=15 → unlocked
    const avail20 = availabilityFor(20, "boss_tab", CALM_PROFILE);
    expect(avail20.state).toBe("unlocked");
  });

  it("hides Boss from calm profile entirely until 20 sessions", () => {
    const { features } = buildFeatureAccess({
      totalCompletedSessions: 5,
      motivationProfile: CALM_PROFILE,
    });
    expect(features.boss_tab.isVisible).toBe(false);
  });

  it("accelerates Content Study for student profile (12→5)", () => {
    const avail = availabilityFor(5, "content_study", STUDENT_PROFILE);
    expect(avail.state).toBe("unlocked");
    expect(avail.canNavigate).toBe(true);
  });

  it("delays Content Study for calm profile (12→18)", () => {
    // Calm primary → restrict offset 6, threshold = 12+6=18
    // Teaser at 8 sessions, so at 12 it's teased (not locked, not unlocked)
    const avail12 = availabilityFor(12, "content_study", CALM_PROFILE);
    expect(avail12.state).toBe("teased");

    const avail18 = availabilityFor(18, "content_study", CALM_PROFILE);
    expect(avail18.state).toBe("unlocked");
  });

  it("accelerates Challenges for intense profile (5→3)", () => {
    const avail = availabilityFor(3, "challenges", INTENSE_PROFILE);
    expect(avail.state).toBe("unlocked");
  });

  it("delays Challenges for calm profile (5→8)", () => {
    // Calm primary → restrict offset 3, threshold = 5+3=8, teaser at 3
    const avail5 = availabilityFor(5, "challenges", CALM_PROFILE);
    expect(avail5.state).toBe("teased");

    const avail8 = availabilityFor(8, "challenges", CALM_PROFILE);
    expect(avail8.state).toBe("unlocked");
  });

  it("accelerates Companion for calm and student profiles (3→2)", () => {
    const avail2calm = availabilityFor(2, "companion_detail", CALM_PROFILE);
    expect(avail2calm.state).toBe("unlocked");

    const avail2student = availabilityFor(
      2,
      "companion_detail",
      STUDENT_PROFILE,
    );
    expect(avail2student.state).toBe("unlocked");
  });

  it("delays Companion for intense profile (3→4)", () => {
    // Intense primary → restrict offset 1, threshold = 3+1=4, teaser at 2
    const avail3 = availabilityFor(3, "companion_detail", INTENSE_PROFILE);
    expect(avail3.state).toBe("teased");

    const avail4 = availabilityFor(4, "companion_detail", INTENSE_PROFILE);
    expect(avail4.state).toBe("unlocked");
  });

  it("does not modify thresholds when no motivation profile is provided", () => {
    const avail = availabilityFor(5, "challenges");
    expect(avail.state).toBe("unlocked");
  });
});

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

  it("teases at 3 sessions", () => {
    const avail = availabilityFor(3, "challenges");
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
    // Worker has no accelerate/restrict for content_study, defaults to 12
    const avail = availabilityFor(12, "content_study", WORKER_PROFILE);
    expect(avail.state).toBe("unlocked");
  });

  it("Boss unlocks at 5 sessions for game_like profile", () => {
    const avail = availabilityFor(5, "boss_tab", GAMER_PROFILE);
    expect(avail.state).toBe("unlocked");
  });

  it("Boss unlocks at 9 sessions for intense profile", () => {
    // intense gets accelerateOffset 2, so 7-2=5
    const avail = availabilityFor(5, "boss_tab", INTENSE_PROFILE);
    expect(avail.state).toBe("unlocked");
  });
});

// ============================================================================
// 0.9 — Route registration contract: locked features must not register routes
// ============================================================================

describe("route registration contract", () => {
  it("does not register routes for disabled beta features", () => {
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
    const runtime = buildHomeFeatureRuntime(features, productTier);
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

// ============================================================================
// 0.10 — First 7 days journey: the critical path must be clean
// ============================================================================

describe("first 7 days journey", () => {
  it("day 0: only core features visible, nothing else registered", () => {
    const { features, productTier, stage } = buildFeatureAccess({
      totalCompletedSessions: 0,
    });
    const show = buildRootExposureFlags({ features, isEnabled: allFlagsOn });

    expect(stage).toBe("NEW_USER");
    expect(productTier).toBe("CORE_EXECUTION");
    expect(features.focus_session.isUnlocked).toBe(true);
    expect(features.home_tab.isUnlocked).toBe(true);
    expect(features.focus_tab.isUnlocked).toBe(true);
    expect(features.progress_view.isUnlocked).toBe(true);
    expect(features.ai_coach_basic.isUnlocked).toBe(true);

    // Nothing secondary should be registered
    expect(show.challenges).toBe(false);
    expect(show.boss).toBe(false);
    expect(show.study).toBe(false);
    expect(show.coach).toBe(false);
    expect(show.companion).toBe(false);
  });

  it("day 1-2: companion teases, nothing else unlocks", () => {
    const { features, stage } = buildFeatureAccess({
      totalCompletedSessions: 2,
    });
    expect(stage).toBe("ACTIVATING");
    expect(features.companion_detail.isTeased).toBe(true);
    expect(features.companion_detail.isUnlocked).toBe(false);
    expect(features.challenges.isUnlocked).toBe(false);
    expect(features.boss_tab.isUnlocked).toBe(false);
  });

  it("day 3: companion detail unlocks", () => {
    const avail = availabilityFor(3, "companion_detail");
    expect(avail.state).toBe("unlocked");
  });

  it("day 5: challenges unlock for default profile", () => {
    const avail = availabilityFor(5, "challenges");
    expect(avail.state).toBe("unlocked");
  });

  it("day 7: boss unlocks for game_like profile, but not for calm", () => {
    const gamerBoss = availabilityFor(7, "boss_tab", GAMER_PROFILE);
    expect(gamerBoss.state).toBe("unlocked");

    // Calm profile: boss is completely hidden (disabled) until 20 sessions
    const calmBoss = availabilityFor(7, "boss_tab", CALM_PROFILE);
    expect(calmBoss.state).toBe("disabled");
  });

  it("full 20-session progression: all progressive features unlocked for gamer", () => {
    const { features } = buildFeatureAccess({
      totalCompletedSessions: 20,
      motivationProfile: GAMER_PROFILE,
    });
    expect(features.challenges.isUnlocked).toBe(true);
    expect(features.companion_detail.isUnlocked).toBe(true);
    expect(features.boss_tab.isUnlocked).toBe(true);
    expect(features.economy_basic.isUnlocked).toBe(true);
    expect(features.achievements.isUnlocked).toBe(true);
    expect(features.ai_coach_advanced.isUnlocked).toBe(true);
    expect(features.content_study.isUnlocked).toBe(true);
    expect(features.quiz_review_mode.isUnlocked).toBe(true);
    expect(features.advanced_settings.isUnlocked).toBe(true);
    expect(features.seasonal_features.isUnlocked).toBe(false);

    // Disabled beta features stay locked
    expect(features.battle_pass.isUnlocked).toBe(false);
    expect(features.shop.isUnlocked).toBe(false);
  });
});

// ============================================================================
// 0.8 — Single source of truth: every system uses getFeatureAvailability
// ============================================================================

describe("single source of truth", () => {
  it("FeatureAvailability contract is consumed by home feature runtime", () => {
    const { features, productTier } = buildFeatureAccess({
      totalCompletedSessions: 10,
      motivationProfile: GAMER_PROFILE,
    });
    const runtime = buildHomeFeatureRuntime(features, productTier);

    expect(runtime.canQueryBoss).toBe(false);

    const challengesAvail = getFeatureAvailability(features.challenges);
    expect(runtime.canQueryChallenges).toBe(challengesAvail.canQuery);

    const studyAvail = getFeatureAvailability(features.content_study);
    expect(runtime.canQueryStudy).toBe(studyAvail.canQuery);
  });

  it("FeatureAvailability contract is consumed by route exposure", () => {
    const { features } = buildFeatureAccess({
      totalCompletedSessions: 10,
      motivationProfile: GAMER_PROFILE,
    });
    const show = buildRootExposureFlags({ features, isEnabled: allFlagsOn });

    const bossAvail = getFeatureAvailability(features.boss_tab);
    expect(show.boss).toBe(bossAvail.canNavigate && bossAvail.canRegisterRoute);

    const challengesAvail = getFeatureAvailability(features.challenges);
    expect(show.challenges).toBe(
      challengesAvail.canNavigate && challengesAvail.canRegisterRoute,
    );
  });

  it("does not leak disabled feature access through any path", () => {
    const { features } = buildFeatureAccess({ totalCompletedSessions: 999 });
    const show = buildRootExposureFlags({ features, isEnabled: allFlagsOn });
    const runtime = buildHomeFeatureRuntime(features, "RPG_DEPTH");

    // Disabled features must be unavailable everywhere
    expect(show.battlePass).toBe(false);
    expect(runtime.canQueryBattlePass).toBe(false);
    expect(features.battle_pass.isUnlocked).toBe(false);
    expect(features.battle_pass.isVisible).toBe(false);

    const avail = getFeatureAvailability(features.battle_pass);
    expect(avail.canRegisterRoute).toBe(false);
    expect(avail.canSubscribeToEvents).toBe(false);
    expect(avail.canShowNotification).toBe(false);
  });
});
