/**
 * home-query-types — Properly typed interfaces for query data consumed
 * by home hooks and components.
 *
 * Replaces unsafe `as Record<string, unknown>` casts with named types
 * derived from feature schemas.
 */
import type { RiskLevel } from '../../../features/streaks/schemas';
import type {
  SessionRecommendation,
} from '../../../features/ai-coach';

// ---------------------------------------------------------------------------
// Streak summary — shape returned by useStreak / useStreakSummary
// ---------------------------------------------------------------------------
export interface StreakSummaryData {
  id: string;
  userId: string;
  currentDays: number;
  longestDays: number;
  isAtRisk: boolean;
  riskLevel: RiskLevel;
  nextDeadline: number | null;
  frozenUntil: number | null;
  shieldAvailable: boolean;
}

// ---------------------------------------------------------------------------
// Progression — shape returned by useProgression
// ---------------------------------------------------------------------------
export interface ProgressionData {
  id: string;
  userId: string;
  level: number;
  xp: number;
  totalXp: number;
  nextLevelThreshold: number;
  lastLevelUpAt: number | null;
  createdAt: number;
  updatedAt: number;
}

// ---------------------------------------------------------------------------
// Active study plan — shape returned by useActiveStudyPlan
// ---------------------------------------------------------------------------
export interface ActiveStudyPlanData {
  generationId: string;
  contentId: string;
  title: string;
  totalTasks: number;
  completedTasks: number;
  progressPercent: number;
  remainingMinutes: number;
  nextTask: unknown;
}

// ---------------------------------------------------------------------------
// Comeback state — shape returned by useComebackState
// ---------------------------------------------------------------------------
export interface ComebackStateData {
  isComeback: boolean;
  daysAbsent: number;
  streakBefore: number;
  streakNow: number;
  rewardMultiplier: number;
  streakRestoreEligible: boolean;
  message: string;
}

// ---------------------------------------------------------------------------
// Recommendation — extends SessionRecommendation with optional `reason`
// (legacy field from the Zod schema) and `recommendationType` aliased
// as `type` for the home-spine service.
// ---------------------------------------------------------------------------
export type RecommendationForReturnReason = SessionRecommendation;

// ---------------------------------------------------------------------------
// Session completion RPC result — shape returned by the
// `complete_session` Postgres RPC function.
// ---------------------------------------------------------------------------
export interface SessionCompletionResult {
  success: boolean;
  streakAction?: string;
  newStreak?: number;
  xpEarned?: number;
  levelUp?: boolean;
  newLevel?: number;
  [key: string]: unknown;
}
