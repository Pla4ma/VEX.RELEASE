/**
 * useStudySession - Session helpers
 *
 * Extracted to keep main file under 200 lines.
 */

import type { SessionState } from "../../../session/types";

export const studySessionKeys = {
  all: ["studySession"] as const,
  current: () => [...studySessionKeys.all, "current"] as const,
  history: () => [...studySessionKeys.all, "history"] as const,
  stats: () => [...studySessionKeys.all, "stats"] as const,
  active: () => [...studySessionKeys.all, "active"] as const,
};

export function getSessionMode(state: SessionState): string {
  return state.config?.sessionMode ?? "unknown";
}

export function getExpectedDuration(state: SessionState | undefined): number {
  return state?.config?.duration ?? 0;
}
