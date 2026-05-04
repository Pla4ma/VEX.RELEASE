/**
 * Season Journey - Domain Types
 *
 * Simplified progression system (renamed from Battle Pass).
 * 20-30 meaningful milestones instead of 100+ grindy tiers.
 *
 * Phase 3: Gamification Simplification
 */

// ============================================================================
// Core Journey Types
// ============================================================================

export interface SeasonJourney {
  id: string;
  seasonId: string;
  milestoneCount: number; // 20-30 (was tierCount)
  xpPerMilestone: number;
  theme: string | null;
  createdAt: number;
  startsAt: number;
  endsAt: number;
}

export interface JourneyMilestone {
  id: string;
  seasonId: string;
  milestoneNumber: number; // 1-30 (was tierNumber)
  xpRequired: number;

  // Everyone gets the same reward (simplified - no premium/free split)
  rewardId: string | null;
  rewardType: JourneyRewardType | null;
  rewardAmount: number | null;

  // Visual
  iconUrl: string | null;
  isMajorMilestone: boolean; // Special celebration at 10, 20, 30

  // Milestone theme
  name: string;
  description: string;
}

export type JourneyRewardType =
  | 'XP'
  | 'COINS'
  | 'GEMS'
  | 'ITEM'
  | 'COSMETIC'
  | 'TITLE'
  | 'BOOST'
  | 'STREAK_SHIELD';

// ============================================================================
// User Journey Progress
// ============================================================================

export interface UserJourney {
  id: string;
  userId: string;
  seasonId: string;
  currentMilestone: number; // 0-30 (was currentTier)
  milestoneXp: number;
  totalXp: number;
  claimedMilestones: number[]; // Simplified - no premium/free split
  createdAt: number;
  updatedAt: number;
}

export interface UserJourneySummary {
  seasonId: string;
  currentMilestone: number;
  milestoneProgress: number; // 0-100 within current milestone
  totalProgress: number; // 0-100 across all milestones
  canClaim: boolean;
  unclaimedMilestones: number;
  nextMilestoneUnlocked: boolean;
  xpToNextMilestone: number;
  daysRemaining: number;
}

// ============================================================================
// Milestone Claim Types
// ============================================================================

export type MilestoneStatus = 'AVAILABLE' | 'CLAIMED' | 'LOCKED';

export interface MilestoneState {
  milestoneNumber: number;
  status: MilestoneStatus;
  reward: MilestoneReward | null;
}

export interface MilestoneReward {
  type: JourneyRewardType;
  amount: number;
  itemId: string | null;
  name: string;
  iconUrl: string | null;
}

// ============================================================================
// Journey Season Types
// ============================================================================

export interface JourneySeason {
  id: string;
  name: string;
  theme: string;
  startDate: number;
  endDate: number;
  milestoneCount: number;
  isActive: boolean;
  totalXpRequired: number;
}

export interface SeasonSummary {
  activeSeason: JourneySeason | null;
  nextSeason: JourneySeason | null;
  userProgress: UserJourneySummary | null;
  daysUntilNextSeason: number | null;
}

// ============================================================================
// Migration Types (for data migration from Battle Pass)
// ============================================================================

export interface BattlePassMigration {
  oldBattlePassId: string;
  newJourneyId: string;
  tierToMilestoneMap: Record<number, number>; // Map old tiers to new milestones
  premiumRewardsConverted: boolean;
}
