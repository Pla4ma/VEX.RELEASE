/**
 * Streaks Feature - Domain Types
 *
 * Dependencies:
 * - Sessions (qualifying sessions increment streaks)
 * - Rewards (streak milestone rewards)
 * - Progression (streak XP bonuses)
 * - Analytics (streak events tracked)
 * - Notifications (streak reminders)
 */

// ============================================================================
// Core Streak Types
// ============================================================================

export interface Streak {
  id: string;
  userId: string;
  currentDays: number;
  longestDays: number;
  lastQualifyingSessionAt: number | null;
  currentDayCompletedAt: number | null;
  shieldsAvailable: number;
  gracePeriodUsed: boolean;
  timezone: string;
  createdAt: number;
  updatedAt: number;
}

export interface StreakSummary {
  id: string;
  userId: string;
  currentDays: number;
  longestDays: number;
  isAtRisk: boolean;
  riskLevel: RiskLevel;
  nextDeadline: number | null;
  shieldAvailable: boolean;
}

export type RiskLevel = 'NONE' | 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

// ============================================================================
// Streak Milestone Types
// ============================================================================

export interface StreakMilestone {
  id: string;
  days: number;
  name: string;
  description: string;
  rewardType: MilestoneRewardType;
  rewardAmount: number;
  rewardItemId: string | null;
  badgeId: string | null;
  achieved: boolean;
  achievedAt: number | null;
}

export type MilestoneRewardType = 'XP' | 'COINS' | 'GEMS' | 'ITEM' | 'BADGE' | 'STREAK_SHIELD';

// ============================================================================
// Streak Shield Types
// ============================================================================

export interface StreakShield {
  id: string;
  userId: string;
  source: ShieldSource;
  used: boolean;
  usedAt: number | null;
  expiresAt: number | null;
  createdAt: number;
}

export type ShieldSource = 'MILESTONE_30' | 'BOSS_DEFEAT' | 'SHOP_PURCHASE' | 'PROMOTIONAL';

// ============================================================================
// Streak Protection Types
// ============================================================================

export interface StreakProtection {
  userId: string;
  shieldsAvailable: number;
  frozenUntil: number | null;
  graceUsed: boolean;
}

// ============================================================================
// Streak Recovery Types
// ============================================================================

export interface StreakRecovery {
  userId: string;
  previousStreak: number;
  restoredTo: number;
  restoredAt: number;
  source: RecoverySource;
}

export type RecoverySource = 'SHIELD' | 'PURCHASE' | 'SPECIAL_EVENT' | 'MANUAL';

export interface ComebackState {
  isComeback: boolean;
  daysAbsent: number;
  streakBefore: number;
  streakNow: number;
  rewardMultiplier: number;
  streakRestoreEligible: boolean;
  message: string;
}

// ============================================================================
// Streak Calendar Types
// ============================================================================

export interface StreakCalendarDay {
  date: string;
  hasSession: boolean;
  sessionCount: number;
  totalDuration: number;
  qualifiesForStreak: boolean;
}

export interface StreakCalendar {
  month: number;
  year: number;
  days: StreakCalendarDay[];
  currentStreakDays: number;
  longestStreakInMonth: number;
}

// ============================================================================
// Qualifying Session Types
// ============================================================================

export interface QualifyingSession {
  sessionId: string;
  completedAt: number;
  duration: number;
  qualityScore: number;
}

// ============================================================================
// Streak Engine Types
// ============================================================================

export interface StreakEngineResult {
  action: StreakAction;
  previousStreak: number;
  newStreak: number;
  milestoneReached: StreakMilestone | null;
  shieldUsed: boolean;
}

export type StreakAction =
  | 'INCREMENTED'
  | 'MAINTAINED'
  | 'BROKEN'
  | 'SHIELD_PROTECTED'
  | 'FROZEN'
  | 'COME_BACK'
  | 'ALREADY_TODAY';

// ============================================================================
// Streak Multiplier Types
// ============================================================================

export interface StreakMultiplier {
  days: number;
  multiplier: number;
  xpBonus: number;
  label: string;
}

// ============================================================================
// Service Input Types
// ============================================================================

export interface RecordSessionInput {
  userId: string;
  sessionId: string;
  completedAt: number;
  duration: number;
  qualityScore: number;
}

export interface UseShieldInput {
  userId: string;
  reason: 'MANUAL' | 'AUTO';
}

export interface FreezeStreakInput {
  userId: string;
  durationHours: number;
}

export interface RestoreStreakInput {
  userId: string;
  targetDays: number;
  source: RecoverySource;
}
