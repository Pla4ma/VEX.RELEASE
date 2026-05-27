import { buildHomeFeatureRuntime } from "../screens/home/hooks/home-feature-runtime";
import { canRegisterFeatureRoute } from "../navigation/feature-route-registry";
import { buildFeatureAccess } from "../features/liveops-config/feature-access";
import { decideHomeSurfaces } from "../features/home-experience/home-surface-decision";
import { resolveFirstWeekExperience } from "../features/personalization/first-week-service";
import { buildLaneSessionBrief } from "../features/session-start/service";
import { buildCompletionPersonalization } from "../features/session-completion/completion-personalization";
import { buildTodaySystem } from "../features/today-system/service";
import { createSessionSummary } from "../features/session-completion/__tests__/ledger-test-utils";
import type { Lane } from "../features/lane-engine/types";

const featureAvailability = {
  boss: true,
  challenges: true,
  premium: true,
  study: true,
};

function stats(totalCompletedSessions: number) {
  return {
    bossChallengeEngagement: "none" as const,
    coachInteractions: 1,
    comebackSessions: 0,
    completionStreak: totalCompletedSessions,
    ignoredFeatures: [],
    premiumFeatureAttempts: [],
    studyUsageRatio: 0,
    totalCompletedSessions,
  };
}

function profile(lane: Lane) {
  if (lane === "student") {
    return {
      gamificationIntensity: "medium" as const,
      motivationStyle: "student" as const,
      primaryGoal: "study" as const,
      studyLayerName: "Study OS",
      userStage: "engaged" as const,
    };
  }
  if (lane === "game_like") {
    return {
      gamificationIntensity: "strong" as const,
      motivationStyle: "game_like" as const,
      primaryGoal: "work" as const,
      studyLayerName: "Deep Work Plan",
      userStage: "engaged" as const,
    };
  }
  if (lane === "deep_creative") {
    return {
      gamificationIntensity: "medium" as const,
      motivationStyle: "coach_led" as const,
      primaryGoal: "creative" as const,
      studyLayerName: "Project Focus Path",
      userStage: "engaged" as const,
    };
  }
  return {
    gamificationIntensity: "minimal" as const,
    motivationStyle: "calm" as const,
    primaryGoal: "focus" as const,
    studyLayerName: "Deep Work Plan",
    userStage: "engaged" as const,
  };
}

function firstWeek(lane: Lane, completedSessions: number) {
  const p = profile(lane);
  return resolveFirstWeekExperience({
    behaviorStats: {
      bossEngagement: lane === "game_like" ? "high" : "none",
      studyUsageRatio: lane === "student" ? 0.7 : 0,
    },
    completedSessions,
    daysSinceLastSession: 0,
    daysSinceOnboarding: completedSessions,
    featureAvailability: {
      boss: true,
      premium: true,
      social: false,
      study: true,
    },
    motivationStyle:
      p.motivationStyle === "student" ? "study_focused" : p.motivationStyle,
    premiumState: "configured",
    primaryGoal: p.primaryGoal,
  });
}

describe("first-week journey hardening", () => {
  it.each([
    ["student", "study_os", "Start study block", "Study OS"],
    ["game_like", "run_board", "Start encounter", "Run Board"],
    [
      "deep_creative",
      "project_thread",
      "Resume project block",
      "Project Focus Path",
    ],
    ["minimal_normal", "today_strip", "Start clean session", "Today Strip"],
  ] as const)(
    "keeps %s journey wired through week one",
    (lane, surface, ctaLabel, pathName) => {
      const home = decideHomeSurfaces({
        behaviorStats: {
          ...stats(5),
          bossChallengeEngagement: lane === "game_like" ? "high" : "none",
          projectFocusUsageRatio: lane === "deep_creative" ? 0.7 : 0,
          studyUsageRatio: lane === "student" ? 0.7 : 0,
        },
        featureAvailability,
        hasActiveBoss: lane === "game_like",
        hasActiveRecommendation: true,
        hasActiveStudyPlan: lane === "student",
        isFirstSession: false,
        personalizationProfile: profile(lane),
      });
      const setup = buildLaneSessionBrief({ lane });
      const completion = buildCompletionPersonalization({
        lane,
        summary: createSessionSummary(),
      });

      expect(firstWeek(lane, 5).hiddenSurfaces).toEqual(
        expect.arrayContaining(["shop", "inventory", "wagers"]),
      );
      expect(home[surface]).not.toBe("hidden");
      expect(setup.ctaLabel).toBe(ctaLabel);
      expect(completion.unlockDecision.key).toBe(surface);
      expect(pathName.length).toBeGreaterThan(0);
    },
  );

  it("covers comeback, offline setup, and minimal Today Strip recovery", () => {
    const comeback = resolveFirstWeekExperience({
      behaviorStats: { bossEngagement: "none", studyUsageRatio: 0 },
      completedSessions: 3,
      daysSinceLastSession: 3,
      daysSinceOnboarding: 6,
      featureAvailability: {
        boss: false,
        premium: false,
        social: false,
        study: false,
      },
      motivationStyle: "calm",
      premiumState: "unavailable",
      primaryGoal: "focus",
    });
    const setup = buildLaneSessionBrief({
      isOffline: true,
      isRescue: true,
      lane: "minimal_normal",
    });
    const today = buildTodaySystem({
      dayFeelsMessy: true,
      lane: "minimal_normal",
      reducedMotion: true,
    });

    expect(comeback.allowedHomeSurfaces).toEqual([
      "coach_presence_line",
      "recovery_cta",
      "start_session",
    ]);
    expect(setup.offlineMessage).toContain("offline");
    expect(setup.suggestedDurationSeconds).toBeLessThanOrEqual(12 * 60);
    expect(
      today.sections.find((section) => section.key === "recovery")?.visible,
    ).toBe(true);
  });

  it("keeps hidden shop inventory wagers social routes and queries inert", () => {
    const { features } = buildFeatureAccess({ totalCompletedSessions: 50 });
    const runtime = buildHomeFeatureRuntime({ features, totalSessions: 50 });

    expect(runtime.canQueryBattlePass).toBe(false);
    expect(runtime.canQueryEconomy).toBe(false);
    expect(runtime.canQuerySquads).toBe(false);
    expect(canRegisterFeatureRoute(features, "Boss")).toBe(true);
    expect(features.shop.isVisible).toBe(false);
    expect(features.inventory.isVisible).toBe(false);
    expect(features.wagers.isVisible).toBe(false);
    expect(features.social_tab.isVisible).toBe(false);
  });
});
