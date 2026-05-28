import { getCoachPresenceMessage } from "./copy-service";
import type { CoachPresenceContext } from "./copy-service";
import { getCoachPresenceMessage as getMessageFromLibrary } from "./message-library";
import type {
  CoachPresenceMessageContext,
  CoachPresenceMessageStyle,
} from "./message-library";
import { getCoachComebackMessage } from "./comeback-message";

export { getCoachComebackMessage } from "./comeback-message";

export interface CoachInterruptionContext {
  motivationStyle: CoachPresenceContext["motivationStyle"];
  firstWeekStage: string | null;
  sessionState: "active" | "risk" | "paused" | "completed";
  riskLevel: "warning" | "critical" | "none";
  primaryGoal: CoachPresenceContext["primaryGoal"];
  studyLayerLabel: string | null;
  comebackState: CoachPresenceContext["comebackState"];
  bossIntensity: CoachPresenceContext["bossIntensity"];
}

const MOTIVATION_TO_COACH_STYLE: Record<string, CoachPresenceMessageStyle> = {
  CALM: "calm",
  FRIENDLY: "friendly",
  COACH_LED: "coach_led",
  GAME_LIKE: "game_like",
  INTENSE: "intense",
  STUDY_FOCUSED: "study_focused",
};

function resolveStyle(input: string): CoachPresenceMessageStyle {
  const key = input.toUpperCase();
  return MOTIVATION_TO_COACH_STYLE[key] ?? "calm";
}

function contextToLibraryContext(
  sessionState: CoachInterruptionContext["sessionState"],
  riskLevel: CoachInterruptionContext["riskLevel"],
): CoachPresenceMessageContext {
  if (sessionState === "risk" && riskLevel === "critical")
    return "strong_streak";
  if (sessionState === "risk") return "short_session";
  if (sessionState === "paused") return "low_energy_day";
  if (sessionState === "completed") return "strong_streak";
  return "first_session_start";
}

const STYLE_ADAPTED_MESSAGES: Record<string, Record<string, string>> = {
  interruption_warning: {
    calm: "A small pause. Resume when you are ready, no pressure.",
    friendly: "Small interruption noted. You can still keep the rhythm.",
    coach_led: "Distraction detected. Return to the block when ready.",
    study_focused: "Interruption noticed. Your study material will wait.",
    game_like: "Minor disruption. The run is still in your control.",
    intense: "Distraction. Recover the block now.",
  },
  interruption_critical: {
    calm: "That one took longer. Come back to a clean restart.",
    friendly: "That was a big pause. Let us start one small clean block.",
    coach_led: "Session interrupted too long. Reset the target.",
    study_focused: "Long pause. Review the last point before continuing.",
    game_like: "Run disrupted hard. Restart the mission clean.",
    intense: "Session broken. Restart the target immediately.",
  },
  pause_reminder: {
    calm: "Session is paused. Come back when you are ready.",
    friendly: "Your session is waiting. No rush.",
    coach_led: "Block paused. Timer holds your spot.",
    study_focused: "Study block paused. Material saved.",
    game_like: "Mission paused. Continue when you are back.",
    intense: "Paused. Do not let it cool.",
  },
};

export function getCoachPresenceMessageForInterruption(
  context: CoachInterruptionContext,
): string {
  const style = MOTIVATION_TO_COACH_STYLE[context.motivationStyle] ?? "calm";

  if (context.sessionState === "risk") {
    if (context.riskLevel === "critical") {
      const message = STYLE_ADAPTED_MESSAGES.interruption_critical?.[style];
      return message ?? "Long pause. Reset and start a clean block.";
    }
    const warningMsg = STYLE_ADAPTED_MESSAGES.interruption_warning?.[style];
    return warningMsg ?? "Small pause. Resume when ready.";
  }

  if (context.sessionState === "paused") {
    const pauseMsg = STYLE_ADAPTED_MESSAGES.pause_reminder?.[style];
    return pauseMsg ?? "Your session is paused. Come back when ready.";
  }

  const libContext = contextToLibraryContext(
    context.sessionState,
    context.riskLevel,
  );
  try {
    return getMessageFromLibrary({ context: libContext, style });
  } catch (error: unknown) {
    return "Start with one clean block.";
  }
}

export function getCoachSessionCompletionMessage(params: {
  motivationStyle: string;
  isFirstSession: boolean;
  isComeback: boolean;
  isStreakRecovery: boolean;
  sessionMode: string;
  durationMinutes: number;
}): string {
  const style = resolveStyle(params.motivationStyle);

  if (params.isFirstSession) {
    try {
      return getMessageFromLibrary({
        context: "first_session_completion",
        style,
      });
    } catch (error: unknown) {
      return "First session is real now. Choose the next block.";
    }
  }

  if (params.isComeback) {
    try {
      return getMessageFromLibrary({ context: "comeback_session", style });
    } catch (error: unknown) {
      return "That return counted. Keep the next block small.";
    }
  }

  if (params.isStreakRecovery) {
    return "The chain is breathing again. Protect it next.";
  }

  if (params.sessionMode === "STUDY") {
    return style === "study_focused"
      ? "Study thread stayed alive. Queue the next review pass."
      : "Study block finished. Keep the thread warm.";
  }

  if (params.durationMinutes < 15) {
    return "Short block landed. Stack one more easy rep.";
  }

  if (params.durationMinutes >= 45) {
    return "Long block held. Let the next move be lighter.";
  }

  try {
    return getMessageFromLibrary({ context: "strong_streak", style });
  } catch (error: unknown) {
    return "Session banked. Home has the next move.";
  }
}

export function getCoachStreakMessage(params: {
  motivationStyle: string;
  streak: number;
  context: "broken" | "at_risk";
}): string {
  const style = resolveStyle(params.motivationStyle);

  if (params.context === "broken") {
    return style === "calm"
      ? `${params.streak}-day streak ended. No pressure. Start fresh today.`
      : style === "friendly"
        ? `${params.streak}-day streak ended, that is okay. Let us start a new one today.`
        : style === "coach_led"
          ? `Streak ended at ${params.streak} days. Reset the rhythm with one block.`
          : style === "game_like"
            ? `Streak broken at ${params.streak}. The run is not over. Restart now.`
            : style === "intense"
              ? `Streak lost at ${params.streak}. No drift. Restart immediately.`
              : `${params.streak}-day streak ended. Do one review block before adding new material.`;
  }

  return style === "calm"
    ? `${params.streak}-day streak is nudging you. One block keeps it safe.`
    : style === "friendly"
      ? `${params.streak}-day streak, so close. One block protects it.`
      : style === "coach_led"
        ? `${params.streak}-day streak. One block now keeps the rhythm.`
        : style === "game_like"
          ? `${params.streak}-day streak at risk. Bank one block to save it.`
          : style === "intense"
            ? `${params.streak}-day streak. One block before it cools.`
            : `${params.streak}-day streak. One review block protects it.`;
}
