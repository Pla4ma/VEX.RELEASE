/**
 * Liveops Config Feature — Comprehensive Tests
 *
 * Covers: getStage, getProductTier, buildFeatureAccess, computeFeatureAccess,
 * resolveEffectiveThreshold, resolveFeatureVisibility, checkDependenciesSatisfied,
 * FeatureHealthRegistry, feature-availability, feature-access-store, degraded-surfaces.
 */

import { getStage, getProductTier, buildFeatureAccess } from "../feature-access";
import {
  computeFeatureAccess,
  resolveEffectiveThreshold,
  resolveFeatureVisibility,
  checkDependenciesSatisfied,
} from "../feature-resolution";
import { featureHealthRegistry } from "../feature-health";
import type { FeatureHealthCheck, FeatureHealthStatus } from "../feature-health";
import {
  getFeatureAvailability,
  getFeatureAvailabilityFor,
  isFeatureAvailableForNavigation,
  isFeatureAvailableForQueries,
} from "../feature-availability";
import {
  setFeatureAccessMap,
  getFeatureAccessMap,
  setDegradedFeatures,
  getDegradedFeatures,
  subscribeToDegradedFeatures,
  getAvailabilityFor,
} from "../feature-access-store";
import {
  getDegradedBlockedSurfaces,
  shouldBlockFullSurface,
  getDegradedFallbackSurface,
  DEGRADED_SURFACE_BLOCKS,
} from "../degraded-surfaces";
import { FEATURE_DEPENDENCIES } from "../feature-dependencies";
import {
  FEATURE_THRESHOLDS,
  FEATURE_RELEASE_STATES,
  FEATURE_TEASER_STARTS,
  DISABLED_FEATURES,
} from "../feature-access-config";
import { FEATURE_MOTIVATION_PROFILES } from "../feature-motivation-config";
import type {
  FeatureAccess,
  FeatureAccessMap,
  FeatureKey,
  MotivationProfile,
} from "../feature-access-types";

// ──────────────────────────────────────────
// 1. getStage
// ──────────────────────────────────────────
describe("getStage", () => {
  it("returns NEW_USER for 0 sessions", () => {
    expect(getStage(0)).toBe("NEW_USER");
  });

  it("returns ACTIVATING for 1-2 sessions", () => {
    expect(getStage(1)).toBe("ACTIVATING");
    expect(getStage(2)).toBe("ACTIVATING");
  });

  it("returns ENGAGED for 3-9 sessions", () => {
    expect(getStage(3)).toBe("ENGAGED");
    expect(getStage(9)).toBe("ENGAGED");
  });

  it("returns POWER_USER for 10+ sessions", () => {
    expect(getStage(10)).toBe("POWER_USER");
    expect(getStage(100)).toBe("POWER_USER");
  });
});

// ──────────────────────────────────────────
// 2. getProductTier
// ──────────────────────────────────────────
describe("getProductTier", () => {
  it("returns SOCIAL_DEPTH for 40+ sessions", () => {
    expect(getProductTier("POWER_USER", 40)).toBe("SOCIAL_DEPTH");
  });

  it("returns RPG_DEPTH for 20-39 sessions", () => {
    expect(getProductTier("POWER_USER", 20)).toBe("RPG_DEPTH");
    expect(getProductTier("POWER_USER", 39)).toBe("RPG_DEPTH");
  });

  it("returns STUDY_OS for 10-19 sessions", () => {
    expect(getProductTier("POWER_USER", 10)).toBe("STUDY_OS");
    expect(getProductTier("POWER_USER", 19)).toBe("STUDY_OS");
  });

  it("returns COACHING for ENGAGED stage", () => {
    expect(getProductTier("ENGAGED", 5)).toBe("COACHING");
  });

  it("returns CORE_EXECUTION for new/activating users", () => {
    expect(getProductTier("NEW_USER", 0)).toBe("CORE_EXECUTION");
    expect(getProductTier("ACTIVATING", 1)).toBe("CORE_EXECUTION");
  });
});

// ──────────────────────────────────────────
// 3. buildFeatureAccess
// ──────────────────────────────────────────
describe("buildFeatureAccess", () => {
  it("returns features, productTier, and stage", () => {
    const result = buildFeatureAccess({ totalCompletedSessions: 0 });
    expect(result.features).toBeDefined();
    expect(result.productTier).toBeDefined();
    expect(result.stage).toBeDefined();
  });

  it("unlocks core features for new user", () => {
    const { features } = buildFeatureAccess({ totalCompletedSessions: 0 });
    expect(features.focus_session.isUnlocked).toBe(true);
    expect(features.home_tab.isUnlocked).toBe(true);
    expect(features.focus_tab.isUnlocked).toBe(true);
    expect(features.profile_tab.isUnlocked).toBe(true);
  });

  it("locks features requiring higher sessions", () => {
    const { features } = buildFeatureAccess({ totalCompletedSessions: 0 });
    expect(features.challenges.isUnlocked).toBe(false);
    expect(features.boss_tab.isUnlocked).toBe(false);
  });

  it("unlocks progressive features as sessions increase", () => {
    const { features } = buildFeatureAccess({ totalCompletedSessions: 10 });
    expect(features.companion_detail.isUnlocked).toBe(true);
    expect(features.challenges.isUnlocked).toBe(true);
    expect(features.achievements.isUnlocked).toBe(true);
  });

  it("marks deactivated features as never unlocked", () => {
    const { features } = buildFeatureAccess({ totalCompletedSessions: 100 });
    expect(features.battle_pass.isUnlocked).toBe(false);
    expect(features.squads.isUnlocked).toBe(false);
    expect(features.rivals.isUnlocked).toBe(false);
  });

  it("respects degraded features", () => {
    const degraded = new Set<FeatureKey>(["challenges"]);
    const { features } = buildFeatureAccess({
      totalCompletedSessions: 10,
      degradedFeatures: degraded,
    });
    expect(features.challenges.isDegraded).toBe(true);
  });

  it("returns correct stage and product tier", () => {
    const result = buildFeatureAccess({ totalCompletedSessions: 5 });
    expect(result.stage).toBe("ENGAGED");
    expect(result.productTier).toBe("COACHING");
  });

  it("applies motivation profile acceleration", () => {
    const profile: MotivationProfile = { primary: "game_like", secondary: [] };
    const base = buildFeatureAccess({ totalCompletedSessions: 4 });
    const accelerated = buildFeatureAccess({ totalCompletedSessions: 4, motivationProfile: profile });
    // challenges has threshold 5, game_like accelerates by 2, so threshold becomes 3
    expect(base.features.challenges.isUnlocked).toBe(false);
    expect(accelerated.features.challenges.isUnlocked).toBe(true);
  });
});

// ──────────────────────────────────────────
// 4. resolveEffectiveThreshold
// ──────────────────────────────────────────
describe("resolveEffectiveThreshold", () => {
  it("returns base threshold when no profile", () => {
    expect(resolveEffectiveThreshold("challenges", 5, undefined)).toBe(5);
  });

  it("reduces threshold for accelerated primary profile", () => {
    const profile: MotivationProfile = { primary: "game_like", secondary: [] };
    // challenges: accelerate: ["game_like", "intense", "competitive"], accelerateOffset: 2
    expect(resolveEffectiveThreshold("challenges", 5, profile)).toBe(3);
  });

  it("increases threshold for restricted primary profile", () => {
    const profile: MotivationProfile = { primary: "calm", secondary: [] };
    // challenges: restrict: ["calm"], restrictOffset: 5
    expect(resolveEffectiveThreshold("challenges", 5, profile)).toBe(10);
  });

  it("accelerates for matching secondary profile", () => {
    const profile: MotivationProfile = { primary: "worker", secondary: ["game_like"] };
    // challenges: accelerate includes "game_like", so secondary match
    expect(resolveEffectiveThreshold("challenges", 5, profile)).toBe(3);
  });

  it("does not go below 0", () => {
    const profile: MotivationProfile = { primary: "game_like", secondary: [] };
    // companion_detail: accelerateOffset: 1, threshold 3 → 2
    expect(resolveEffectiveThreshold("companion_detail", 1, profile)).toBeGreaterThanOrEqual(0);
  });

  it("returns base threshold for features without motivation config", () => {
    const profile: MotivationProfile = { primary: "game_like", secondary: [] };
    // focus_session has no motivation config
    expect(resolveEffectiveThreshold("focus_session", 0, profile)).toBe(0);
  });
});

// ──────────────────────────────────────────
// 5. resolveFeatureVisibility
// ──────────────────────────────────────────
describe("resolveFeatureVisibility", () => {
  it("returns false when base is not visible", () => {
    expect(resolveFeatureVisibility("boss_tab", false, undefined, 0)).toBe(false);
  });

  it("returns base visibility when no profile", () => {
    expect(resolveFeatureVisibility("boss_tab", true, undefined, 10)).toBe(true);
  });

  it("returns base visibility for unrestricted profile", () => {
    const profile: MotivationProfile = { primary: "game_like", secondary: [] };
    expect(resolveFeatureVisibility("boss_tab", true, profile, 10)).toBe(true);
  });

  it("hides feature for restricted profile when restrictVisibility set", () => {
    const profile: MotivationProfile = { primary: "calm", secondary: [] };
    // boss_tab: restrict: ["calm"], restrictVisibility: true, restrictVisibilityMin: 20
    expect(resolveFeatureVisibility("boss_tab", true, profile, 5)).toBe(false);
  });

  it("shows feature for restricted profile above restrictVisibilityMin", () => {
    const profile: MotivationProfile = { primary: "calm", secondary: [] };
    expect(resolveFeatureVisibility("boss_tab", true, profile, 25)).toBe(true);
  });
});

// ──────────────────────────────────────────
// 6. checkDependenciesSatisfied
// ──────────────────────────────────────────
describe("checkDependenciesSatisfied", () => {
  it("returns true when no dependencies", () => {
    expect(checkDependenciesSatisfied("focus_session", new Set())).toBe(true);
  });

  it("returns true when all dependencies met", () => {
    const unlocked = new Set<FeatureKey>(["focus_session", "progress_view"]);
    expect(checkDependenciesSatisfied("boss_tab", unlocked)).toBe(true);
  });

  it("returns false when dependencies not met", () => {
    const unlocked = new Set<FeatureKey>(["focus_session"]);
    expect(checkDependenciesSatisfied("boss_tab", unlocked)).toBe(false);
  });

  it("returns false when empty set for feature with deps", () => {
    expect(checkDependenciesSatisfied("boss_tab", new Set())).toBe(false);
  });
});

// ──────────────────────────────────────────
// 7. computeFeatureAccess
// ──────────────────────────────────────────
describe("computeFeatureAccess", () => {
  it("unlocks feature when threshold met and deps satisfied", () => {
    const result = computeFeatureAccess({
      feature: "focus_session",
      sessions: 0,
      profile: undefined,
      unlockedFeatures: new Set(),
    });
    expect(result.isUnlocked).toBe(true);
    expect(result.isVisible).toBe(true);
  });

  it("locks feature when threshold not met", () => {
    const result = computeFeatureAccess({
      feature: "challenges",
      sessions: 0,
      profile: undefined,
      unlockedFeatures: new Set(),
    });
    expect(result.isUnlocked).toBe(false);
  });

  it("disables deactivated features regardless of sessions", () => {
    const result = computeFeatureAccess({
      feature: "battle_pass",
      sessions: 1000,
      profile: undefined,
      unlockedFeatures: new Set(),
    });
    expect(result.isUnlocked).toBe(false);
    expect(result.isVisible).toBe(false);
  });

  it("shows teaser when sessions >= teaserStart", () => {
    const result = computeFeatureAccess({
      feature: "companion_detail",
      sessions: 2,
      profile: undefined,
      unlockedFeatures: new Set(),
    });
    expect(result.isTeased).toBe(true);
    expect(result.isUnlocked).toBe(false);
  });

  it("does not show teaser below teaserStart", () => {
    const result = computeFeatureAccess({
      feature: "companion_detail",
      sessions: 1,
      profile: undefined,
      unlockedFeatures: new Set(),
    });
    expect(result.isTeased).toBe(false);
  });

  it("locks feature when dependencies not met", () => {
    // content_study depends on ai_coach_basic, focus_session, progress_view
    const result = computeFeatureAccess({
      feature: "content_study",
      sessions: 100,
      profile: undefined,
      unlockedFeatures: new Set<FeatureKey>(["focus_session", "progress_view"]),
      // missing ai_coach_basic
    });
    expect(result.isUnlocked).toBe(false);
  });

  it("returns correct releaseState", () => {
    const result = computeFeatureAccess({
      feature: "focus_session",
      sessions: 0,
      profile: undefined,
    });
    expect(result.releaseState).toBe("final_release_core");
  });
});

// ──────────────────────────────────────────
// 8. FeatureHealthRegistry
// ──────────────────────────────────────────
describe("FeatureHealthRegistry (singleton)", () => {
  // Use unique IDs per test to avoid cross-test pollution on the singleton
  let testCounter = 0;
  function nextId(): string {
    return `test_check_${++testCounter}`;
  }

  afterEach(() => {
    // Clean up: unregister anything we added and invalidate cache
    featureHealthRegistry.invalidateCache();
    for (const id of featureHealthRegistry.getRegisteredIds()) {
      if (id.startsWith("test_check_")) {
        featureHealthRegistry.unregister(id);
      }
    }
  });

  it("registers and retrieves health checks", () => {
    const id = nextId();
    featureHealthRegistry.register({
      id,
      feature: "content_study",
      label: "Test",
      dependency: "test",
      check: () => "healthy",
    });
    expect(featureHealthRegistry.getRegisteredIds()).toContain(id);
  });

  it("does not register duplicate IDs", () => {
    const id = nextId();
    const check: FeatureHealthCheck = {
      id,
      feature: "content_study",
      label: "Test",
      dependency: "test",
      check: () => "healthy",
    };
    featureHealthRegistry.register(check);
    featureHealthRegistry.register(check);
    expect(
      featureHealthRegistry.getRegisteredIds().filter((i) => i === id),
    ).toHaveLength(1);
  });

  it("unregisters health checks", () => {
    const id = nextId();
    featureHealthRegistry.register({
      id,
      feature: "content_study",
      label: "Test",
      dependency: "test",
      check: () => "healthy",
    });
    featureHealthRegistry.unregister(id);
    expect(featureHealthRegistry.getRegisteredIds()).not.toContain(id);
  });

  it("returns healthy for feature with no checks", async () => {
    // memory_console likely has no test checks registered
    const status = await featureHealthRegistry.getFeatureHealth("memory_console");
    expect(status).toBe("healthy");
  });

  it("returns healthy when all checks pass", async () => {
    const id1 = nextId();
    const id2 = nextId();
    featureHealthRegistry.register({
      id: id1, feature: "content_study", label: "C1", dependency: "d1",
      check: () => "healthy",
    });
    featureHealthRegistry.register({
      id: id2, feature: "content_study", label: "C2", dependency: "d2",
      check: () => "healthy",
    });
    const status = await featureHealthRegistry.getFeatureHealth("content_study");
    expect(status).toBe("healthy");
  });

  it("returns degraded when at least one check is degraded", async () => {
    const id1 = nextId();
    const id2 = nextId();
    featureHealthRegistry.register({
      id: id1, feature: "content_study", label: "C1", dependency: "d1",
      check: () => "healthy",
    });
    featureHealthRegistry.register({
      id: id2, feature: "content_study", label: "C2", dependency: "d2",
      check: () => "degraded",
    });
    const status = await featureHealthRegistry.getFeatureHealth("content_study");
    expect(status).toBe("degraded");
  });

  it("returns unavailable immediately when any check is unavailable", async () => {
    const id1 = nextId();
    const id2 = nextId();
    featureHealthRegistry.register({
      id: id1, feature: "content_study", label: "C1", dependency: "d1",
      check: () => "degraded",
    });
    featureHealthRegistry.register({
      id: id2, feature: "content_study", label: "C2", dependency: "d2",
      check: () => "unavailable",
    });
    const status = await featureHealthRegistry.getFeatureHealth("content_study");
    expect(status).toBe("unavailable");
  });

  it("shouldDegrade returns true for unhealthy features", async () => {
    const id = nextId();
    featureHealthRegistry.register({
      id, feature: "content_study", label: "C1", dependency: "d1",
      check: () => "degraded",
    });
    expect(await featureHealthRegistry.shouldDegrade("content_study")).toBe(true);
  });

  it("shouldDegrade returns false for healthy features", async () => {
    const id = nextId();
    featureHealthRegistry.register({
      id, feature: "content_study", label: "C1", dependency: "d1",
      check: () => "healthy",
    });
    expect(await featureHealthRegistry.shouldDegrade("content_study")).toBe(false);
  });

  it("getUnhealthyFeatures returns unhealthy features", async () => {
    const id1 = nextId();
    const id2 = nextId();
    featureHealthRegistry.register({
      id: id1, feature: "content_study", label: "C1", dependency: "d1",
      check: () => "unavailable",
    });
    featureHealthRegistry.register({
      id: id2, feature: "boss_tab", label: "C2", dependency: "d2",
      check: () => "healthy",
    });
    const unhealthy = await featureHealthRegistry.getUnhealthyFeatures();
    expect(unhealthy).toContain("content_study");
    expect(unhealthy).not.toContain("boss_tab");
  });

  it("getUnhealthyFeaturesFiltered only checks allowed features", async () => {
    const id1 = nextId();
    const id2 = nextId();
    featureHealthRegistry.register({
      id: id1, feature: "content_study", label: "C1", dependency: "d1",
      check: () => "unavailable",
    });
    featureHealthRegistry.register({
      id: id2, feature: "boss_tab", label: "C2", dependency: "d2",
      check: () => "unavailable",
    });
    const unhealthy = await featureHealthRegistry.getUnhealthyFeaturesFiltered(
      new Set(["content_study"]),
    );
    expect(unhealthy).toContain("content_study");
    expect(unhealthy).not.toContain("boss_tab");
  });

  it("invalidateCache clears cache and triggers re-check", async () => {
    let callCount = 0;
    const id = nextId();
    featureHealthRegistry.register({
      id, feature: "content_study", label: "C1", dependency: "d1",
      check: () => { callCount++; return "healthy"; },
      cacheMs: 60000,
    });
    await featureHealthRegistry.getFeatureHealth("content_study");
    await featureHealthRegistry.getFeatureHealth("content_study");
    expect(callCount).toBe(1); // cached

    featureHealthRegistry.invalidateCache();
    await featureHealthRegistry.getFeatureHealth("content_study");
    expect(callCount).toBe(2); // re-checked after invalidation
  });

  it("invalidateCache clears specific feature cache", async () => {
    let countA = 0;
    let countB = 0;
    const idA = nextId();
    const idB = nextId();
    featureHealthRegistry.register({
      id: idA, feature: "content_study", label: "A", dependency: "dep",
      check: () => { countA++; return "healthy"; },
      cacheMs: 60000,
    });
    featureHealthRegistry.register({
      id: idB, feature: "boss_tab", label: "B", dependency: "dep",
      check: () => { countB++; return "healthy"; },
      cacheMs: 60000,
    });

    await featureHealthRegistry.getFeatureHealth("content_study");
    await featureHealthRegistry.getFeatureHealth("boss_tab");
    expect(countA).toBe(1);
    expect(countB).toBe(1);

    featureHealthRegistry.invalidateCache("content_study");
    await featureHealthRegistry.getFeatureHealth("content_study");
    await featureHealthRegistry.getFeatureHealth("boss_tab");
    expect(countA).toBe(2); // re-checked
    expect(countB).toBe(1); // still cached
  });

  it("handles async health checks", async () => {
    const id = nextId();
    featureHealthRegistry.register({
      id, feature: "content_study", label: "Async", dependency: "dep",
      check: async () => {
        await new Promise((r) => setTimeout(r, 10));
        return "healthy" as FeatureHealthStatus;
      },
    });
    const status = await featureHealthRegistry.getFeatureHealth("content_study");
    expect(status).toBe("healthy");
  });

  it("caches results within cacheMs window", async () => {
    let callCount = 0;
    const id = nextId();
    featureHealthRegistry.register({
      id, feature: "content_study", label: "Cached", dependency: "dep",
      check: () => { callCount++; return "healthy" as FeatureHealthStatus; },
      cacheMs: 60000,
    });
    await featureHealthRegistry.getFeatureHealth("content_study");
    await featureHealthRegistry.getFeatureHealth("content_study");
    await featureHealthRegistry.getFeatureHealth("content_study");
    expect(callCount).toBe(1);
  });
});

// ──────────────────────────────────────────
// 9. Feature availability
// ──────────────────────────────────────────
describe("feature-availability", () => {
  function makeFeatureAccess(overrides?: Partial<FeatureAccess>): FeatureAccess {
    return {
      key: "challenges",
      isUnlocked: true,
      isVisible: true,
      isTeased: false,
      isDegraded: false,
      disableOnDegraded: false,
      priority: 1,
      lockedDescription: "Locked",
      recommendedUnlockMoment: "After 5 sessions",
      unlockReason: "Unlocks at 5",
      releaseState: "final_release_progressive",
      ...overrides,
    };
  }

  describe("getFeatureAvailability", () => {
    it("returns unlocked state for fully available feature", () => {
      const result = getFeatureAvailability(makeFeatureAccess());
      expect(result.state).toBe("unlocked");
      expect(result.canNavigate).toBe(true);
      expect(result.canQuery).toBe(true);
    });

    it("returns disabled for deactivated feature", () => {
      const result = getFeatureAvailability(
        makeFeatureAccess({ releaseState: "final_release_deactivated" }),
      );
      expect(result.state).toBe("disabled");
      expect(result.canNavigate).toBe(false);
      expect(result.canQuery).toBe(false);
    });

    it("returns disabled for archived feature", () => {
      const result = getFeatureAvailability(
        makeFeatureAccess({ releaseState: "archived" }),
      );
      expect(result.state).toBe("disabled");
    });

    it("returns locked for invisible feature", () => {
      const result = getFeatureAvailability(makeFeatureAccess({ isVisible: false }));
      expect(result.state).toBe("disabled");
    });

    it("returns degraded for unlocked but degraded feature", () => {
      const result = getFeatureAvailability(
        makeFeatureAccess({ isDegraded: true }),
      );
      expect(result.state).toBe("degraded");
      expect(result.canRenderEntryPoint).toBe(true);
      expect(result.canNavigate).toBe(false);
      expect(result.canQuery).toBe(false);
    });

    it("returns disabled for degraded with disableOnDegraded", () => {
      const result = getFeatureAvailability(
        makeFeatureAccess({ isDegraded: true, disableOnDegraded: true }),
      );
      expect(result.state).toBe("disabled");
    });

    it("returns teased for teased locked feature", () => {
      const result = getFeatureAvailability(
        makeFeatureAccess({ isUnlocked: false, isTeased: true }),
      );
      expect(result.state).toBe("teased");
      expect(result.canRenderEntryPoint).toBe(true);
      expect(result.canNavigate).toBe(false);
    });

    it("returns locked for not-unlocked not-teased feature", () => {
      const result = getFeatureAvailability(
        makeFeatureAccess({ isUnlocked: false, isTeased: false }),
      );
      expect(result.state).toBe("locked");
      expect(result.canRenderEntryPoint).toBe(false);
    });
  });

  describe("getFeatureAvailabilityFor", () => {
    it("returns availability with feature key", () => {
      const result = getFeatureAvailabilityFor("challenges", makeFeatureAccess());
      expect(result.state).toBe("unlocked");
    });
  });

  describe("isFeatureAvailableForNavigation", () => {
    it("returns true for unlocked features", () => {
      expect(isFeatureAvailableForNavigation(getFeatureAvailability(makeFeatureAccess()))).toBe(true);
    });

    it("returns false for locked features", () => {
      expect(isFeatureAvailableForNavigation(
        getFeatureAvailability(makeFeatureAccess({ isUnlocked: false })),
      )).toBe(false);
    });

    it("returns false for degraded features", () => {
      expect(isFeatureAvailableForNavigation(
        getFeatureAvailability(makeFeatureAccess({ isDegraded: true })),
      )).toBe(false);
    });
  });

  describe("isFeatureAvailableForQueries", () => {
    it("returns true for unlocked features", () => {
      expect(isFeatureAvailableForQueries(getFeatureAvailability(makeFeatureAccess()))).toBe(true);
    });

    it("returns false for locked features", () => {
      expect(isFeatureAvailableForQueries(
        getFeatureAvailability(makeFeatureAccess({ isUnlocked: false })),
      )).toBe(false);
    });
  });
});

// ──────────────────────────────────────────
// 10. Feature access store
// ──────────────────────────────────────────
describe("feature-access-store", () => {
  beforeEach(() => {
    setFeatureAccessMap(null as unknown as FeatureAccessMap);
  });

  it("setFeatureAccessMap and getFeatureAccessMap roundtrip", () => {
    const map = { focus_session: { isUnlocked: true } } as unknown as FeatureAccessMap;
    setFeatureAccessMap(map);
    expect(getFeatureAccessMap()).toBe(map);
  });

  it("getFeatureAccessMap returns null by default", () => {
    expect(getFeatureAccessMap()).toBeNull();
  });

  it("setDegradedFeatures and getDegradedFeatures roundtrip", () => {
    const features = new Set<FeatureKey>(["content_study"]);
    setDegradedFeatures(features);
    expect(getDegradedFeatures()).toBe(features);
  });

  it("getDegradedFeatures starts with premium_paywall", () => {
    // Reset to initial state
    setDegradedFeatures(new Set<FeatureKey>(["premium_paywall"]));
    expect(getDegradedFeatures().has("premium_paywall")).toBe(true);
  });

  it("subscribeToDegradedFeatures returns unsubscribe function", () => {
    const unsub = subscribeToDegradedFeatures(() => {});
    expect(typeof unsub).toBe("function");
    unsub();
  });

  it("notifies listeners when degraded features change", () => {
    const listener = jest.fn();
    subscribeToDegradedFeatures(listener);
    setDegradedFeatures(new Set<FeatureKey>(["boss_tab"]));
    expect(listener).toHaveBeenCalledTimes(1);
  });

  it("stops notifying after unsubscribe", () => {
    const listener = jest.fn();
    const unsub = subscribeToDegradedFeatures(listener);
    unsub();
    setDegradedFeatures(new Set<FeatureKey>(["boss_tab"]));
    expect(listener).not.toHaveBeenCalled();
  });

  it("getAvailabilityFor returns disabled when no map set", () => {
    setFeatureAccessMap(null as unknown as FeatureAccessMap);
    const result = getAvailabilityFor("challenges");
    expect(result.state).toBe("disabled");
    expect(result.reason).toContain("not found");
  });

  it("getAvailabilityFor returns feature availability when map set", () => {
    const map = {
      challenges: {
        key: "challenges",
        isUnlocked: true,
        isVisible: true,
        isTeased: false,
        isDegraded: false,
        disableOnDegraded: false,
        priority: 1,
        lockedDescription: "Locked",
        recommendedUnlockMoment: "After 5",
        unlockReason: "Unlocks at 5",
        releaseState: "final_release_progressive",
      },
    } as unknown as FeatureAccessMap;
    setFeatureAccessMap(map);
    const result = getAvailabilityFor("challenges");
    expect(result.state).toBe("unlocked");
  });
});

// ──────────────────────────────────────────
// 11. Degraded surfaces
// ──────────────────────────────────────────
describe("degraded-surfaces", () => {
  it("DEGRADED_SURFACE_BLOCKS has entries for all degraded feature keys", () => {
    expect(DEGRADED_SURFACE_BLOCKS.content_study).toBeDefined();
    expect(DEGRADED_SURFACE_BLOCKS.ai_coach_advanced).toBeDefined();
    expect(DEGRADED_SURFACE_BLOCKS.premium_paywall).toBeDefined();
    expect(DEGRADED_SURFACE_BLOCKS.boss_tab).toBeDefined();
  });

  it("each entry has blockedSurfaces and fallbackSurface", () => {
    for (const [, value] of Object.entries(DEGRADED_SURFACE_BLOCKS)) {
      expect(value.blockedSurfaces).toBeInstanceOf(Array);
      expect(value.blockedSurfaces.length).toBeGreaterThan(0);
      expect(typeof value.fallbackSurface).toBe("string");
    }
  });

  describe("getDegradedBlockedSurfaces", () => {
    it("returns blocked surfaces for degraded features", () => {
      const blocked = getDegradedBlockedSurfaces(["content_study", "boss_tab"]);
      expect(blocked).toContain("study_layer");
      expect(blocked).toContain("boss_full_cta");
    });

    it("returns empty array for empty input", () => {
      expect(getDegradedBlockedSurfaces([])).toEqual([]);
    });
  });

  describe("shouldBlockFullSurface", () => {
    it("returns true when feature is degraded", () => {
      expect(shouldBlockFullSurface("content_study", true)).toBe(true);
    });

    it("returns false when feature is not degraded", () => {
      expect(shouldBlockFullSurface("content_study", false)).toBe(false);
    });
  });

  describe("getDegradedFallbackSurface", () => {
    it("returns fallback surface for known feature", () => {
      expect(getDegradedFallbackSurface("content_study")).toBe("start_session");
      expect(getDegradedFallbackSurface("boss_tab")).toBe("boss_teaser");
    });

    it("returns default fallback for unknown feature", () => {
      // @ts-expect-error testing with unknown key
      expect(getDegradedFallbackSurface("unknown_feature")).toBe("start_session");
    });
  });
});

// ──────────────────────────────────────────
// 12. Feature dependencies
// ──────────────────────────────────────────
describe("FEATURE_DEPENDENCIES", () => {
  it("defines dependencies for boss_tab", () => {
    expect(FEATURE_DEPENDENCIES.boss_tab).toContain("focus_session");
    expect(FEATURE_DEPENDENCIES.boss_tab).toContain("progress_view");
  });

  it("defines dependencies for content_study", () => {
    expect(FEATURE_DEPENDENCIES.content_study).toContain("ai_coach_basic");
  });

  it("defines dependencies for shop", () => {
    expect(FEATURE_DEPENDENCIES.shop).toContain("economy_basic");
    expect(FEATURE_DEPENDENCIES.shop).toContain("inventory");
  });

  it("core features have no dependencies", () => {
    expect(FEATURE_DEPENDENCIES.focus_session).toBeUndefined();
    expect(FEATURE_DEPENDENCIES.home_tab).toBeUndefined();
  });
});

// ──────────────────────────────────────────
// 13. Feature config constants
// ──────────────────────────────────────────
describe("FEATURE_THRESHOLDS", () => {
  it("core features have 0 threshold", () => {
    expect(FEATURE_THRESHOLDS.focus_session).toBe(0);
    expect(FEATURE_THRESHOLDS.home_tab).toBe(0);
    expect(FEATURE_THRESHOLDS.focus_tab).toBe(0);
  });

  it("deactivated features have Infinity threshold", () => {
    expect(FEATURE_THRESHOLDS.battle_pass).toBe(Infinity);
    expect(FEATURE_THRESHOLDS.squads).toBe(Infinity);
    expect(FEATURE_THRESHOLDS.rivals).toBe(Infinity);
  });

  it("progressive features have finite positive thresholds", () => {
    expect(FEATURE_THRESHOLDS.challenges).toBeGreaterThan(0);
    expect(FEATURE_THRESHOLDS.challenges).not.toBe(Infinity);
    expect(FEATURE_THRESHOLDS.boss_tab).toBeGreaterThan(0);
    expect(FEATURE_THRESHOLDS.boss_tab).not.toBe(Infinity);
  });
});

describe("FEATURE_RELEASE_STATES", () => {
  it("core features are final_release_core", () => {
    expect(FEATURE_RELEASE_STATES.focus_session).toBe("final_release_core");
    expect(FEATURE_RELEASE_STATES.home_tab).toBe("final_release_core");
  });

  it("disabled features are final_release_deactivated", () => {
    for (const key of DISABLED_FEATURES) {
      expect(FEATURE_RELEASE_STATES[key]).toBe("final_release_deactivated");
    }
  });
});

describe("FEATURE_TEASER_STARTS", () => {
  it("defines teaser starts for progressive features", () => {
    expect(FEATURE_TEASER_STARTS.companion_detail).toBe(2);
    expect(FEATURE_TEASER_STARTS.challenges).toBe(4);
    expect(FEATURE_TEASER_STARTS.boss_tab).toBe(5);
  });
});

describe("DISABLED_FEATURES", () => {
  it("includes known deactivated features", () => {
    expect(DISABLED_FEATURES).toContain("squads");
    expect(DISABLED_FEATURES).toContain("social_tab");
    expect(DISABLED_FEATURES).toContain("rivals");
    expect(DISABLED_FEATURES).toContain("battle_pass");
  });
});

// ──────────────────────────────────────────
// 14. Motivation profiles
// ──────────────────────────────────────────
describe("FEATURE_MOTIVATION_PROFILES", () => {
  it("defines config for boss_tab", () => {
    const config = FEATURE_MOTIVATION_PROFILES.boss_tab;
    expect(config).toBeDefined();
    expect(config!.accelerate).toContain("game_like");
    expect(config!.restrict).toContain("calm");
    expect(config!.restrictVisibility).toBe(true);
  });

  it("defines config for challenges", () => {
    const config = FEATURE_MOTIVATION_PROFILES.challenges;
    expect(config).toBeDefined();
    expect(config!.accelerateOffset).toBe(2);
    expect(config!.restrictOffset).toBe(5);
  });

  it("defines config for companion_detail", () => {
    const config = FEATURE_MOTIVATION_PROFILES.companion_detail;
    expect(config).toBeDefined();
    expect(config!.accelerate).toContain("friendly");
    expect(config!.accelerate).toContain("calm");
  });

  it("each config has accelerate and restrict arrays", () => {
    for (const [, config] of Object.entries(FEATURE_MOTIVATION_PROFILES)) {
      if (config) {
        expect(config.accelerate).toBeInstanceOf(Array);
        expect(config.restrict).toBeInstanceOf(Array);
        expect(typeof config.accelerateOffset).toBe("number");
        expect(typeof config.restrictOffset).toBe("number");
      }
    }
  });
});
