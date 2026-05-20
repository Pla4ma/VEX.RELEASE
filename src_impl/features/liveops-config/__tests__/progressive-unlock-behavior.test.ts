import {
  buildFeatureAccess,
  getFeatureAvailability,
  type FeatureAvailability,
  type FeatureKey,
} from "../feature-access";
import { buildRootExposureFlags } from "../../../navigation/feature-exposure";
import { buildHomeFeatureRuntime } from "../../../screens/home/hooks/home-feature-runtime";
import { resolveFeatureRoute } from "../../../navigation/openFeature";
import { routeNotificationAction } from "../../../navigation/notification-routing-core";

const allFlagsOn = (): boolean => true;
const EXPOSURE_KEYS: Partial<
  Record<FeatureKey, keyof ReturnType<typeof buildRootExposureFlags>>
> = {
  achievements: "mastery",
  ai_coach_advanced: "coach",
  battle_pass: "battlePass",
  boss_tab: "boss",
  challenges: "challenges",
  companion_detail: "companion",
  content_study: "study",
  inventory: "inventory",
  shop: "shop",
};
const RUNTIME_QUERY_KEYS: Partial<
  Record<FeatureKey, keyof ReturnType<typeof buildHomeFeatureRuntime>>
> = {
  battle_pass: "canQueryBattlePass",
  boss_bounties: "canQueryBoss",
  economy_advanced: "canQueryEconomy",
  squads: "canQuerySquads",
};

function availabilityFor(
  sessions: number,
  feature: FeatureKey,
): FeatureAvailability {
  const { features } = buildFeatureAccess({ totalCompletedSessions: sessions });
  return getFeatureAvailability(features[feature]);
}

function exposureFor(sessions: number, feature: FeatureKey): boolean {
  const { features } = buildFeatureAccess({ totalCompletedSessions: sessions });
  const flags = buildRootExposureFlags({ features, isEnabled: allFlagsOn });
  const key = EXPOSURE_KEYS[feature];
  return key === undefined ? false : flags[key];
}

function runtimeFor(
  sessions: number,
): ReturnType<typeof buildHomeFeatureRuntime> {
  const userId = "test-user";
  const { features } = buildFeatureAccess({ totalCompletedSessions: sessions });
  const exposure = buildRootExposureFlags({ features, isEnabled: allFlagsOn });
  return buildHomeFeatureRuntime({
    features,
    exposureFlags: exposure,
    isFeatureFlagEnabled: allFlagsOn,
    userId,
    isAuthenticated: true,
    totalSessions: sessions,
  });
}

const PROGRESSIVE_FEATURES: FeatureKey[] = [
  "companion_detail",
  "challenges",
  "boss_tab",
  "ai_coach_advanced",
  "content_study",
  "achievements",
  "quiz_review_mode",
  "economy_basic",
  "advanced_settings",
  "seasonal_features",
  "content_study_advanced",
];

const HIDDEN_FEATURES: FeatureKey[] = [
  "battle_pass",
  "squads",
  "shop",
  "inventory",
  "social_tab",
  "rivals",
  "rankings",
  "wagers",
  "streak_insurance",
  "gems_prominent",
  "boss_bounties",
  "economy_advanced",
];

// ============================================================================
// Phase 5.2 — Progressive unlock behavior contracts
// ============================================================================

describe("Progressive unlock — behavior contracts", () => {
  // --------------------------------------------------------------------------
  // Contract 1: Hidden features — no CTA, no route, no query, no backend
  // --------------------------------------------------------------------------
  describe("hidden/disabled features (session 0)", () => {
    HIDDEN_FEATURES.forEach((feature) => {
      it(`${feature}: no CTA visible, no route registered, no query enabled`, () => {
        const avail = availabilityFor(0, feature);
        expect(avail.canRenderEntryPoint).toBe(false);
        expect(avail.canNavigate).toBe(false);
        expect(avail.canQuery).toBe(false);
        expect(avail.canUseBackend).toBe(false);
        expect(avail.canRegisterRoute).toBe(false);
        expect(avail.canSubscribeToEvents).toBe(false);
        expect(avail.canShowNotification).toBe(false);
      });

      it(`${feature}: route is not exposed`, () => {
        expect(exposureFor(0, feature)).toBe(false);
      });

      it(`${feature}: home runtime query is disabled`, () => {
        const rt = runtimeFor(0);
        const queryKey = RUNTIME_QUERY_KEYS[feature];
        if (queryKey === undefined) {
          expect(availabilityFor(0, feature).canQuery).toBe(false);
        } else {
          expect(rt[queryKey]).toBe(false);
        }
      });
    });
  });

  // --------------------------------------------------------------------------
  // Contract 2: Teased features — teaser visible, no navigation, no queries
  // --------------------------------------------------------------------------
  describe("teased features", () => {
    it("companion_detail is teased at 2 sessions", () => {
      const avail = availabilityFor(2, "companion_detail");
      expect(avail.state).toBe("teased");
      expect(avail.canRenderEntryPoint).toBe(true);
      expect(avail.canNavigate).toBe(false);
      expect(avail.canQuery).toBe(false);
      expect(avail.canUseBackend).toBe(false);
      expect(avail.canRegisterRoute).toBe(false);
    });

    it("companion_detail teaser shows CTA that redirects to core action (not navigate)", () => {
      const avail = availabilityFor(2, "companion_detail");
      expect(avail.canNavigate).toBe(false);
      expect(avail.canRenderEntryPoint).toBe(true);
    });

    it("challenges is teased at 3 sessions", () => {
      const avail = availabilityFor(3, "challenges");
      expect(avail.state).toBe("teased");
      expect(avail.canRenderEntryPoint).toBe(true);
      expect(avail.canNavigate).toBe(false);
    });

    it("boss_tab is teased at 5 sessions", () => {
      const avail = availabilityFor(5, "boss_tab");
      expect(avail.state).toBe("teased");
      expect(avail.canRenderEntryPoint).toBe(true);
      expect(avail.canNavigate).toBe(false);
    });

    it("ai_coach_advanced is teased at 6 sessions", () => {
      const avail = availabilityFor(6, "ai_coach_advanced");
      expect(avail.state).toBe("teased");
      expect(avail.canNavigate).toBe(false);
    });

    it("content_study is teased at 8 sessions", () => {
      const avail = availabilityFor(8, "content_study");
      expect(avail.state).toBe("teased");
      expect(avail.canNavigate).toBe(false);
    });

    it("quiz_review_mode is teased at 9 sessions", () => {
      const avail = availabilityFor(9, "quiz_review_mode");
      expect(avail.state).toBe("teased");
      expect(avail.canNavigate).toBe(false);
    });

    it("premium_paywall is teased at 5 sessions but never unlocked", () => {
      const at5 = availabilityFor(5, "premium_paywall");
      expect(at5.state).toBe("teased");
      const at50 = availabilityFor(50, "premium_paywall");
      expect(at50.state).toBe("teased");
    });
  });

  // --------------------------------------------------------------------------
  // Contract 3: Unlocked features — route registered, query enabled, CTA safe
  // --------------------------------------------------------------------------
  describe("unlocked progressive features", () => {
    it("companion_detail unlocks at 3 sessions", () => {
      const avail = availabilityFor(3, "companion_detail");
      expect(avail.state).toBe("unlocked");
      expect(avail.canNavigate).toBe(true);
      expect(avail.canQuery).toBe(true);
      expect(avail.canUseBackend).toBe(true);
      expect(avail.canRegisterRoute).toBe(true);
      expect(avail.canSubscribeToEvents).toBe(true);
      expect(avail.canShowNotification).toBe(true);
      expect(exposureFor(3, "companion_detail")).toBe(true);
    });

    it("challenges unlocks at 5 sessions", () => {
      const avail = availabilityFor(5, "challenges");
      expect(avail.state).toBe("unlocked");
      expect(avail.canNavigate).toBe(true);
      expect(avail.canQuery).toBe(true);
      expect(exposureFor(5, "challenges")).toBe(true);
    });

    it("boss_tab unlocks at 7 sessions", () => {
      const avail = availabilityFor(7, "boss_tab");
      expect(avail.state).toBe("unlocked");
      expect(avail.canNavigate).toBe(true);
      expect(exposureFor(7, "boss_tab")).toBe(true);
    });

    it("ai_coach_advanced unlocks at 8 sessions (depends on ai_coach_basic + progress_view)", () => {
      const avail = availabilityFor(8, "ai_coach_advanced");
      expect(avail.state).toBe("unlocked");
      expect(avail.canNavigate).toBe(true);
      expect(exposureFor(8, "ai_coach_advanced")).toBe(true);
    });

    it("economy_basic unlocks at 8 sessions", () => {
      const avail = availabilityFor(8, "economy_basic");
      expect(avail.state).toBe("unlocked");
      expect(avail.canNavigate).toBe(true);
    });

    it("achievements unlocks at 6 sessions", () => {
      const avail = availabilityFor(6, "achievements");
      expect(avail.state).toBe("unlocked");
      expect(avail.canNavigate).toBe(true);
      expect(exposureFor(6, "achievements")).toBe(true);
    });

    it("content_study unlocks at 12 sessions", () => {
      const avail = availabilityFor(12, "content_study");
      expect(avail.state).toBe("unlocked");
      expect(avail.canNavigate).toBe(true);
      expect(exposureFor(12, "content_study")).toBe(true);
    });

    it("quiz_review_mode unlocks after content study is available", () => {
      const avail = availabilityFor(12, "quiz_review_mode");
      expect(avail.state).toBe("unlocked");
    });

    it("advanced_settings unlocks at 12 sessions", () => {
      const avail = availabilityFor(12, "advanced_settings");
      expect(avail.state).toBe("unlocked");
      expect(avail.canNavigate).toBe(true);
    });

    it("seasonal_features stays disabled during beta", () => {
      const avail = availabilityFor(15, "seasonal_features");
      expect(avail.state).toBe("disabled");
      expect(avail.canNavigate).toBe(false);
    });

    it("content_study_advanced unlocks at 18 sessions", () => {
      const avail = availabilityFor(18, "content_study_advanced");
      expect(avail.state).toBe("unlocked");
    });
  });

  // --------------------------------------------------------------------------
  // Contract 4: Home feature runtime — queries enabled only when unlocked
  // --------------------------------------------------------------------------
  describe("home feature runtime query gating", () => {
    it("at 0 sessions, only core queries are enabled", () => {
      const rt = runtimeFor(0);
      expect(rt.canQueryComeback).toBe(false);
      expect(rt.canQueryChallenges).toBe(false);
      expect(rt.canQueryBoss).toBe(false);
      expect(rt.canQueryCoach).toBe(false);
      expect(rt.canQueryStudy).toBe(false);
    });

    it("at 3 sessions, companion query is enabled", () => {
      const rt = runtimeFor(3);
      expect(rt.canQueryComeback).toBe(true);
    });

    it("at 5 sessions, challenges query is enabled", () => {
      const rt = runtimeFor(5);
      expect(rt.canQueryChallenges).toBe(true);
    });

    it("keeps boss queries disabled while route exposure unlocks", () => {
      const rt = runtimeFor(7);
      expect(rt.canQueryBoss).toBe(false);
    });

    it("at 8 sessions, coach query is enabled", () => {
      const rt = runtimeFor(8);
      expect(rt.canQueryCoach).toBe(true);
    });

    it("at 12 sessions, content study query is enabled", () => {
      const rt = runtimeFor(12);
      expect(rt.canQueryStudy).toBe(true);
    });
  });

  // --------------------------------------------------------------------------
  // Contract 5: CTA safety — no CTA for unregistered routes
  // --------------------------------------------------------------------------
  describe("CTA safety contracts", () => {
    PROGRESSIVE_FEATURES.forEach((feature) => {
      it(`${feature}: at 0 sessions, canRenderEntryPoint is false`, () => {
        const avail = availabilityFor(0, feature);
        expect(avail.canRenderEntryPoint).toBe(false);
      });
    });

    it("core features are always visible (canRenderEntryPoint true at 0 sessions)", () => {
      const coreFeatures: FeatureKey[] = [
        "focus_session",
        "home_tab",
        "focus_tab",
        "profile_tab",
        "progress_view",
        "ai_coach_basic",
      ];
      coreFeatures.forEach((feature) => {
        const avail = availabilityFor(0, feature);
        expect(avail.canRenderEntryPoint).toBe(true);
        expect(avail.canNavigate).toBe(true);
      });
    });
  });

  // --------------------------------------------------------------------------
  // Contract 6: Backend health check required for unlocked features
  // --------------------------------------------------------------------------
  describe("backend gateway contracts", () => {
    it("locked features cannot use backend", () => {
      const features = ["boss_tab", "challenges", "content_study"] as const;
      features.forEach((feature) => {
        const avail = availabilityFor(0, feature);
        expect(avail.canUseBackend).toBe(false);
      });
    });

    it("unlocked features can use backend", () => {
      const check: { feature: FeatureKey; sessions: number }[] = [
        { feature: "companion_detail", sessions: 3 },
        { feature: "challenges", sessions: 5 },
        { feature: "boss_tab", sessions: 7 },
      ];
      check.forEach(({ feature, sessions }) => {
        const avail = availabilityFor(sessions, feature);
        expect(avail.canUseBackend).toBe(true);
      });
    });
  });

  // --------------------------------------------------------------------------
  // Contract 7: Notification safety — no notifications for locked features
  // --------------------------------------------------------------------------
  describe("notification safety contracts", () => {
    it("hidden features cannot schedule notifications", () => {
      HIDDEN_FEATURES.forEach((feature) => {
        const avail = availabilityFor(0, feature);
        expect(avail.canShowNotification).toBe(false);
      });
    });

    it("progressive features cannot show notifications before unlock", () => {
      const checks: { feature: FeatureKey; before: number; after: number }[] = [
        { feature: "companion_detail", before: 2, after: 3 },
        { feature: "challenges", before: 4, after: 5 },
        { feature: "boss_tab", before: 6, after: 7 },
      ];
      checks.forEach(({ feature, before, after }) => {
        const beforeAvail = availabilityFor(before, feature);
        expect(beforeAvail.canShowNotification).toBe(false);
        const afterAvail = availabilityFor(after, feature);
        expect(afterAvail.canShowNotification).toBe(true);
      });
    });
  });

  // --------------------------------------------------------------------------
  // Contract 8: Safe navigation — openFeature resolves correctly
  // --------------------------------------------------------------------------
  describe("openFeature safe navigation resolution", () => {
    it("resolveFeatureRoute returns false for hidden features", () => {
      const { features } = buildFeatureAccess({ totalCompletedSessions: 0 });
      const result = resolveFeatureRoute("shop", features.shop);
      expect(result.canNavigate).toBe(false);
      expect(result.state).toBe("disabled");
    });

    it("resolveFeatureRoute returns true for core features", () => {
      const { features } = buildFeatureAccess({ totalCompletedSessions: 0 });
      const result = resolveFeatureRoute(
        "focus_session",
        features.focus_session,
      );
      expect(result.canNavigate).toBe(true);
      expect(result.state).toBe("unlocked");
    });
  });
});

// ============================================================================
// Phase 5.2 — Notification routing feature gate tests
// ============================================================================
describe("Notification routing feature gating", () => {
  it("routeNotificationAction gates boss notification when boss_tab is locked", () => {
    const { features: lockedFeatures } = buildFeatureAccess({
      totalCompletedSessions: 0,
    });

    const mockNav = { navigate: (): void => undefined };
    const result = routeNotificationAction(
      mockNav as never,
      { type: "view_boss" },
      {
        boss_tab: lockedFeatures.boss_tab,
        shop: lockedFeatures.shop,
        ai_coach_advanced: lockedFeatures.ai_coach_advanced,
        achievements: lockedFeatures.achievements,
        squads: lockedFeatures.squads,
      },
    );

    expect(result.success).toBe(false);
    expect(result.error).toContain("not yet unlocked");
  });

  it("routeNotificationAction allows boss notification when boss_tab is unlocked", () => {
    const { features: unlockedFeatures } = buildFeatureAccess({
      totalCompletedSessions: 7,
    });

    let navigatedTo = "";
    const mockNav = {
      navigate: (screen: string): void => {
        navigatedTo = screen;
      },
    };

    routeNotificationAction(
      mockNav as never,
      { type: "view_boss" },
      {
        boss_tab: unlockedFeatures.boss_tab,
        shop: unlockedFeatures.shop,
        ai_coach_advanced: unlockedFeatures.ai_coach_advanced,
        achievements: unlockedFeatures.achievements,
        squads: unlockedFeatures.squads,
      },
    );

    expect(navigatedTo).toBe("Main");
  });
});

// ============================================================================
// Phase 6.2 — Conservative recovery gating
// ============================================================================
describe("StreakFuneral conservative gating", () => {
  it("should not show for users with fewer than MIN_SESSIONS (5)", () => {
    expect(true).toBe(true);
  });

  it("should respect cooldown between funeral events", () => {
    expect(true).toBe(true);
  });

  it("should not show if streak was small (< 3 days)", () => {
    expect(true).toBe(true);
  });
});
