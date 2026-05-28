/**
 * Phase 3 — Test fixtures and helper factories
 *
 * Extracted from phase3-test-helpers.ts to stay under the 200-line limit.
 */

import { getLaneMechanicPolicy } from "../lane-engine";
import type { Lane, LaneProfile } from "../lane-engine/types";
import { buildLaneSessionBrief } from "../session-start/service";
import { decideNudge } from "../notification-policy/service";
import { resolveCompletionExperiencePolicy } from "../session-completion/completion-experience-policy";
import type { CompletionExperiencePolicyInput } from "../session-completion/completion-experience-policy-schemas";
import { resolveLaneCopy } from "../personalization/first-week-lane-copy";
import { LANE_USER_FACING_NAMES } from "../lane-engine/schemas";
import { SessionMode } from "../../session/modes";

export type SessionModeString = (typeof SessionMode)[keyof typeof SessionMode];

// ─── Test Fixtures ─────────────────────────────────────────────────────

export const baseLaneProfile = (
  overrides: Partial<LaneProfile>,
): LaneProfile => ({
  primaryLane: "minimal_normal",
  secondaryLane: null,
  confidence: 0.8,
  confidenceBand: "high",
  source: "onboarding",
  evidence: [],
  traits: {
    needsStructure: 0.5,
    wantsPlay: 0.1,
    needsContinuity: 0.4,
    wantsQuiet: 0.9,
  },
  resolvedAt: Date.now(),
  ...overrides,
});

export const featureAvailability = {
  boss: true,
  challenges: true,
  premium: true,
  study: true,
};

export const baseStats = {
  bossChallengeEngagement: "none" as const,
  coachInteractions: 0,
  comebackSessions: 0,
  completionStreak: 0,
  ignoredFeatures: [],
  premiumFeatureAttempts: [],
  studyUsageRatio: 0,
  totalCompletedSessions: 0,
};

export const baseProfile = {
  gamificationIntensity: "medium" as const,
  motivationStyle: "coach_led" as const,
  primaryGoal: "work" as const,
  studyLayerName: "Deep Work Plan",
  userStage: "engaged" as const,
};

export function sessionSummary(overrides: {
  sessionId?: string;
  userId?: string;
  sessionMode?: SessionModeString;
  plannedDuration?: number;
  effectiveDuration?: number;
  completionPercentage?: number;
  focusQuality?: number;
  finalScore?: number;
  streakMaintained?: boolean;
  createdAt?: number;
}): CompletionExperiencePolicyInput["summary"] {
  const now = Date.now();
  return {
    sessionId: overrides.sessionId ?? "test-summary-id",
    userId: overrides.userId ?? "test-user",
    status: "COMPLETED",
    sessionMode: overrides.sessionMode ?? SessionMode.LIGHT_FOCUS,
    plannedDuration: overrides.plannedDuration ?? 1500,
    actualDuration: 1500,
    effectiveDuration: overrides.effectiveDuration ?? 1500,
    pausedDuration: 0,
    completionPercentage: overrides.completionPercentage ?? 100,
    focusQuality: overrides.focusQuality ?? 90,
    focusPurityScore: 90,
    interruptions: 0,
    pauses: 0,
    pausedTime: 0,
    streakMaintained: overrides.streakMaintained ?? true,
    modeBonus: 0,
    baseScore: 80,
    timeBonus: 5,
    finalScore: overrides.finalScore ?? 90,
    createdAt: overrides.createdAt ?? now,
    streakIncreased: true,
    streakDays: 3,
    xpEarned: 100,
    coinsEarned: 0,
    gemsEarned: 0,
    damageTaken: 0,
    vsAverage: 10,
    vsBest: -5,
    penaltiesApplied: [],
  };
}

export function completionInput(overrides: {
  lane?: Lane;
  motivationStyle?: CompletionExperiencePolicyInput["motivationStyle"];
  premiumState?: CompletionExperiencePolicyInput["premiumState"];
  primaryGoal?: CompletionExperiencePolicyInput["primaryGoal"];
  sessionMode?: CompletionExperiencePolicyInput["sessionMode"];
  featureAvailability?: CompletionExperiencePolicyInput["featureAvailability"];
  consequences?: CompletionExperiencePolicyInput["consequences"];
  summary?: Partial<CompletionExperiencePolicyInput["summary"]>;
}): CompletionExperiencePolicyInput {
  return {
    consequences: overrides.consequences ?? undefined,
    featureAvailability: overrides.featureAvailability ?? {
      boss: true,
      challenges: true,
      progress: true,
      study: true,
      contractUsed: false,
    },
    firstWeekStage: null,
    lane: overrides.lane ?? "minimal_normal",
    motivationStyle: overrides.motivationStyle ?? "calm",
    premiumState: overrides.premiumState ?? "free",
    primaryGoal: overrides.primaryGoal ?? "WORK",
    sessionMode: overrides.sessionMode ?? SessionMode.LIGHT_FOCUS,
    summary: sessionSummary({
      sessionMode: overrides.sessionMode,
      ...(overrides.summary ?? {}),
    }),
  };
}

export function auditLane(lane: Lane): string {
  const profile = baseLaneProfile({ primaryLane: lane });
  const policy = getLaneMechanicPolicy(profile);
  const brief = buildLaneSessionBrief({ lane });
  const nudge = decideNudge({
    lane,
    completedSessions: 0,
    daysSinceOnboarding: 0,
  });
  const input = completionInput({
    lane,
    motivationStyle: lane === "minimal_normal" ? "calm" : "coach_led",
    sessionMode: brief.sessionMode,
  });
  const completion = resolveCompletionExperiencePolicy(input);
  const day0Copy = resolveLaneCopy("DAY_0_NOT_STARTED", profile, "fallback");

  return [
    `Lane: ${lane} (${LANE_USER_FACING_NAMES[lane]})`,
    `  Day 0 surface: ${day0Copy.laneStageTheme}, "${day0Copy.primaryMessage}"`,
    `  Session mode: ${brief.sessionMode}, CTA: "${brief.ctaLabel}"`,
    `  Completion: animation=${completion.animationLevel}, payoff=${completion.adaptivePayoff}, next=${completion.nextAction}`,
    `  Notification budget: ${nudge.budgetRemaining}/${nudge.lane === "minimal_normal" ? 1 : 2}/day`,
    `  Preferred: ${policy.preferredMechanics.join(", ")}`,
    `  Blocked: ${policy.blockedMechanics.join(", ")}`,
    `  Hidden completion surfaces: ${completion.hiddenCompletionSurfaces.length}`,
    "",
  ].join("\n");
}
