import type { Lane } from "../lane-engine/types";
import { RETENTION_JOURNEY_COPY } from "./journey-copy";
import {
  JourneyStateInputSchema,
  JourneyStateSchema,
  type JourneyDay,
  type JourneyState,
  type JourneyStateInput,
} from "./schemas";

export function computeJourneyDay(input: JourneyStateInput): JourneyDay {
  const d = input.daysSinceOnboarding;
  if (d <= 0) return 0;
  if (d >= 7) return 7;
  return d as JourneyDay;
}

function laneCopyKey(
  lane: Lane,
): "student" | "game_like" | "deep_creative" | "minimal_normal" {
  return lane;
}

function resolvePhase(
  day: JourneyDay,
  input: JourneyStateInput,
): JourneyState["phase"] {
  if (day === 0) return "onboarding";
  if (day === 1) return "return";
  if (day === 2) return "proof";
  if (day === 3) return "insight";
  if (day === 4) {
    return input.inactivityDays > 0 || input.recentDismissals >= 2
      ? "rescue"
      : "lane_forming";
  }
  if (day === 5) return "lane_forming";
  if (day === 6) return "weekly_prep";
  if (day === 7) return "weekly_intelligence";
  return "onboarding";
}

function resolveEmotionalState(
  day: JourneyDay,
  input: JourneyStateInput,
): JourneyState["emotionalState"] {
  if (day === 0) return "curious";
  if (day === 1) return input.hasCompletedToday ? "familiar" : "curious";
  if (day === 2) return "validated";
  if (day === 3) return "trusting";
  if (day === 4) return input.inactivityDays > 0 ? "struggling" : "forming";
  if (day === 5) return "forming";
  if (day === 6) return "ready";
  if (day === 7) return "valuable";
  return "curious";
}

function premiumCopyForLane(
  lane: Lane,
): JourneyState["premiumTrigger"]["copyKey"] {
  const map: Record<Lane, JourneyState["premiumTrigger"]["copyKey"]> = {
    student: "study",
    game_like: "run",
    deep_creative: "project",
    minimal_normal: "clean",
  };
  return map[lane];
}

function resolveTone(day: JourneyDay): JourneyState["homeMessage"]["tone"] {
  if (day === 0) return "warm";
  if (day === 3) return "humble";
  if (day === 4) return "encouraging";
  if (day === 7) return "proof";
  return "direct";
}

function resolveNudgeType(
  day: JourneyDay,
  input: JourneyStateInput,
): JourneyState["nudgePolicy"]["type"] {
  if (day === 0) return null;
  if (day === 1) return "gentle_return";
  if (day === 2) return "proof_nudge";
  if (day === 3) return input.hasInsightReady ? "memory_nudge" : "gentle_return";
  if (day === 4) return input.inactivityDays > 0 ? "rescue" : "gentle_return";
  if (day === 7) return "weekly_insight";
  return "gentle_return";
}

export function computeJourneyState(rawInput: JourneyStateInput): JourneyState {
  const input = JourneyStateInputSchema.parse(rawInput);
  const day = computeJourneyDay(input);
  const key = laneCopyKey(input.lane);
  const copy = RETENTION_JOURNEY_COPY[`day${day}`];

  return JourneyStateSchema.parse({
    day,
    phase: resolvePhase(day, input),
    emotionalState: resolveEmotionalState(day, input),
    homeMessage: {
      headline: copy.homeMessage[key],
      subtext: copy.returnReason[key],
      tone: resolveTone(day),
    },
    primaryCta: copy.primaryCta[key],
    sessionSuggestion: copy.sessionSuggestion[key],
    completionPayoff: copy.completionPayoff[key],
    nextActionCopy: copy.nextActionCopy[key],
    returnReason: copy.returnReason[key],
    nudgePolicy: {
      canSend: day !== 0 && !(input.recentDismissals >= 3),
      type: resolveNudgeType(day, input),
      condition:
        day === 0
          ? "Day 0: no unsolicited notification."
          : input.recentDismissals >= 3
            ? "User repeatedly dismissed — paused."
            : "Day policy allows this nudge.",
    },
    premiumTrigger: {
      day,
      trigger: copy.premiumTrigger.trigger,
      copyKey: premiumCopyForLane(input.lane),
    },
    momentType: {
      type:
        day === 3
          ? "what_vex_learned"
          : day === 2
            ? "proof_signal"
            : day === 7
              ? "weekly_insight"
              : "none",
      requiresSessions: day === 3 ? 3 : day === 7 ? 5 : 0,
      canHide: day === 3 || day === 7,
    },
  });
}

export function getDay1ReturnMoment(
  lane: Lane,
): { headline: string; cta: string; sessionMinutes: number } {
  const key = laneCopyKey(lane);
  const copy = RETENTION_JOURNEY_COPY.day1;
  return {
    headline: copy.homeMessage[key],
    cta: copy.primaryCta[key],
    sessionMinutes: copy.sessionSuggestion[key].durationMinutes,
  };
}

export function getDay0SessionSuggestion(
  lane: Lane,
): { durationMinutes: number; type: string; taskPrompt: string } {
  const key = laneCopyKey(lane);
  const suggestion = RETENTION_JOURNEY_COPY.day0.sessionSuggestion[key];
  return {
    durationMinutes: suggestion.durationMinutes,
    type: suggestion.type,
    taskPrompt: suggestion.taskPrompt,
  };
}
