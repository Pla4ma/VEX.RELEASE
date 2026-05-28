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
  | "experience_points"
  | "currency"
  | "skill_points"
  | "streak_extension"
  | "unlock"
  | "badge"
  | "title"
  | "cosmetic"
  | "boost"
  | "consumable";

export type RewardSource =
  | "completion"
  | "performance"
  | "milestone"
  | "streak"
  | "achievement"
  | "bonus"
  | "event"
  | "challenge";

export interface RewardCondition {
  type: "score" | "time" | "accuracy" | "streak" | "achievement" | "custom";
  operator: "greater_than" | "less_than" | "equals" | "reaches";
  value: number;
  description: string;
}

export interface RewardMetadata {
  rarity: "common" | "rare" | "epic" | "legendary";
  category: string;
  icon?: string;
  color?: string;
  animation?: string;
  sound?: string;
  description: string;
  lore?: string;
}
