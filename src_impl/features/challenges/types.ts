/**
 * Challenges Feature - Domain Types
 *
 * Dependencies:
 * - Seasons (challenge binding)
 * - Economy (reroll costs)
 * - Events (progress tracking)
 * - Rewards (challenge completion rewards)
 */

// ============================================================================
// Core Challenge Types
// ============================================================================

export type ChallengeType = "DAILY" | "WEEKLY" | "EVENT";
export type ChallengeStatus = "ACTIVE" | "COMPLETED" | "CLAIMED" | "EXPIRED" | "REROLLED" | "ABANDONED";
export type ChallengeCategory = "SESSIONS" | "MINUTES" | "STREAK" | "BOSS_DAMAGE" | "SQUAD_ACTIVITY" | "SHOP_PURCHASE" | "LEVEL_UP" | "ACHIEVEMENT" | "SOCIAL";

export interface Challenge {
  id: string;
  seasonId: string;
  type: ChallengeType;
  category: ChallengeCategory;

  // Content
  title: string;
  description: string;
  iconUrl: string | null;

  // Target
  targetValue: number;
  targetType: string;

  // Rewards
  rewardType: string;
  rewardAmount: number;
  rewardItemId: string | null;

  // Availability
  startAt: number | null;
  endAt: number | null;
  isActive: boolean;

  // Difficulty
  difficulty: "EASY" | "MEDIUM" | "HARD" | "EXPERT";
  xpBonus: number; // Percentage bonus

  createdAt: number;
}

export interface ChallengeTemplate {
  id: string;
  category: ChallengeCategory;
  type: ChallengeType;
  titleTemplate: string;
  descriptionTemplate: string;

  // Value ranges for generation
  minTarget: number;
  maxTarget: number;

  // Reward ranges
  minReward: number;
  maxReward: number;
  rewardType: string;

  // Weight for random selection
  weight: number;

  // Requirements
  minLevel: number;
  requiresPremium: boolean;
  requiresSquad: boolean;
}

// ============================================================================
// User Challenge Types
// ============================================================================

export interface UserChallenge {
  id: string;
  userId: string;
  challengeId: string;

  // Progress
  currentValue: number;
  status: ChallengeStatus;

  // Timestamps
  assignedAt: number;
  completedAt: number | null;
  claimedAt: number | null;
  expiresAt: number | null;

  // Reroll tracking
  rerollCount: number;
  rerolledFromId: string | null; // Previous challenge ID if rerolled

  // Tracking
  lastProgressAt: number | null;
  progressHistory: ProgressHistoryEntry[];

  createdAt: number;
}

export interface ProgressHistoryEntry {
  timestamp: number;
  value: number;
  source: string;
  delta: number;
}

export interface UserChallengeSummary {
  challengeId: string;
  title: string;
  description: string;
  category: ChallengeCategory;
  type: ChallengeType;
  difficulty: string;

  // Progress
  currentValue: number;
  targetValue: number;
  progressPercent: number;

  // Status
  status: ChallengeStatus;
  isClaimable: boolean;
  isExpired: boolean;
  expiresInMs: number | null;

  // Rewards
  rewardType: string;
  rewardAmount: number;

  // Reroll
  canReroll: boolean;
  rerollCost: number;
  freeRerollAvailable: boolean;
  rerollCount: number;
}

// ============================================================================
// Reroll Types
// ============================================================================

export interface RerollResult {
  success: boolean;
  oldChallengeId: string;
  newChallengeId: string;
  newChallenge: Challenge | null;
  gemsSpent: number;
  freeRerollUsed: boolean;
  error: string | null;

  // User's remaining status
  remainingGems: number;
  remainingFreeRerollsToday: number;
}

export interface RerollEligibility {
  canReroll: boolean;
  reason: string | null;
  freeRerollAvailable: boolean;
  gemsRequired: number;
  currentGems: number;
  rerollCountToday: number;
  maxRerollsPerDay: number;
}

// ============================================================================
// Challenge Generation Types
// ============================================================================

export interface ChallengeGenerationConfig {
  seasonId: string;
  userId: string;
  userLevel: number;
  isPremium: boolean;
  hasSquad: boolean;
  challengeType: ChallengeType;

  // Daily limits
  dailyChallengeCount: number;
  weeklyChallengeCount: number;
}

export interface GeneratedChallenges {
  daily: Challenge[];
  weekly: Challenge[];
  event: Challenge[];
}

// ============================================================================
// Challenge Completion Types
// ============================================================================

export interface ChallengeCompletionResult {
  success: boolean;
  challengeId: string;
  userId: string;
  completedAt: number;
  rewards: ChallengeReward[];
  xpEarned: number;

  // Side effects
  seasonProgressAdvanced: boolean;
  newTierUnlocked: boolean;

  // Stats
  timeToComplete: number; // ms from assignment
  wasRerolled: boolean;
}

export interface ChallengeReward {
  type: string;
  amount: number;
  itemId: string | null;
  delivered: boolean;
  deliveredAt: number | null;
}

// ============================================================================
// Service Input Types
// ============================================================================

export interface AssignChallengeInput {
  userId: string;
  seasonId: string;
  challengeType: ChallengeType;
  challengeId?: string; // Specific challenge, or auto-generate
}

export interface UpdateChallengeProgressInput {
  userId: string;
  challengeId: string;
  delta: number;
  source: string;
  metadata?: Record<string, unknown>;
}

export interface RerollChallengeInput {
  userId: string;
  challengeId: string;
  usePaidReroll: boolean; // If false and no free available, will fail
  idempotencyKey?: string;
}

export interface ClaimChallengeRewardInput {
  userId: string;
  challengeId: string;
}

// ============================================================================
// Analytics Types
// ============================================================================

export interface ChallengeAnalytics {
  totalChallengesIssued: number;
  completionRate: number;
  averageTimeToComplete: number;
  rerollRate: number;
  claimRate: number;

  // By category
  categoryBreakdown: Record<
    ChallengeCategory,
    {
      issued: number;
      completed: number;
      avgTime: number;
    }
  >;

  // By difficulty
  difficultyBreakdown: Record<
    string,
    {
      issued: number;
      completed: number;
    }
  >;
}

// ============================================================================
// Challenge Engine Types
// ============================================================================

export interface ChallengeEngineState {
  lastDailyGeneration: number;
  lastWeeklyGeneration: number;
  activeDailyChallenges: string[];
  activeWeeklyChallenges: string[];

  // User-specific cache
  userChallengeCache: Map<string, UserChallenge[]>;

  // Templates loaded
  templates: ChallengeTemplate[];
}

export interface ChallengeValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}
