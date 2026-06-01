export type ChallengeType = 'DAILY' | 'WEEKLY' | 'EVENT';
export type ChallengeStatus =
  | 'ACTIVE'
  | 'COMPLETED'
  | 'CLAIMED'
  | 'EXPIRED'
  | 'REROLLED'
  | 'ABANDONED';
export type ChallengeCategory =
  | 'SESSIONS'
  | 'MINUTES'
  | 'STREAK'
  | 'BOSS_DAMAGE'
  | 'SQUAD_ACTIVITY'
  | 'SHOP_PURCHASE'
  | 'LEVEL_UP'
  | 'ACHIEVEMENT'
  | 'SOCIAL';
export interface Challenge {
  id: string;
  seasonId: string;
  type: ChallengeType;
  category: ChallengeCategory;
  title: string;
  description: string;
  iconUrl: string | null;
  targetValue: number;
  targetType: string;
  rewardType: string;
  rewardAmount: number;
  rewardItemId: string | null;
  startAt: number | null;
  endAt: number | null;
  isActive: boolean;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD' | 'EXPERT';
  xpBonus: number;
  createdAt: number;
}
export interface ChallengeTemplate {
  id: string;
  category: ChallengeCategory;
  type: ChallengeType;
  titleTemplate: string;
  descriptionTemplate: string;
  minTarget: number;
  maxTarget: number;
  minReward: number;
  maxReward: number;
  rewardType: string;
  weight: number;
  minLevel: number;
  requiresPremium: boolean;
  requiresSquad: boolean;
}
export interface UserChallenge {
  id: string;
  userId: string;
  challengeId: string;
  currentValue: number;
  status: ChallengeStatus;
  assignedAt: number;
  completedAt: number | null;
  claimedAt: number | null;
  expiresAt: number | null;
  rerollCount: number;
  rerolledFromId: string | null;
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
  currentValue: number;
  targetValue: number;
  progressPercent: number;
  status: ChallengeStatus;
  isClaimable: boolean;
  isExpired: boolean;
  expiresInMs: number | null;
  rewardType: string;
  rewardAmount: number;
  canReroll: boolean;
  rerollCost: number;
  freeRerollAvailable: boolean;
  rerollCount: number;
}
export interface RerollResult {
  success: boolean;
  oldChallengeId: string;
  newChallengeId: string;
  newChallenge: Challenge | null;
  gemsSpent: number;
  freeRerollUsed: boolean;
  error: string | null;
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
export interface ChallengeGenerationConfig {
  seasonId: string;
  userId: string;
  userLevel: number;
  isPremium: boolean;
  hasSquad: boolean;
  challengeType: ChallengeType;
  dailyChallengeCount: number;
  weeklyChallengeCount: number;
}
export interface GeneratedChallenges {
  daily: Challenge[];
  weekly: Challenge[];
  event: Challenge[];
}
export interface ChallengeCompletionResult {
  success: boolean;
  challengeId: string;
  userId: string;
  completedAt: number;
  rewards: ChallengeReward[];
  xpEarned: number;
  seasonProgressAdvanced: boolean;
  newTierUnlocked: boolean;
  timeToComplete: number;
  wasRerolled: boolean;
}
export interface ChallengeReward {
  type: string;
  amount: number;
  itemId: string | null;
  delivered: boolean;
  deliveredAt: number | null;
}
export interface AssignChallengeInput {
  userId: string;
  seasonId: string;
  challengeType: ChallengeType;
  challengeId?: string;
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
  usePaidReroll: boolean;
  idempotencyKey?: string;
}
export interface ClaimChallengeRewardInput {
  userId: string;
  challengeId: string;
}
export interface ChallengeAnalytics {
  totalChallengesIssued: number;
  completionRate: number;
  averageTimeToComplete: number;
  rerollRate: number;
  claimRate: number;
  categoryBreakdown: Record<
    ChallengeCategory,
    { issued: number; completed: number; avgTime: number }
  >;
  difficultyBreakdown: Record<string, { issued: number; completed: number }>;
}
export interface ChallengeEngineState {
  lastDailyGeneration: number;
  lastWeeklyGeneration: number;
  activeDailyChallenges: string[];
  activeWeeklyChallenges: string[];
  userChallengeCache: Map<string, UserChallenge[]>;
  templates: ChallengeTemplate[];
}
export interface ChallengeValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}
