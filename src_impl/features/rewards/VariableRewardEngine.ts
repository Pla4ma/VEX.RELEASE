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

import { z } from "zod";
import * as Sentry from "@sentry/react-native";

// ============================================================================
// Variable Reward Types
// ============================================================================

export enum VariableRewardTier {
  NONE = "NONE",
  COMMON = "COMMON",
  UNCOMMON = "UNCOMMON",
  RARE = "RARE",
  EPIC = "EPIC",
  LEGENDARY = "LEGENDARY",
}

export interface VariableRewardModifiers {
  /** Streak > 7 days: +3% to all tiers */
  streakDays: number;
  /** S grade session: +5% to all tiers */
  isSGrade: boolean;
  /** Boss active: +2% to all tiers */
  bossActive: boolean;
  /** Squad session: +2% to all tiers */
  squadSession: boolean;
  /** Premium user: +3% to all tiers */
  isPremium: boolean;
  /** Daily lucky bonus active */
  luckyBonusActive: boolean;
}

export interface VariableRewardResult {
  tier: VariableRewardTier;
  items: VariableRewardItem[];
  rollValue: number; // The random roll (0-1) for transparency
  modifiedChances: Record<VariableRewardTier, number>;
  triggeredModifiers: string[];
}

export interface VariableRewardItem {
  type: "COINS" | "XP_BOOST" | "GEMS" | "STREAK_SHIELD" | "COSMETIC" | "LEGENDARY_ITEM";
  amount: number;
  name: string;
  icon: string;
}

export interface VariableRewardConfig {
  tier: VariableRewardTier;
  baseChance: number;
  description: string;
}

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
      type: "COINS",
      amount: 0, // Will be calculated as 1.5-2.5x base coins
      name: "Coin Boost",
      icon: "🪙",
    },
  ],
  [VariableRewardTier.UNCOMMON]: [
    {
      type: "XP_BOOST",
      amount: 1,
      name: "XP Boost Item",
      icon: "⚡",
    },
  ],
  [VariableRewardTier.RARE]: [
    {
      type: "COSMETIC",
      amount: 1,
      name: "Rare Cosmetic Ingredient",
      icon: "💎",
    },
    {
      type: "STREAK_SHIELD",
      amount: 1,
      name: "Streak Shield",
      icon: "🛡️",
    },
  ],
  [VariableRewardTier.EPIC]: [
    {
      type: "GEMS",
      amount: 25,
      name: "Gem Bundle",
      icon: "💎",
    },
    {
      type: "COSMETIC",
      amount: 1,
      name: "Epic Item",
      icon: "✨",
    },
  ],
  [VariableRewardTier.LEGENDARY]: [
    {
      type: "COSMETIC",
      amount: 1,
      name: "Legendary Cosmetic",
      icon: "👑",
    },
    {
      type: "GEMS",
      amount: 100,
      name: "Huge Gem Bundle",
      icon: "💎",
    },
    {
      type: "LEGENDARY_ITEM",
      amount: 1,
      name: "Legendary Item",
      icon: "🏆",
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

export const VariableRewardModifiersSchema = z.object({
  streakDays: z.number().int().min(0).default(0),
  isSGrade: z.boolean().default(false),
  bossActive: z.boolean().default(false),
  squadSession: z.boolean().default(false),
  isPremium: z.boolean().default(false),
  luckyBonusActive: z.boolean().default(false),
});

export const CalculateVariableRewardInputSchema = z.object({
  userId: z.string().uuid(),
  baseCoins: z.number().int().min(0),
  modifiers: VariableRewardModifiersSchema,
  seed: z.string().optional(), // For deterministic testing/replay
});

export type CalculateVariableRewardInput = z.infer<typeof CalculateVariableRewardInputSchema>;

// ============================================================================
// Variable Reward Engine
// ============================================================================

export class VariableRewardEngine {
  /**
   * Calculate which variable reward tier (if any) the user gets
   */
  calculateReward(input: CalculateVariableRewardInput): VariableRewardResult {
    const validated = CalculateVariableRewardInputSchema.parse(input);

    try {
      // Calculate modifier bonuses
      const { modifiedChances, triggeredModifiers } = this.applyModifiers(BASE_CHANCES, validated.modifiers);

      // Roll for reward tier
      const roll = this.generateRoll(validated.seed);
      const tier = this.determineTier(roll, modifiedChances);

      // Generate reward items for this tier
      const items = this.generateItems(tier, validated.baseCoins, validated.modifiers);

      // Track analytics
      Sentry.addBreadcrumb({
        category: "variable-reward",
        message: `Variable reward rolled: ${tier}`,
        level: tier === VariableRewardTier.LEGENDARY ? "warning" : "info",
        data: {
          userId: validated.userId,
          tier,
          roll,
          modifiers: triggeredModifiers,
        },
      });

      return {
        tier,
        items,
        rollValue: roll,
        modifiedChances,
        triggeredModifiers,
      };
    } catch (error) {
      Sentry.captureException(error, {
        tags: { feature: "variable-reward", operation: "calculate" },
        extra: { userId: validated.userId },
      });

      // Return no reward on error (graceful degradation)
      return {
        tier: VariableRewardTier.NONE,
        items: [],
        rollValue: 0,
        modifiedChances: BASE_CHANCES,
        triggeredModifiers: [],
      };
    }
  }

  /**
   * Apply modifiers to base chances
   * Returns modified chances and list of triggered modifier names
   */
  private applyModifiers(
    baseChances: Record<VariableRewardTier, number>,
    modifiers: VariableRewardModifiers,
  ): {
    modifiedChances: Record<VariableRewardTier, number>;
    triggeredModifiers: string[];
  } {
    let totalModifier = 0;
    const triggeredModifiers: string[] = [];

    // Calculate each modifier
    if (modifiers.streakDays > 7) {
      totalModifier += MODIFIER_VALUES.STREAK_BONUS;
      triggeredModifiers.push(`Streak Bonus (${modifiers.streakDays} days)`);
    }

    if (modifiers.isSGrade) {
      totalModifier += MODIFIER_VALUES.S_GRADE_BONUS;
      triggeredModifiers.push("S Grade Bonus");
    }

    if (modifiers.bossActive) {
      totalModifier += MODIFIER_VALUES.BOSS_BONUS;
      triggeredModifiers.push("Boss Active Bonus");
    }

    if (modifiers.squadSession) {
      totalModifier += MODIFIER_VALUES.SQUAD_BONUS;
      triggeredModifiers.push("Squad Session Bonus");
    }

    if (modifiers.isPremium) {
      totalModifier += MODIFIER_VALUES.PREMIUM_BONUS;
      triggeredModifiers.push("Premium Bonus");
    }

    // Cap total modifier
    totalModifier = Math.min(totalModifier, MAX_TOTAL_MODIFIER);

    // Apply modifier: reduce NONE chance, distribute to other tiers
    const modifiedChances: Record<VariableRewardTier, number> = { ...baseChances };

    // Take from NONE pool and distribute to reward tiers proportionally
    const rewardTiers = [VariableRewardTier.COMMON, VariableRewardTier.UNCOMMON, VariableRewardTier.RARE, VariableRewardTier.EPIC, VariableRewardTier.LEGENDARY];

    const originalNoneChance = baseChances[VariableRewardTier.NONE];
    const newNoneChance = Math.max(0, originalNoneChance - totalModifier);
    const chanceToDistribute = originalNoneChance - newNoneChance;

    modifiedChances[VariableRewardTier.NONE] = newNoneChance;

    // Distribute to reward tiers based on their relative weights
    const totalRewardWeight = rewardTiers.reduce((sum, tier) => sum + baseChances[tier], 0);

    for (const tier of rewardTiers) {
      const weight = baseChances[tier] / totalRewardWeight;
      modifiedChances[tier] = baseChances[tier] + chanceToDistribute * weight;
    }

    return { modifiedChances, triggeredModifiers };
  }

  /**
   * Generate a random roll (0-1)
   * Supports seed for deterministic testing
   */
  private generateRoll(seed?: string): number {
    if (seed) {
      // Seeded random for testing/replay
      return this.seededRandom(seed);
    }
    return Math.random();
  }

  /**
   * Simple seeded random generator (Mulberry32)
   */
  private seededRandom(seed: string): number {
    // Hash seed string to number
    let hash = 0;
    for (let i = 0; i < seed.length; i++) {
      const char = seed.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash;
    }

    // Mulberry32 algorithm
    let t = (hash += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }

  /**
   * Determine which tier the roll corresponds to
   */
  private determineTier(roll: number, chances: Record<VariableRewardTier, number>): VariableRewardTier {
    let cumulative = 0;

    const tiers = [VariableRewardTier.LEGENDARY, VariableRewardTier.EPIC, VariableRewardTier.RARE, VariableRewardTier.UNCOMMON, VariableRewardTier.COMMON, VariableRewardTier.NONE];

    for (const tier of tiers) {
      cumulative += chances[tier];
      if (roll < cumulative) {
        return tier;
      }
    }

    return VariableRewardTier.NONE;
  }

  /**
   * Generate reward items for the given tier
   */
  private generateItems(tier: VariableRewardTier, baseCoins: number, modifiers: VariableRewardModifiers): VariableRewardItem[] {
    const templateItems = TIER_REWARDS[tier];

    if (templateItems.length === 0) {
      return [];
    }

    // Select random item from tier (or all for some tiers)
    const selectedTemplates =
      tier === VariableRewardTier.LEGENDARY
        ? templateItems // Give all legendary items
        : [templateItems[Math.floor(Math.random() * templateItems.length)]];

    return selectedTemplates.map((template) => {
      let amount = template.amount;

      // Calculate coin multiplier for COMMON tier
      if (tier === VariableRewardTier.COMMON && template.type === "COINS") {
        const multiplier = 1.5 + Math.random() * 1.0; // 1.5x to 2.5x
        amount = Math.floor(baseCoins * multiplier);
      }

      // Lucky bonus: double the amount
      if (modifiers.luckyBonusActive) {
        amount *= 2;
      }

      return {
        ...template,
        amount,
      };
    });
  }

  /**
   * Get the expected value stats for display/debugging
   */
  getExpectedValueStats(baseCoins: number): {
    tier: VariableRewardTier;
    chance: number;
    expectedValue: number;
  }[] {
    return Object.entries(BASE_CHANCES).map(([tier, chance]) => {
      const items = TIER_REWARDS[tier as VariableRewardTier];
      let expectedValue = 0;

      if (tier === VariableRewardTier.COMMON) {
        // Average 2x multiplier on base coins
        expectedValue = baseCoins * 2 * chance;
      } else {
        // Sum of item values
        expectedValue =
          items.reduce((sum, item) => {
            // Rough value mapping for display
            const valueMap: Record<string, number> = {
              COINS: item.amount,
              GEMS: item.amount * 10, // 1 gem ≈ 10 coins
              XP_BOOST: 50,
              STREAK_SHIELD: 100,
              COSMETIC: 200,
              LEGENDARY_ITEM: 500,
            };
            return sum + (valueMap[item.type] || 0);
          }, 0) * chance;
      }

      return {
        tier: tier as VariableRewardTier,
        chance,
        expectedValue: Math.floor(expectedValue),
      };
    });
  }

  /**
   * Simulate many rolls for testing probability distributions
   */
  simulateDistribution(rollCount: number, modifiers: VariableRewardModifiers): Record<VariableRewardTier, number> {
    const results: Record<VariableRewardTier, number> = {
      [VariableRewardTier.NONE]: 0,
      [VariableRewardTier.COMMON]: 0,
      [VariableRewardTier.UNCOMMON]: 0,
      [VariableRewardTier.RARE]: 0,
      [VariableRewardTier.EPIC]: 0,
      [VariableRewardTier.LEGENDARY]: 0,
    };

    const { modifiedChances } = this.applyModifiers(BASE_CHANCES, modifiers);

    for (let i = 0; i < rollCount; i++) {
      const roll = Math.random();
      const tier = this.determineTier(roll, modifiedChances);
      results[tier]++;
    }

    return results;
  }
}

// Export singleton instance
export const variableRewardEngine = new VariableRewardEngine();

// ============================================================================
// Server-side Validation Helper
// ============================================================================

/**
 * Validates a variable reward result server-side for anti-cheat
 * This should be called from Supabase Edge Function
 */
export function validateVariableRewardServerSide(clientResult: VariableRewardResult, serverModifiers: VariableRewardModifiers, serverSeed: string): { valid: boolean; reason?: string } {
  // Re-create engine with same seed
  const serverEngine = new VariableRewardEngine();

  // Recalculate with server's data
  const serverResult = serverEngine.calculateReward({
    userId: "00000000-0000-4000-8000-000000000000",
    baseCoins: 100, // dummy - we only care about tier validation
    modifiers: serverModifiers,
    seed: serverSeed,
  });

  // Client and server should get same tier (if using seed)
  // Or at least within reasonable probability bounds
  if (clientResult.tier !== serverResult.tier) {
    return {
      valid: false,
      reason: `Tier mismatch: client=${clientResult.tier}, server=${serverResult.tier}`,
    };
  }

  // Validate roll is within expected range
  if (clientResult.rollValue < 0 || clientResult.rollValue > 1) {
    return {
      valid: false,
      reason: `Invalid roll value: ${clientResult.rollValue}`,
    };
  }

  return { valid: true };
}

// ============================================================================
// Convenience Functions
// ============================================================================

/**
 * Quick calculate for session completion
 */
export function calculateSessionVariableReward(
  userId: string,
  baseCoins: number,
  sessionData: {
    streakDays: number;
    grade: string;
    bossActive: boolean;
    squadMode: boolean;
    isPremium: boolean;
  },
): VariableRewardResult {
  return variableRewardEngine.calculateReward({
    userId,
    baseCoins,
    modifiers: {
      streakDays: sessionData.streakDays,
      isSGrade: sessionData.grade === "S",
      bossActive: sessionData.bossActive,
      squadSession: sessionData.squadMode,
      isPremium: sessionData.isPremium,
      luckyBonusActive: false, // Set by caller if applicable
    },
  });
}
