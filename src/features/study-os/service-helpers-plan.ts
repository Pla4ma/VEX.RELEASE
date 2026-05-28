import { SessionMode } from "../../session/modes";
import { buildLaneSessionBrief } from "../session-start/service";
import {
  StudyOsHomeSurfaceSchema,
  StudyOsPremiumGateSchema,
  StudyOsUnlockGateSchema,
  type StudyBlock,
  type StudyOsHomeSurface,
  type StudyOsPremiumGate,
  type StudyOsUnlockGate,
  type StudyPlan,
} from "./schemas";

export function firstSentence(text: string): string {
  return (
    text
      .split(/[.!?\n]/)
      .map((part) => part.trim())
      .find(Boolean) ?? "Study next useful section"
  );
}

export function planId(userId: string, now: number): string {
  return `${userId}:study:${now}`;
}

export function makeBlock(
  id: string,
  title: string,
  objective: string,
): StudyBlock {
  return {
    estimatedMinutes: 25,
    id: `${id}:block:1`,
    objective,
    priority: "medium",
    status: "not_started",
    studyPlanId: id,
    title,
  };
}

export function buildStudySessionFromBlock(block: StudyBlock) {
  return {
    ...buildLaneSessionBrief({
      durationSeconds: block.estimatedMinutes * 60,
      lane: "student",
    }),
    afterCompletion:
      "Completion will add one review prompt and update the queue.",
    sessionMode: SessionMode.STUDY,
    successCondition: block.objective,
    title: block.title,
  };
}

export function buildStudyOsHomeSurface(input: {
  isOffline?: boolean;
  lane: "student" | "game_like" | "deep_creative" | "minimal_normal";
  plan: StudyPlan | null;
}): StudyOsHomeSurface {
  const hidden = input.lane !== "student" && !input.plan;
  return StudyOsHomeSurfaceSchema.parse({
    ctaLabel: input.plan ? "Start study block" : "Create study block",
    hidden,
    offlineFallback: input.isOffline
      ? "Offline: start a manual study block now; import sync can retry later."
      : null,
    riskLabel: input.plan?.deadlineAt ? "Deadline risk active" : null,
    title: input.plan?.title ?? "Study OS",
  });
}

export function computeStudyOsUnlockGate(input: {
  completedSessions: number;
  studyUsageRatio: number;
  firstWeekPhase?: number;
}): StudyOsUnlockGate {
  const { completedSessions, studyUsageRatio, firstWeekPhase = 0 } = input;
  const isDayZero = completedSessions === 0;

  if (isDayZero) {
    return StudyOsUnlockGateSchema.parse({
      isUnlocked: false,
      isDayZero: true,
      completedSessions,
      studyUsageRatio,
      unlockReason: "day_zero",
    });
  }

  if (completedSessions >= 7 || firstWeekPhase >= 7) {
    return StudyOsUnlockGateSchema.parse({
      isUnlocked: true,
      isDayZero: false,
      completedSessions,
      studyUsageRatio,
      unlockReason: "full",
    });
  }

  if (completedSessions >= 5 || studyUsageRatio >= 0.35) {
    return StudyOsUnlockGateSchema.parse({
      isUnlocked: true,
      isDayZero: false,
      completedSessions,
      studyUsageRatio,
      unlockReason:
        completedSessions >= 5 ? "evidence_sessions" : "evidence_usage",
    });
  }

  return StudyOsUnlockGateSchema.parse({
    isUnlocked: false,
    isDayZero: false,
    completedSessions,
    studyUsageRatio,
    unlockReason: "first_week",
  });
}

export function computeStudyOsPremiumGate(input: {
  hasPremiumEntitlement: boolean;
  revenueCatHealthy: boolean;
}): StudyOsPremiumGate {
  return StudyOsPremiumGateSchema.parse({
    canAccessPremiumDepth:
      input.hasPremiumEntitlement && input.revenueCatHealthy,
    revenueCatHealthy: input.revenueCatHealthy,
    basicStudyFree: true,
    restrictionReason: input.revenueCatHealthy
      ? input.hasPremiumEntitlement
        ? null
        : "Premium study depth available with VEX+"
      : "Premium features unavailable — RevenueCat is degraded",
  });
}

export function buildDayZeroStudyPreview(): StudyOsHomeSurface {
  return StudyOsHomeSurfaceSchema.parse({
    ctaLabel: "Start first study block",
    hidden: false,
    offlineFallback: null,
    riskLabel: null,
    title: "Study OS preview",
  });
}

export function isContentStudyBackendAvailable(input: {
  featureHealth: "healthy" | "degraded" | "unavailable";
  aiConfigured: boolean;
  storageConfigured: boolean;
}): boolean {
  return (
    input.featureHealth === "healthy" &&
    input.aiConfigured &&
    input.storageConfigured
  );
}

export function getManualStudyFallbackMessage(isOffline: boolean): string {
  if (isOffline)
    return "You are offline. Start a manual study block — sync can retry later.";
  return "Content tools are temporarily unavailable. Start a manual study session instead.";
}
