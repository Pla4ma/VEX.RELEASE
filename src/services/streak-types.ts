/**
 * Streak domain types.
 * Extracted from streakService.ts to keep files under the 200-line limit.
 */

export interface StreakData {
  currentStreak: number;
  longestStreak: number;
  lastSessionDate: string | null;
  streakHistory: {
    date: string;
    sessionsCompleted: number;
    maintained: boolean;
  }[];
  isAtRisk: boolean;
  hoursRemaining: number;
}

export interface StreakUpdate {
  newStreak: number;
  streakMaintained: boolean;
  streakBroken: boolean;
  newLongestStreak: boolean;
}
