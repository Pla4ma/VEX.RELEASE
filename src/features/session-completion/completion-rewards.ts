/**
 * Session Completion — Reward Types
 *
 * Types for completion rewards, sources, and conditions.
 */

export interface CompletionReward {
  id: string;
  type: RewardType;
  amount: number;
  source: RewardSource;
  condition: RewardCondition;
  claimed: boolean;
  claimedAt?: Date;
  expiresAt?: Date;
  metadata: RewardMetadata;
}

export type RewardType =
  | 'progress_proof'
  | 'insight'
  | 'momentum_bonus'
  | 'recovery_proof'
  | 'unlock'
  | 'badge'
  | 'title'
  | 'cosmetic'
  | 'boost'
  | 'mode_adaptation'
  // Legacy — internal only, not user-facing
  /** @deprecated Use progress_proof */
  | 'experience_points'
  /** @deprecated Internal infrastructure only */
  | 'currency'
  /** @deprecated Use momentum_bonus */
  | 'skill_points'
  /** @deprecated Use momentum_bonus */
  | 'streak_extension'
  /** @deprecated Internal infrastructure only */
  | 'consumable';

export type RewardSource =
  | 'completion'
  | 'performance'
  | 'milestone'
  | 'momentum'
  | 'insight'
  | 'bonus'
  | 'event'
  | 'weekly_intelligence'
  // Legacy — internal only
  /** @deprecated Use momentum */
  | 'streak'
  /** @deprecated Use insight */
  | 'achievement'
  /** @deprecated Use weekly_intelligence */
  | 'challenge';

export interface RewardCondition {
  type: 'score' | 'time' | 'accuracy' | 'momentum' | 'insight' | 'custom';
  operator: 'greater_than' | 'less_than' | 'equals' | 'reaches';
  value: number;
  description: string;
}

export interface RewardMetadata {
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  category: string;
  icon?: string;
  color?: string;
  animation?: string;
  sound?: string;
  description: string;
}
