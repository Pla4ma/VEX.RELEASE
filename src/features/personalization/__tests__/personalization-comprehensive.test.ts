import {
  resolveVexExperience,
  validatePersonalizationEvent,
  trackVexExperienceResolved,
  recordBehaviorSignal,
  getBehaviorSignals,
  clearBehaviorSignals,
  resolveUserBehaviorSignals,
} from "../index";
import {
  resolveUserStage,
  resolveHiddenSystems,
  resolveBoss,
  resolveBossIntensity,
  resolveCompletion,
  resolveCompanionIntensity,
  resolveHomeLayoutVariant,
  resolvePremiumMoment,
} from "../experience-resolvers";
import {
  resolveBehavior,
  resolveHome,
  resolvePremium,
} from "../experience-service-helpers";
import {
  countByType,
  countDistinctSurfaces,
  hasMinimumSignals,
  hasSurfacesDismissedMultipleTimes,
  hasSurfacesClickedMultipleTimes,
  DISMISS_THRESHOLD,
  CLICK_TO_REINFORCE_THRESHOLD,
} from "../behavior-resolver-helpers";
import { makeStats } from "./personalization.helpers";
import * as fixtures from "./test-fixtures";

jest.mock("@sentry/react-native", () => ({
  addBreadcrumb: jest.fn(),
  captureException: jest.fn(),
}));

jest.mock("../../../persistence/MMKVStorageAdapter", () => ({
  getMMKVStorageAdapter: () => ({
    getItem: jest.fn(() => null),
    setItem: jest.fn(),
    removeItem: jest.fn(),
  }),
}));

// Use fixtures.profile() for profiles (correctly derives related fields from motivation style)
// Use makeStats() for behavior stats

describe("personalization feature — comprehensive tests", () => {
  // ── resolveUserStage ──────────────────────────────────────
  describe("resolveUserStage", () => {
    it("returns 'new_user' for 0 sessions", () => {
      expect(resolveUserStage(makeStats({ totalCompletedSessions: 0 }))).toBe("new_user");
    });
    it("returns 'activating' for 1-2 sessions", () => {
      expect(resolveUserStage(makeStats({ totalCompletedSessions: 1 }))).toBe("activating");
      expect(resolveUserStage(makeStats({ totalCompletedSessions: 2 }))).toBe("activating");
    });
    it("returns 'engaged' for 3-9 sessions", () => {
      expect(resolveUserStage(makeStats({ totalCompletedSessions: 3 }))).toBe("engaged");
      expect(resolveUserStage(makeStats({ totalCompletedSessions: 9 }))).toBe("engaged");
    });
    it("returns 'power_user' for 10+ sessions", () => {
      expect(resolveUserStage(makeStats({ totalCompletedSessions: 10 }))).toBe("power_user");
      expect(resolveUserStage(makeStats({ totalCompletedSessions: 100 }))).toBe("power_user");
    });
  });

  // ── resolveHiddenSystems ──────────────────────────────────
  describe("resolveHiddenSystems", () => {
    it("always hides base gamification systems", () => {
      const result = resolveHiddenSystems(fixtures.profile("calm"), makeStats());
      expect(result.hiddenSystems).toContain("shop");
      expect(result.hiddenSystems).toContain("inventory");
      expect(result.hiddenSystems).toContain("battle_pass");
      expect(result.hiddenSystems).toContain("wagers");
    });
    it("hides advanced_economy and premium_currency for calm style", () => {
      const result = resolveHiddenSystems(fixtures.profile("calm"), makeStats());
      expect(result.hiddenSystems).toContain("advanced_economy");
      expect(result.hiddenSystems).toContain("premium_currency");
    });
    it("hides advanced_economy and premium_currency for study_focused style", () => {
      const result = resolveHiddenSystems(fixtures.profile("study_focused"), makeStats());
      expect(result.hiddenSystems).toContain("advanced_economy");
      expect(result.hiddenSystems).toContain("premium_currency");
    });
    it("bans boss_full_cta and game_hub surfaces for calm/study_focused", () => {
      const result = resolveHiddenSystems(fixtures.profile("calm"), makeStats());
      expect(result.bannedSurfaces).toContain("boss_full_cta");
      expect(result.bannedSurfaces).toContain("game_hub");
    });
    it("adds premium_currency to hiddenSystems for minimal gamification", () => {
      const result = resolveHiddenSystems(
        fixtures.profile("friendly", { gamificationIntensity: "minimal" }),
        makeStats(),
      );
      expect(result.hiddenSystems).toContain("premium_currency");
    });
    it("teases boss_tab when engagement is none but sessions > 5", () => {
      const result = resolveHiddenSystems(
        fixtures.profile("friendly"),
        makeStats({ bossChallengeEngagement: "none", totalCompletedSessions: 6 }),
      );
      expect(result.teasedSystems).toContain("boss_tab");
    });
    it("does not tease boss_tab when engagement is not none", () => {
      const result = resolveHiddenSystems(
        fixtures.profile("friendly"),
        makeStats({ bossChallengeEngagement: "low", totalCompletedSessions: 6 }),
      );
      expect(result.teasedSystems).not.toContain("boss_tab");
    });
  });

  // ── resolveBossIntensity ──────────────────────────────────
  describe("resolveBossIntensity", () => {
    it("returns 'subtle' when engagement is none", () => {
      expect(
        resolveBossIntensity(fixtures.profile("calm"), makeStats({ bossChallengeEngagement: "none" })),
      ).toBe("subtle");
    });
    it("returns 'game-like' for game_like motivation", () => {
      expect(
        resolveBossIntensity(
          fixtures.profile("game_like"),
          makeStats({ bossChallengeEngagement: "medium" }),
        ),
      ).toBe("game-like");
    });
    it("returns 'intense' for intense motivation", () => {
      expect(
        resolveBossIntensity(
          fixtures.profile("intense"),
          makeStats({ bossChallengeEngagement: "high" }),
        ),
      ).toBe("intense");
    });
    it("returns 'standard' as default", () => {
      expect(
        resolveBossIntensity(
          fixtures.profile("friendly"),
          makeStats({ bossChallengeEngagement: "medium" }),
        ),
      ).toBe("standard");
    });
  });

  // ── resolveBoss ───────────────────────────────────────────
  describe("resolveBoss", () => {
    it("is not visible when availability.boss is false", () => {
      const boss = resolveBoss({
        availability: { ...fixtures.available, boss: false },
        profile: fixtures.profile("game_like"),
        stats: makeStats({ totalCompletedSessions: 5, bossChallengeEngagement: "medium" }),
      });
      expect(boss.isVisible).toBe(false);
    });
    it("is not visible when sessions < 3", () => {
      const boss = resolveBoss({
        availability: fixtures.available,
        profile: fixtures.profile("game_like"),
        stats: makeStats({ totalCompletedSessions: 2, bossChallengeEngagement: "medium" }),
      });
      expect(boss.isVisible).toBe(false);
    });
    it("is not visible when engagement is none", () => {
      const boss = resolveBoss({
        availability: fixtures.available,
        profile: fixtures.profile("game_like"),
        stats: makeStats({ totalCompletedSessions: 5, bossChallengeEngagement: "none" }),
      });
      expect(boss.isVisible).toBe(false);
    });
    it("is visible when all conditions met", () => {
      const boss = resolveBoss({
        availability: fixtures.available,
        profile: fixtures.profile("game_like"),
        stats: makeStats({ totalCompletedSessions: 5, bossChallengeEngagement: "medium" }),
      });
      expect(boss.isVisible).toBe(true);
      expect(boss.progressSource).toBe("completed_focus_sessions");
    });
    it("hides homePlacement when not visible", () => {
      const boss = resolveBoss({
        availability: { ...fixtures.available, boss: false },
        profile: fixtures.profile("calm"),
        stats: makeStats(),
      });
      expect(boss.homePlacement).toBe("hidden");
    });
  });

  // ── resolveCompanionIntensity ─────────────────────────────
  describe("resolveCompanionIntensity", () => {
    it("returns 'active' for strong gamification", () => {
      expect(resolveCompanionIntensity(fixtures.profile("game_like"))).toBe("active");
    });
    it("returns 'present' for medium gamification", () => {
      expect(
        resolveCompanionIntensity(
          fixtures.profile("friendly", { gamificationIntensity: "medium" }),
        ),
      ).toBe("present");
    });
    it("returns 'subtle' for calm motivation", () => {
      expect(resolveCompanionIntensity(fixtures.profile("calm"))).toBe("subtle");
    });
  });

  // ── resolveHomeLayoutVariant ──────────────────────────────
  describe("resolveHomeLayoutVariant", () => {
    it("returns 'study_centered' for study goal", () => {
      expect(
        resolveHomeLayoutVariant(
          fixtures.profile("study_focused"),
          makeStats(),
        ),
      ).toBe("study_centered");
    });
    it("returns 'game_centered' for game_like motivation", () => {
      expect(
        resolveHomeLayoutVariant(fixtures.profile("game_like"), makeStats()),
      ).toBe("game_centered");
    });
    it("returns 'full_expanded' for 10+ sessions", () => {
      expect(
        resolveHomeLayoutVariant(
          fixtures.profile("friendly"),
          makeStats({ totalCompletedSessions: 10 }),
        ),
      ).toBe("full_expanded");
    });
    it("returns 'coach_first' for 3-9 sessions", () => {
      expect(
        resolveHomeLayoutVariant(
          fixtures.profile("friendly"),
          makeStats({ totalCompletedSessions: 5 }),
        ),
      ).toBe("coach_first");
    });
    it("returns 'compact_starter' for < 3 sessions", () => {
      expect(
        resolveHomeLayoutVariant(
          fixtures.profile("friendly"),
          makeStats({ totalCompletedSessions: 1 }),
        ),
      ).toBe("compact_starter");
    });
  });

  // ── resolvePremiumMoment ──────────────────────────────────
  describe("resolvePremiumMoment", () => {
    it("returns 'none' for < 5 sessions", () => {
      expect(
        resolvePremiumMoment(makeStats({ totalCompletedSessions: 3 })),
      ).toBe("none");
    });
    it("returns 'advanced_study' when user tried advanced_study", () => {
      expect(
        resolvePremiumMoment(
          makeStats({
            totalCompletedSessions: 10,
            premiumFeatureAttempts: ["advanced_study"],
          }),
        ),
      ).toBe("advanced_study");
    });
    it("returns 'weekly_intelligence' when tried weekly_intelligence", () => {
      expect(
        resolvePremiumMoment(
          makeStats({
            totalCompletedSessions: 10,
            premiumFeatureAttempts: ["weekly_intelligence"],
          }),
        ),
      ).toBe("weekly_intelligence");
    });
    it("returns 'session_value' for 10+ sessions with no specific attempt", () => {
      expect(
        resolvePremiumMoment(
          makeStats({ totalCompletedSessions: 10, premiumFeatureAttempts: ["unknown"] }),
        ),
      ).toBe("session_value");
    });
  });

  // ── resolveCompletion ─────────────────────────────────────
  describe("resolveCompletion", () => {
    it("includes study_progress when study available", () => {
      const result = resolveCompletion({
        availability: { ...fixtures.available, study: true },
        boss: { isVisible: false, intensity: "subtle" } as any,
        stats: makeStats(),
      });
      expect(result.sequence).toContain("study_progress");
    });
    it("includes boss_effect when boss is visible", () => {
      const result = resolveCompletion({
        availability: fixtures.available,
        boss: { isVisible: true, intensity: "standard" } as any,
        stats: makeStats(),
      });
      expect(result.sequence).toContain("boss_effect");
    });
    it("always includes core_saved and next_action", () => {
      const result = resolveCompletion({
        availability: { ...fixtures.available, study: false },
        boss: { isVisible: false, intensity: "subtle" } as any,
        stats: makeStats(),
      });
      expect(result.sequence).toContain("core_saved");
      expect(result.sequence).toContain("next_action");
    });
  });

  // ── resolveBehavior ───────────────────────────────────────
  describe("resolveBehavior", () => {
    it("returns needs_more_signal for < 3 completed sessions", () => {
      const result = resolveBehavior(
        fixtures.profile("calm"),
        makeStats({ completedSessionDurations: [25, 25] }),
      );
      expect(result.adaptations).toContain("needs_more_signal");
      expect(result.duration).toBe(25);
    });
    it("picks most frequent duration when enough sessions", () => {
      const result = resolveBehavior(
        fixtures.profile("calm"),
        makeStats({ completedSessionDurations: [25, 50, 50, 50] }),
      );
      expect(result.duration).toBe(50);
      expect(result.adaptations).toContain("duration_pattern");
    });
    it("includes time_of_day_pattern when mostSuccessfulTimeOfDay is set", () => {
      const result = resolveBehavior(
        fixtures.profile("calm"),
        makeStats({
          completedSessionDurations: [25, 25, 25],
          mostSuccessfulTimeOfDay: "morning",
        }),
      );
      expect(result.adaptations).toContain("time_of_day_pattern");
      expect(result.sessionSuggestion).toContain("morning");
    });
    it("includes abandonment_aware when abandonedSessionDurations exist", () => {
      const result = resolveBehavior(
        fixtures.profile("calm"),
        makeStats({
          completedSessionDurations: [25, 25, 25],
          abandonedSessionDurations: [15],
        }),
      );
      expect(result.adaptations).toContain("abandonment_aware");
    });
    it("includes study_heavy when studyUsageRatio >= 0.5", () => {
      const result = resolveBehavior(
        fixtures.profile("calm"),
        makeStats({
          completedSessionDurations: [25, 25, 25],
          studyUsageRatio: 0.6,
        }),
      );
      expect(result.adaptations).toContain("study_heavy");
    });
  });

  // ── resolveHome ───────────────────────────────────────────
  describe("resolveHome", () => {
    it("always includes coach_line and primary_session", () => {
      const result = resolveHome({
        boss: { isVisible: false, intensity: "subtle" } as any,
        profile: fixtures.profile("calm"),
        stats: makeStats(),
      });
      expect(result.sections).toContain("coach_line");
      expect(result.sections).toContain("primary_session");
    });
    it("includes study_layer when primaryGoal is study", () => {
      const result = resolveHome({
        boss: { isVisible: false, intensity: "subtle" } as any,
        profile: fixtures.profile("study_focused"),
        stats: makeStats(),
      });
      expect(result.sections).toContain("study_layer");
    });
    it("includes premium_tease for 5+ sessions", () => {
      const result = resolveHome({
        boss: { isVisible: false, intensity: "subtle" } as any,
        profile: fixtures.profile("calm"),
        stats: makeStats({ totalCompletedSessions: 5 }),
      });
      expect(result.sections).toContain("premium_tease");
    });
    it("uses direct tone coach copy for preferredTone=direct", () => {
      const result = resolveHome({
        boss: { isVisible: false, intensity: "subtle" } as any,
        profile: fixtures.profile("intense"),
        stats: makeStats(),
      });
      expect(result.coachCopy).toContain("Start the block");
    });
  });

  // ── resolvePremium ────────────────────────────────────────
  describe("resolvePremium", () => {
    it("shouldTease false when < 5 sessions", () => {
      const result = resolvePremium(fixtures.available, makeStats({ totalCompletedSessions: 3 }));
      expect(result.shouldTease).toBe(false);
    });
    it("shouldTease true when available + 5+ sessions + has attempts", () => {
      const result = resolvePremium(
        fixtures.available,
        makeStats({
          totalCompletedSessions: 10,
          premiumFeatureAttempts: ["advanced_study"],
        }),
      );
      expect(result.shouldTease).toBe(true);
    });
    it("trigger is advanced_study when attempted", () => {
      const result = resolvePremium(
        fixtures.available,
        makeStats({
          totalCompletedSessions: 10,
          premiumFeatureAttempts: ["advanced_study"],
        }),
      );
      expect(result.trigger).toBe("advanced_study");
    });
    it("mustRemainFree includes free execution loop", () => {
      const result = resolvePremium(fixtures.available, makeStats());
      expect(result.mustRemainFree).toContain("start_session");
      expect(result.mustRemainFree).toContain("complete_session");
    });
  });

  // ── resolveVexExperience (main service) ───────────────────
  describe("resolveVexExperience", () => {
    it("returns version 3 experience for new user", () => {
      const exp = resolveVexExperience(
        fixtures.profile("calm"),
        makeStats(),
        fixtures.unavailable,
      );
      expect(exp.version).toBe(3);
      expect(exp.userStage).toBe("new_user");
    });
    it("returns power_user stage for engaged user", () => {
      const exp = resolveVexExperience(
        fixtures.profile("game_like"),
        makeStats({ totalCompletedSessions: 15 }),
        fixtures.available,
      );
      expect(exp.userStage).toBe("power_user");
    });
    it("uses START_SESSION intent for non-study users", () => {
      const exp = resolveVexExperience(
        fixtures.profile("calm"),
        makeStats(),
        fixtures.unavailable,
      );
      expect(exp.primaryHomeCTA.intent).toBe("START_SESSION");
    });
    it("sets progress emphasis to basic for < 2 sessions", () => {
      const exp = resolveVexExperience(
        fixtures.profile("calm"),
        makeStats({ totalCompletedSessions: 0 }),
        fixtures.unavailable,
      );
      expect(exp.progressEmphasis).toBe("basic");
    });
    it("sets progress emphasis to rhythm for 2-6 sessions", () => {
      const exp = resolveVexExperience(
        fixtures.profile("calm"),
        makeStats({ totalCompletedSessions: 3 }),
        fixtures.unavailable,
      );
      expect(exp.progressEmphasis).toBe("rhythm");
    });
    it("sets progress emphasis to intelligence for 7+ sessions", () => {
      const exp = resolveVexExperience(
        fixtures.profile("calm"),
        makeStats({ totalCompletedSessions: 7 }),
        fixtures.unavailable,
      );
      expect(exp.progressEmphasis).toBe("intelligence");
    });
    it("bans gamification surfaces for calm motivation", () => {
      const exp = resolveVexExperience(
        fixtures.profile("calm"),
        makeStats(),
        fixtures.unavailable,
      );
      expect(exp.bannedSurfaces).toContain("boss_full_cta");
    });
    it("includes study continuation in allowed notifications when study available", () => {
      const exp = resolveVexExperience(
        fixtures.profile("study_focused"),
        makeStats(),
        { ...fixtures.available, study: true },
      );
      expect(exp.allowedNotificationTypes).toContain("study_continuation");
    });
    it("routeGates boss canNavigate is false when boss not visible", () => {
      const exp = resolveVexExperience(
        fixtures.profile("calm"),
        makeStats(),
        fixtures.unavailable,
      );
      expect(exp.routeGates.boss.canNavigate).toBe(false);
    });
  });

  // ── validatePersonalizationEvent ──────────────────────────
  describe("validatePersonalizationEvent", () => {
    it("validates a valid motivation-style-changed event", () => {
      const event = validatePersonalizationEvent({
        type: "personalization:motivation-style-changed",
        motivationStyle: "calm",
        timestamp: Date.now(),
      });
      expect(event.type).toBe("personalization:motivation-style-changed");
    });
    it("validates a reset-requested event", () => {
      const event = validatePersonalizationEvent({
        type: "personalization:reset-requested",
        timestamp: Date.now(),
      });
      expect(event.type).toBe("personalization:reset-requested");
    });
    it("throws for invalid motivation style", () => {
      expect(() =>
        validatePersonalizationEvent({
          type: "personalization:motivation-style-changed",
          motivationStyle: "invalid_style",
          timestamp: Date.now(),
        } as any),
      ).toThrow();
    });
  });

  // ── trackVexExperienceResolved ────────────────────────────
  describe("trackVexExperienceResolved", () => {
    it("calls Sentry.addBreadcrumb with experience data", () => {
      const Sentry = require("@sentry/react-native");
      const exp = resolveVexExperience(
        fixtures.profile("calm"),
        makeStats(),
        fixtures.unavailable,
      );
      trackVexExperienceResolved(exp);
      expect(Sentry.addBreadcrumb).toHaveBeenCalledWith(
        expect.objectContaining({
          category: "personalization",
          message: "Resolved VEX experience",
        }),
      );
    });
  });

  // ── behavior-resolver-helpers ─────────────────────────────
  describe("behavior-resolver-helpers", () => {
    const makeSignal = (type: string, surfaceKey = "test_surface") => ({
      userId: "00000000-0000-0000-0000-000000000001",
      surfaceKey,
      signalType: type as any,
      source: "home_hero" as any,
      timestamp: Date.now(),
    });

    it("countByType counts matching signals", () => {
      const signals = [
        makeSignal("surface_clicked"),
        makeSignal("surface_clicked"),
        makeSignal("surface_dismissed"),
      ];
      expect(countByType(signals as any, "surface_clicked")).toBe(2);
    });
    it("countDistinctSurfaces returns unique surfaces", () => {
      const signals = [
        makeSignal("surface_clicked", "a"),
        makeSignal("surface_clicked", "b"),
        makeSignal("surface_clicked", "a"),
      ];
      const result = countDistinctSurfaces(signals as any, "surface_clicked");
      expect(result.size).toBe(2);
    });
    it("hasMinimumSignals returns true when threshold met", () => {
      const signals = [makeSignal("boss_cta_clicked"), makeSignal("boss_cta_clicked")];
      expect(hasMinimumSignals(signals as any, "boss_cta_clicked", 2)).toBe(true);
    });
    it("hasSurfacesDismissedMultipleTimes surfaces meeting threshold", () => {
      const signals = Array.from({ length: DISMISS_THRESHOLD }, () =>
        makeSignal("surface_dismissed", "annoying_surface"),
      );
      expect(hasSurfacesDismissedMultipleTimes(signals as any)).toContain("annoying_surface");
    });
    it("hasSurfacesClickedMultipleTimes surfaces meeting threshold", () => {
      const signals = Array.from({ length: CLICK_TO_REINFORCE_THRESHOLD }, () =>
        makeSignal("surface_clicked", "liked_surface"),
      );
      expect(hasSurfacesClickedMultipleTimes(signals as any)).toContain("liked_surface");
    });
  });

  // ── resolveUserBehaviorSignals ────────────────────────────
  describe("resolveUserBehaviorSignals", () => {
    const makeInput = (overrides: Record<string, unknown> = {}) => ({
      recentSignals: [],
      recentSessions: {
        completedSessions: 0,
        studySessions: 0,
        totalSessions: 0,
        preferredMode: null,
        bestTimeOfDay: null,
      },
      firstWeekExperience: { stage: "DAY_1_RETURN", isDayZero: false },
      ...overrides,
    });

    it("returns zeroed summary for day zero", () => {
      const result = resolveUserBehaviorSignals(
        makeInput({
          firstWeekExperience: { stage: "DAY_0_NOT_STARTED", isDayZero: true },
        }) as any,
      );
      expect(result.bossEngagement).toBe("none");
      expect(result.premiumFeatureAttempts).toHaveLength(0);
      expect(result.coachInteractions).toBe(0);
    });
    it("calculates studyUsageRatio from sessions", () => {
      const result = resolveUserBehaviorSignals(
        makeInput({
          recentSessions: {
            completedSessions: 4,
            studySessions: 2,
            totalSessions: 4,
            preferredMode: null,
            bestTimeOfDay: null,
          },
        }) as any,
      );
      expect(result.studyUsageRatio).toBe(0.5);
    });
    it("detects boss engagement at medium level", () => {
      const signals = [
        {
          userId: "00000000-0000-0000-0000-000000000001",
          surfaceKey: "boss_cta",
          signalType: "boss_cta_clicked",
          source: "boss_tab",
          timestamp: Date.now(),
        },
        {
          userId: "00000000-0000-0000-0000-000000000001",
          surfaceKey: "boss_route",
          signalType: "boss_route_opened",
          source: "boss_tab",
          timestamp: Date.now(),
        },
      ];
      const result = resolveUserBehaviorSignals(
        makeInput({ recentSignals: signals }) as any,
      );
      expect(result.bossEngagement).toBe("medium");
    });
  });

  // ── behavior-signal-store (integration) ───────────────────
  describe("behavior-signal-store", () => {
    it("recordBehaviorSignal does not throw", () => {
      expect(() =>
        recordBehaviorSignal(
          "00000000-0000-0000-0000-000000000001",
          "surface_clicked",
          "test_surface",
          "home_hero",
        ),
      ).not.toThrow();
    });
    it("getBehaviorSignals returns array (may be empty with mock storage)", () => {
      const signals = getBehaviorSignals("00000000-0000-0000-0000-000000000001");
      expect(Array.isArray(signals)).toBe(true);
    });
    it("clearBehaviorSignals does not throw", () => {
      expect(() =>
        clearBehaviorSignals("00000000-0000-0000-0000-000000000001"),
      ).not.toThrow();
    });
  });
});
