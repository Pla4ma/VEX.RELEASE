/**
 * Streak Event Definitions
 *
 * Event interfaces for the streak system: updates, breaks, risk alerts,
 * session completions, milestones, and freeze usage.
 */

export type StreakEventType =
  | "streak:updated"
  | "streak:broken"
  | "streak:session_completed"
  | "streak:milestone"
  | "streak:at_risk"
  | "streak:freeze_used";

export interface StreakUpdatedEvent {
  userId: string;
  currentStreak: number;
  previousStreak: number;
  bestStreak: number;
  sessionId?: string;
  multiplier: number;
}

export interface StreakBrokenEvent {
  userId: string;
  previousStreak: number;
  wasComeback: boolean;
  canRecover: boolean;
  recoveryDeadline?: number;
}

export interface StreakAtRiskEvent {
  userId: string;
  currentStreak: number;
  hoursRemaining: number;
  lastSessionAt: number;
}

export interface StreakFreezeUsedEvent {
  userId: string;
  frozenAt: number;
  streakBefore: number;
  expiresAt: number;
}
