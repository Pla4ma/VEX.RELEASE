/**
 * Rewards Feature - Domain Types
 *
 * Dependencies:
 * - Progression (level-up rewards)
 * - Streaks (streak milestone rewards)
 * - Boss (boss defeat rewards)
 * - Sessions (completion rewards)
 * - Economy (currency delivery)
 */

// ============================================================================
// Core Reward Types
// ============================================================================

export interface Reward {
  id: string;
  userId: string;
  type: RewardType;
  amount: number | null;
  itemId: string | null;
  triggerType: RewardTrigger;
  triggerId: string | null;
  status: RewardStatus;
  claimedAt: number | null;
  expiresAt: number | null;
  createdAt: number;
}

export type RewardType = 'XP' | 'COINS' | 'GEMS' | 'ITEM' | 'COSMETIC' | 'TITLE' | 'STREAK_SHIELD' | 'BOOST';

export type RewardStatus = 'PENDING' | 'CLAIMED' | 'EXPIRED' | 'FAILED';

export type RewardTrigger =
  | 'SESSION_COMPLETE'
  | 'STREAK_MILESTONE'
  | 'BOSS_DEFEAT'
  | 'LEVEL_UP'
  | 'ACHIEVEMENT_UNLOCK'
  | 'DAILY_LOGIN'
  | 'COMEBACK'
  | 'PROMOTIONAL';

// ============================================================================
// Reward Ledger Types
// ============================================================================

export interface RewardLedger {
  userId: string;
  totalRewards: number;
  pendingRewards: number;
  claimedRewards: number;
  expiredRewards: number;
  totalXpAwarded: number;
  totalCoinsAwarded: number;
  totalGemsAwarded: number;
  rewards: Reward[];
}

export interface RewardLedgerEntry {
  id: string;
  rewardId: string;
  action: LedgerAction;
  timestamp: number;
  details: Record<string, unknown>;
}

export type LedgerAction = 'CREATED' | 'CLAIMED' | 'EXPIRED' | 'FAILED' | 'REVOKED';

// ============================================================================
// Reward Claim Types
// ============================================================================

export interface RewardClaim {
  rewardId: string;
  userId: string;
  claimedAt: number;
  deliverables: Deliverable[];
  status: ClaimStatus;
}

export interface Deliverable {
  type: DeliverableType;
  amount: number;
  itemId: string | null;
  delivered: boolean;
  deliveredAt: number | null;
}

export type DeliverableType = 'XP' | 'COINS' | 'GEMS' | 'ITEM' | 'COSMETIC' | 'TITLE' | 'SHIELD';

export type ClaimStatus = 'IN_PROGRESS' | 'COMPLETED' | 'PARTIAL' | 'FAILED';

// ============================================================================
// Reward Calculator Types
// ============================================================================

export interface RewardCalculation {
  baseAmount: number;
  multipliers: RewardMultiplier[];
  bonuses: RewardBonus[];
  finalAmount: number;
}

export interface RewardMultiplier {
  source: string;
  value: number;
  description: string;
}

export interface RewardBonus {
  source: string;
  amount: number;
  description: string;
}

// ============================================================================
// Reward Definition Types
// ============================================================================

export interface RewardDefinition {
  id: string;
  triggerType: RewardTrigger;
  rewardType: RewardType;
  baseAmount: number;
  minLevel?: number;
  maxLevel?: number;
  chancePercent?: number;
  cooldownHours?: number;
  stackable: boolean;
}

// ============================================================================
// Milestone Reward Types
// ============================================================================

export interface MilestoneRewardConfig {
  milestoneType: MilestoneType;
  threshold: number;
  rewards: MilestoneRewardItem[];
}

export type MilestoneType = 'STREAK_DAYS' | 'LEVEL' | 'SESSIONS_COMPLETED' | 'BOSS_DEFEATS' | 'DAYS_ACTIVE';

export interface MilestoneRewardItem {
  type: RewardType;
  amount: number;
  itemId: string | null;
  chancePercent: number;
}
