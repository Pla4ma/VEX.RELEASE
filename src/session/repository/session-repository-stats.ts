import type { SessionHistoryEntry, SessionSummary } from "../types";
import { calculateSessionStreaks } from "./SessionStreakCalculator";

export interface SessionStatsResult {
  totalSessions: number;
  completedSessions: number;
  abandonedSessions: number;
  totalFocusTime: number;
  averageSessionDuration: number;
  currentStreak: number;
  longestStreak: number;
}

export function calculateSessionStats(
  history: SessionHistoryEntry[],
  summaries: SessionSummary[],
): SessionStatsResult {
  const completed = history.filter(
    (h) => h.status === "COMPLETED" || h.status === "PARTIAL",
  );
  const abandoned = history.filter(
    (h) => h.status === "ABANDONED" || h.status === "FAILED",
  );
  const totalFocus = summaries.reduce((s, v) => s + v.effectiveDuration, 0);
  const avg = completed.length > 0 ? totalFocus / completed.length : 0;
  const { currentStreak, longestStreak } = calculateSessionStreaks(history);
  return {
    totalSessions: history.length,
    completedSessions: completed.length,
    abandonedSessions: abandoned.length,
    totalFocusTime: totalFocus,
    averageSessionDuration: avg,
    currentStreak,
    longestStreak,
  };
}
