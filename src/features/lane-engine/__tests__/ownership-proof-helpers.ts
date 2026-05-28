import { resolveInitialLane } from "../service";
import { SessionMode } from "../../../session/modes";
import type { SessionSummary } from "../../../session/types";
import type { FeatureAvailability } from "../../liveops-config";
import type { Lane, LaneProfile } from "../types";

export const observedAt = 1_764_000_000_000;

export function profile(lane: Lane): LaneProfile {
  return resolveInitialLane({ manualOverride: lane, observedAt });
}

export function summary(): SessionSummary {
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

export function available(): FeatureAvailability {
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
