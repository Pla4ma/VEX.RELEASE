import fs from "fs";
import path from "path";
import { buildCoachPresence } from "../../coach-presence/service";
import { decideHomeSurfaces } from "../../home-experience/home-surface-decision";
import { resolvePersonalizedPremium } from "../../monetization/personalized-premium";
import { decideNudge } from "../../notification-policy/service";
import { createRescuePlan } from "../../rescue-mode/service";
import { buildCompletionPersonalizationResult } from "../../session-completion/completion-personalization";
import { buildLaneSessionBrief } from "../../session-start/service";
import { resolveActiveSessionDisplayPolicy } from "../../../screens/session/utils/active-session-display-policy";
import { SessionMode } from "../../../session/modes";
import type { SessionSummary } from "../../../session/types";
import type { FeatureAvailability } from "../../liveops-config";
import {
  getLaneMechanicPolicy,
  resolveBehaviorLane,
  resolveInitialLane,
  shouldReconsiderLane,
  shouldSuggestLaneReconsideration,
} from "../service";
import type { Lane, LaneProfile } from "../types";
const observedAt = 1_764_000_000_000;
function profile(lane: Lane): LaneProfile {
  return resolveInitialLane({ manualOverride: lane, observedAt });
}
function summary(): SessionSummary {
  return {
    actualDuration: 1_500,
    baseScore: 80,
    bonuses: [],
    coinsEarned: 0,
    completionPercentage: 100,
    createdAt: observedAt,
    damageTaken: 0,
    effectiveDuration: 1_500,
    finalScore: 80,
    focusQuality: 80,
    gemsEarned: 0,
    interruptions: 0,
    modeBonus: 0,
    pausedDuration: 0,
    pausedTime: 0,
    pauses: 0,
    penaltiesApplied: [],
    plannedDuration: 1_500,
    sessionId: "session-1",
    sessionMode: SessionMode.SPRINT,
    status: "COMPLETED",
    streakDays: 1,
    streakIncreased: true,
    streakMaintained: true,
    timeBonus: 0,
    userId: "user-1",
    userLevel: 1,
    vsAverage: 0,
    vsBest: 0,
    xpEarned: 0,
  };
}
function available(): FeatureAvailability {
  return {
    canNavigate: true,
    canQuery: true,
    canRegisterRoute: true,
    canRenderEntryPoint: true,
    canShowNotification: true,
    canSubscribeToEvents: true,
    canUseBackend: true,
    reason: "test",
    state: "enabled",
  };
}
describe("Lane Engine ownership proof", () => {
  it("Lane Engine owns lane resolution and manual override wins", () => {
    const manual = resolveBehaviorLane({
      bossEngagement: "high",
      completedSessions: 10,
      manualOverride: "minimal_normal",
      motivationStyle: "game_like",
      observedAt,
      primaryGoal: "creative",
    });
    expect(manual.primaryLane).toBe("minimal_normal");
    expect(manual.confidence).toBe(1);
    expect(manual.source).toBe("manual_override");
  });
  it("behavior can suggest reconsideration without silent override", () => {
    const current = resolveInitialLane({
      manualOverride: "minimal_normal",
      observedAt,
    });
    const latest = resolveBehaviorLane({
      completedSessions: 10,
      motivationStyle: "study_focused",
      observedAt,
      primaryGoal: "study",
      studyUsageRatio: 1,
    });
    expect(
      shouldReconsiderLane({
        completedSessions: 10,
        currentProfile: current,
        latestProfile: latest,
      }),
    ).toBe(false);
    expect(
      shouldSuggestLaneReconsideration({
        completedSessions: 10,
        currentProfile: current,
        latestProfile: latest,
      }),
    ).toBe(true);
  });
  it("missing profile falls back to Clean with low confidence", () => {
    const fallback = resolveInitialLane({ observedAt });
    expect(fallback.primaryLane).toBe("minimal_normal");
    expect(fallback.confidenceBand).toBe("low");
    expect(fallback.source).toBe("fallback");
  });
  it("Home and completion do not own direct lane resolver files", () => {
    const home = fs.readFileSync(
      path.join(
        process.cwd(),
        "src/screens/home/hooks/useHomeResolvedExperience.ts",
      ),
      "utf8",
    );
    const completion = fs.readFileSync(
      path.join(
        process.cwd(),
        "src/features/session-completion/completion-orchestrator.ts",
      ),
      "utf8",
    );
    expect(home).not.toMatch(/resolveInitialLane\(|resolveBehaviorLane\(/);
    expect(completion).not.toMatch(/resolveCompletionLane|buildLaneProfile/);
  });

  it("core consumers prefer LaneProfile over conflicting legacy signals", () => {
    const student = profile("student");
    const run = profile("game_like");
    const project = profile("deep_creative");

    const home = decideHomeSurfaces({
      behaviorStats: {
        bossChallengeEngagement: "high",
        coachInteractions: 0,
        comebackSessions: 0,
        completionStreak: 0,
        ignoredFeatures: [],
        premiumFeatureAttempts: [],
        studyUsageRatio: 0,
        totalCompletedSessions: 3,
      },
      featureAvailability: {
        boss: true,
        challenges: true,
        premium: true,
        study: true,
      },
      hasActiveBoss: true,
      hasActiveRecommendation: false,
      hasActiveStudyPlan: true,
      isFirstSession: false,
      laneProfile: student,
      personalizationProfile: {
        gamificationIntensity: "strong",
        motivationStyle: "game_like",
        primaryGoal: "work",
        studyLayerName: "Study",
        userStage: "engaged",
      },
    });
    expect(home.study_os).not.toBe("hidden");

    expect(
      buildLaneSessionBrief({ lane: "minimal_normal", laneProfile: run })
        .sessionMode,
    ).toBe("SPRINT");
    expect(
      decideNudge({
        completedSessions: 4,
        context: "run_open",
        daysSinceOnboarding: 3,
        lane: "minimal_normal",
        laneProfile: run,
      }).type,
    ).toBe("run_continue");
    expect(
      createRescuePlan({
        lane: "minimal_normal",
        laneProfile: project,
        reason: "unclear",
        userId: "u1",
      }).sessionMode,
    ).toBe("CREATIVE");
  });

  it("completion, coach, premium, and active session consume LaneProfile", () => {
    const student = profile("student");
    const completion = buildCompletionPersonalizationResult({
      focusScoreDelta: 1,
      grade: "A",
      isPersonalBest: false,
      lane: "game_like",
      laneProfile: student,
      streakAction: "extended",
      streakDays: 1,
      summary: summary(),
      xpDelta: 10,
    });
    expect(completion.laneProfile.primaryLane).toBe("student");
    expect(completion.userFacingSummary.displayTitle).toContain("Study");

    const coach = buildCoachPresence({
      companion: null,
      featureAvailability: {
        focus: available(),
        progress: available(),
        study: available(),
      },
      laneProfile: student,
      memorySummary: {
        coachMemoryCount: 0,
        companionMemoryCount: 0,
        latestMemory: null,
        syncAvailable: true,
      },
      motivationStyle: "CALM",
      progress: { currentStreakDays: 0, highFocusStreak: 0, totalSessions: 1 },
      surface: "HOME",
    });
    expect(coach.nextAction.intent).toBe("START_STUDY_SESSION");

    const premium = resolvePersonalizedPremium({
      billingConfigured: true,
      completedSessions: 50,
      currentStreakDays: 0,
      daysSinceOnboarding: 10,
      hasTriedAdvancedStudy: false,
      hasTriedVisualIdentity: false,
      hasTriedWeeklyReport: false,
      lane: "game_like",
      laneProfile: profile("deep_creative"),
      motivationStyle: "game_like",
      primaryGoal: "work",
      studyUsageRatio: 0,
    });
    expect(premium.premiumHeadline).toContain("project");

    const active = resolveActiveSessionDisplayPolicy({
      bossIntensity: "visible",
      focusStage: "active",
      laneProfile: profile("game_like"),
      motivationStyle: "calm",
      primaryGoal: "personal",
      sessionMode: SessionMode.LIGHT_FOCUS,
      studyLayerLabel: null,
    });
    expect(active.showBossTinyIndicator).toBe(true);
  });

  it("lane policy describes mechanics but cannot unlock hidden features directly", () => {
    const policy = getLaneMechanicPolicy(profile("game_like"));
    expect(policy.preferredMechanics).toContain("personal_boss");
    expect("canRender" in policy).toBe(false);
    expect("canRoute" in policy).toBe(false);
    expect("canQuery" in policy).toBe(false);
  });
});
