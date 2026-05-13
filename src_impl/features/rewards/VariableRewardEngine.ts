/**
 * VariableRewardEngine
 *
 * Adds a "surprise layer" on top of deterministic base rewards.
 * Implements variable ratio reinforcement for maximum retention.
 *
 * Architecture:
 * - Base rewards (XP, coins) are ALWAYS guaranteed — no surprise
 * - Variable rewards are ADDED ON TOP — creates the dopamine hit
 * - Server-side validation required for anti-cheat
 */

import { z } from 'zod';
import * as Sentry from '@sentry/react-native';

// ============================================================================
// Variable Reward Types
// ============================================================================
// ============================================================================
// Base Probability Distribution (72.8% baseline nothing extra)
// ============================================================================

const BASE_CHANCES: Record<VariableRewardTier, number> = {
  [VariableRewardTier.NONE]: 0.728,
  [VariableRewardTier.COMMON]: 0.15,
  [VariableRewardTier.UNCOMMON]: 0.08,
  [VariableRewardTier.RARE]: 0.03,
  [VariableRewardTier.EPIC]: 0.01,
  [VariableRewardTier.LEGENDARY]: 0.002,
};

// Verify probabilities sum to 1
const totalBaseChance = Object.values(BASE_CHANCES).reduce((a, b) => a + b, 0);
if (Math.abs(totalBaseChance - 1) > 0.0001) {
  throw new Error(`Base chances must sum to 1, got ${totalBaseChance}`);
}

// ============================================================================
// Reward Definitions by Tier
// ============================================================================

const TIER_REWARDS: Record<VariableRewardTier, VariableRewardItem[]> = {
  [VariableRewardTier.NONE]: [],
  [VariableRewardTier.COMMON]: [
    {
      type: 'COINS',
      amount: 0, // Will be calculated as 1.5-2.5x base coins
      name: 'Coin Boost',
      icon: '🪙',
    },
  ],
  [VariableRewardTier.UNCOMMON]: [
    {
      type: 'XP_BOOST',
      amount: 1,
      name: 'XP Boost Item',
      icon: '⚡',
    },
  ],
  [VariableRewardTier.RARE]: [
    {
      type: 'COSMETIC',
      amount: 1,
      name: 'Rare Cosmetic Ingredient',
      icon: '💎',
    },
    {
      type: 'STREAK_SHIELD',
      amount: 1,
      name: 'Streak Shield',
      icon: '🛡️',
    },
  ],
  [VariableRewardTier.EPIC]: [
    {
      type: 'GEMS',
      amount: 25,
      name: 'Gem Bundle',
      icon: '💎',
    },
    {
      type: 'COSMETIC',
      amount: 1,
      name: 'Epic Item',
      icon: '✨',
    },
  ],
  [VariableRewardTier.LEGENDARY]: [
    {
      type: 'COSMETIC',
      amount: 1,
      name: 'Legendary Cosmetic',
      icon: '👑',
    },
    {
      type: 'GEMS',
      amount: 100,
      name: 'Huge Gem Bundle',
      icon: '💎',
    },
    {
      type: 'LEGENDARY_ITEM',
      amount: 1,
      name: 'Legendary Item',
      icon: '🏆',
    },
  ],
};

// ============================================================================
// Modifier Constants
// ============================================================================

const MODIFIER_VALUES = {
  STREAK_BONUS: 0.03, // +3% for streak > 7 days
  S_GRADE_BONUS: 0.05, // +5% for S grade
  BOSS_BONUS: 0.02, // +2% for boss active
  SQUAD_BONUS: 0.02, // +2% for squad session
  PREMIUM_BONUS: 0.03, // +3% for premium
} as const;

// Cap total bonus to prevent 100% drop rates
const MAX_TOTAL_MODIFIER = 0.15; // Max 15% additional chance

// ============================================================================
// Validation Schemas
// ============================================================================
// ============================================================================
// Variable Reward Engine
// ============================================================================
// Export singleton instance
// ============================================================================
// Server-side Validation Helper
// ============================================================================
// ============================================================================
// Convenience Functions
// ============================================================================
export * from "./VariableRewardEngine.types";
export * from "./VariableRewardEngine.part1";
export * from "./VariableRewardEngine.part2";
