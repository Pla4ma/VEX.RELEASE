// ============================================================================
// Level and XP Types
// ============================================================================
export type XpSource =
  | 'SESSION_COMPLETE'
  | 'STREAK_BONUS'
  | 'BOSS_BONUS'
  | 'SQUAD_BONUS'
  | 'PERFECT_SESSION_BONUS'
  | 'COMEBACK_BONUS'
  | 'DAILY_LOGIN'
  | 'ACHIEVEMENT_UNLOCK'
  | 'LEVEL_UP_REWARD'
  | 'MILESTONE_REWARD'
  | 'PROMOTIONAL';
// ============================================================================
// Level Threshold and Formula Types
// ============================================================================
// ============================================================================
// Unlock and Milestone Types
// ============================================================================
export type UnlockType =
  | 'FEATURE'
  | 'BOSS'
  | 'SHOP_ITEM'
  | 'COSMETIC'
  | 'TITLE'
  | 'GAME_MODE';
export type MilestoneType = 'LEVEL' | 'XP_TOTAL' | 'SESSIONS_COMPLETED' | 'DAYS_ACTIVE';
export type MilestoneRewardType = 'XP' | 'COINS' | 'GEMS' | 'ITEM' | 'TITLE' | 'COSMETIC';

// ============================================================================
// Progression Tier Types
// ============================================================================
// ============================================================================
// Progression Analytics Types
// ============================================================================
// ============================================================================
// Service Response Types
// ============================================================================
export * from "./types.types";
