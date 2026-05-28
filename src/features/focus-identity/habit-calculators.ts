import type { FocusScoreFactors } from "./FocusIdentityEngine-types";

export function calculateConsistencyFactorForInput(
  sessionsLast30Days: number,
  targetPerWeek: number,
  missedDays: number,
): FocusScoreFactors["consistency"] {
  const targetSessions = targetPerWeek * 4;
  const actualConsistency = Math.min(sessionsLast30Days / targetSessions, 1);
  let score = actualConsistency * 100;
  score -= missedDays * 2;
  score = Math.max(0, Math.min(100, score));
  return {
    score: Math.round(score),
    sessionsLast30Days,
    targetSessionsPerWeek: targetPerWeek,
    actualConsistency,
    missedDaysLast30Days: missedDays,
  };
}

export function calculateStreakStabilityFactorForInput(
  currentStreak: number,
  longestStreak: number,
  streakHistory: Array<{
    start: number;
    end: number | null;
    length: number;
  }>,
): FocusScoreFactors["streakStability"] {
  const completedStreaks = streakHistory.filter((s) => s.end !== null);
  const avgLength =
    completedStreaks.length > 0
      ? completedStreaks.reduce((sum, s) => sum + s.length, 0) /
        completedStreaks.length
      : 0;
  const now = Date.now();
  const breaksLast90Days = completedStreaks.filter(
    (s) => now - (s.end ?? 0) < 90 * 24 * 60 * 60 * 1000,
  ).length;
  const breakFrequency = breaksLast90Days / 3;
  let score = 0;
  score += Math.min(currentStreak / 30, 1) * 30;
  score += Math.min(longestStreak / 90, 1) * 20;
  score += Math.min(avgLength / 14, 1) * 25;
  score += Math.max(0, 25 - breakFrequency * 8);
  return {
    score: Math.round(Math.min(100, score)),
    currentStreak,
    longestStreak,
    averageStreakLength: Math.round(avgLength),
    totalStreaksStarted: streakHistory.length,
    streakBreakFrequency: breakFrequency,
  };
}
