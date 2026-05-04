/**
 * Milestones Feature - Domain Types
 *
 * Manages milestone tracking and unlock system
 */

// ============================================================================
// Core Milestone Types
// ============================================================================

export interface Milestone {
  id: string;
  type: MilestoneType;
  category: MilestoneCategory;
  threshold: number;
  name: string;
  description: string;
  iconUrl: string | null;
  rewardType: MilestoneRewardType;
  rewardAmount: number;
  rewardItemId: string | null;
  unlockedAt: number | null;
}

export type MilestoneType =
  | 'LEVEL'
  | 'XP_TOTAL'
  | 'STREAK_DAYS'
  | 'SESSIONS_COMPLETED'
  | 'FOCUS_TIME'
  | 'CHALLENGES_COMPLETED'  // Renamed from BOSS_DEFEATS
  | 'DAYS_ACTIVE'
  | 'ACHIEVEMENTS_UNLOCKED';

export type MilestoneCategory = 'PROGRESSION' | 'STREAK' | 'SESSION' | 'CHALLENGE' | 'SOCIAL';  // Renamed from BOSS

export type MilestoneRewardType = 'XP' | 'COINS' | 'GEMS' | 'ITEM' | 'BADGE' | 'TITLE' | 'COSMETIC';

// ============================================================================
// Milestone Progress Types
// ============================================================================

export interface MilestoneProgress {
  milestoneId: string;
  currentValue: number;
  threshold: number;
  percentComplete: number;
  completed: boolean;
  completedAt: number | null;
}

export interface MilestoneWithProgress extends Milestone {
  progress: MilestoneProgress;
}

// ============================================================================
// Unlock System Types
// ============================================================================

export interface Unlock {
  id: string;
  type: UnlockType;
  featureId: string;
  name: string;
  description: string;
  minLevel: number;
  requiredMilestoneId: string | null;
  unlockedAt: number | null;
}

export type UnlockType =
  | 'FEATURE'
  | 'CHALLENGE'  // Renamed from BOSS
  | 'SHOP_ITEM'
  | 'MODE'       // Renamed from GAME_MODE
  | 'COSMETIC'
  | 'TITLE'
  | 'CIRCLE_FEATURE';  // Renamed from SQUAD_FEATURE

export interface UnlockRequirement {
  type: 'LEVEL' | 'MILESTONE' | 'CHALLENGE_COMPLETE';  // Renamed from BOSS_DEFEAT
  targetId: string;
  value: number;
}

// ============================================================================
// Milestone Timeline Types
// ============================================================================

export interface MilestoneTimeline {
  userId: string;
  milestones: Array<{
    milestone: Milestone;
    progress: MilestoneProgress;
    position: number;
  }>;
  completedCount: number;
  totalCount: number;
  nextMilestone: Milestone | null;
}
