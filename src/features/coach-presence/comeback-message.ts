import type { CoachPresenceMessageStyle } from "./message-library";

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

export function getCoachComebackMessage(params: {
  motivationStyle: string;
  daysSinceLastSession: number;
}): string {
  const style = resolveStyle(params.motivationStyle);

  return style === "calm"
    ? `Welcome back after ${params.daysSinceLastSession} days. One clean block, no pressure.`
    : style === "friendly"
      ? `You are back after ${params.daysSinceLastSession} days. One small step is enough.`
      : style === "coach_led"
        ? `Back after ${params.daysSinceLastSession} days. Reset with one clean block.`
        : style === "game_like"
          ? `Welcome back. ${params.daysSinceLastSession} days off. One run restarts the engine.`
          : style === "intense"
            ? `Back after ${params.daysSinceLastSession}. No speech. Prove it with one block.`
            : `Back after ${params.daysSinceLastSession} days. Review first, then add new material.`;
}
