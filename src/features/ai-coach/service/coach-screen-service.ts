import {
  FALLBACK_HOME_MESSAGES,
} from '../../coach-presence/copy';
import type { CoachActionIntent } from '../../coach-presence/types';
import { resolveCoachActionIntent } from '../../coach-presence/service';
import { ACTION_LABELS } from '../../coach-presence/copy';
import { getAvailabilityFor } from "../../liveops-config";
import { fetchCoachState } from "../repository/state";
import { type CoachMessage, type CoachState } from "../types";

export interface CoachQuestionResponse {
  message: string;
  hasAction: boolean;
  actionLabel?: string;
  actionData?: {
    type: CoachActionIntent;
    duration?: number;
    difficulty?: string;
  };
}

export interface CoachRecommendation {
  duration: number;
  difficulty: "EASY" | "NORMAL" | "CHALLENGING" | "PUSH";
  reasoning: string;
}

export async function getCoachState(userId: string): Promise<CoachState> {
  const row = await fetchCoachState(userId);
  if (row) {
    return row;
  }
  return {
    userId,
    currentState: "HIGH_CONFIDENCE",
    interventionsToday: 0,
    lastInterventionAt: null,
    muteUntil: null,
    personaId: "FRIEND",
    previousState: null,
    reduceNotifications: false,
    stateEnteredAt: Date.now(),
    behaviorProfile: null,
  };
}

export async function getCoachHistory(): Promise<{ messages: CoachMessage[] }> {
  return { messages: [] };
}

export async function askCoachQuestion(
  question: string,
): Promise<CoachQuestionResponse> {
  const lowerQuestion = question.toLowerCase();
  const featureAvailability = {
    focus: getAvailabilityFor("focus_session"),
    progress: getAvailabilityFor("progress_view"),
    study: getAvailabilityFor("content_study"),
  };

  if (lowerQuestion.includes("study")) {
    const intent = resolveCoachActionIntent({
      featureAvailability,
      requestedIntent: "START_STUDY_SESSION",
    });
    return {
      actionData: { difficulty: "NORMAL", duration: 25, type: intent },
      actionLabel: ACTION_LABELS[intent],
      hasAction: true,
      message:
        intent === "START_STUDY_SESSION"
          ? "Your study thread is ready. Start the next block."
          : "Study is not open yet. Start one clean focus block.",
    };
  }

  if (
    lowerQuestion.includes("progress") ||
    lowerQuestion.includes("level") ||
    lowerQuestion.includes("xp")
  ) {
    const intent = resolveCoachActionIntent({
      featureAvailability,
      requestedIntent: "REVIEW_PROGRESS",
    });
    return {
      actionData: { type: intent },
      actionLabel: ACTION_LABELS[intent],
      hasAction: true,
      message:
        intent === "REVIEW_PROGRESS"
          ? "Your progress has the next signal. Review it, then move."
          : "Progress view is locked. Start the next focus block.",
    };
  }

  if (
    lowerQuestion.includes("session") ||
    lowerQuestion.includes("focus") ||
    lowerQuestion.includes("start")
  ) {
    const intent = resolveCoachActionIntent({
      featureAvailability,
      requestedIntent: "START_SESSION",
    });
    return {
      actionData: { difficulty: "NORMAL", duration: 25, type: intent },
      actionLabel: ACTION_LABELS[intent],
      hasAction: true,
      message: "Your next focus block is the move. Start simple.",
    };
  }

  return {
    actionData: { difficulty: "NORMAL", duration: 25, type: "START_SESSION" },
    actionLabel: ACTION_LABELS.START_SESSION,
    hasAction: true,
    message: FALLBACK_HOME_MESSAGES.CALM,
  };
}

export function getCurrentRecommendation(
  state?: CoachState,
): CoachRecommendation | null {
  if (!state) {
    return null;
  }

  switch (state.currentState) {
    case "STREAK_AT_RISK":
      return {
        difficulty: "EASY",
        duration: 15,
        reasoning:
          "Your streak needs a small block. Start the shortest safe session.",
      };
    case "COLD_START":
      return {
        difficulty: "NORMAL",
        duration: 20,
        reasoning: "First rhythm matters. Start with one clear block.",
      };
    case "HIGH_CONFIDENCE":
      return {
        difficulty: "CHALLENGING",
        duration: 45,
        reasoning: "Your rhythm is warm. Use one deeper block.",
      };
    case "COMEBACK_MODE":
      return {
        difficulty: "NORMAL",
        duration: 25,
        reasoning: "The return starts small. Bank one steady block.",
      };
    default:
      return {
        difficulty: "NORMAL",
        duration: 25,
        reasoning: "One clean block is the next move.",
      };
  }
}
