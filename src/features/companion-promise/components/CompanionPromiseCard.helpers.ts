import type { CompanionPromiseHomeState } from "../types";

export function getModeCopy(mode: string): string {
  if (mode === "BOSS_PREP") {
    return "boss-prep";
  }
  if (mode === "HABIT_BUILD") {
    return "habit-build";
  }
  return mode.toLowerCase();
}

export function getBodyCopy(state: CompanionPromiseHomeState): string {
  if (state.kind === "pending") {
    return `You said tomorrow would be a ${state.promise.targetDurationMinutes}-minute ${getModeCopy(state.promise.targetMode)} day. Ready?`;
  }
  if (state.kind === "fulfilled") {
    return "You kept yesterday's promise. I remembered.";
  }
  if (state.kind === "missed") {
    return "Yesterday got away. We can still make today count.";
  }
  return "Your promise thread will wait here when you reconnect.";
}

export function getCtaLabel(state: CompanionPromiseHomeState): string {
  if (state.kind === "missed") {
    return "Start small today";
  }
  return "Start this session";
}
