/**
 * Rewards Validation Utilities
 *
 * Chest validation, reward distribution checks, anti-cheat for rewards.
 *
 * @phase 3 - Deepening: Rewards validation
 */

import { z } from "zod";
import { createDebugger } from "../../../utils/debug";
import { eventBus } from "../../../events";

const debug = createDebugger("rewards:validation");

// ============================================================================
// Schemas
// ============================================================================

export const ChestTierSchema = z.enum(["WOOD", "BRONZE", "SILVER", "GOLD", "PLATINUM", "DIAMOND"]);
export type ChestTier = z.infer<typeof ChestTierSchema>;

export const RewardItemSchema = z.object({
  id: z.string(),
  type: z.enum(["COINS", "GEMS", "XP", "ITEM", "COSMETIC", "BOOST"]),
  amount: z.number().min(0),
  itemId: z.string().optional(),
  rarity: z.enum(["COMMON", "UNCOMMON", "RARE", "EPIC", "LEGENDARY"]).optional(),
});

export type RewardItem = z.infer<typeof RewardItemSchema>;

export const ChestRewardSchema = z.object({
  chestId: z.string().uuid(),
  userId: z.string(),
  tier: ChestTierSchema,
  items: z.array(RewardItemSchema).min(1).max(5),
  totalValue: z.number().min(0),
  openedAt: z.number(),
  sessionId: z.string().optional(),
});

export type ChestReward = z.infer<typeof ChestRewardSchema>;

// ============================================================================
// Tier Value Ranges
// ============================================================================

const TIER_VALUE_RANGES: Record<ChestTier, { min: number; max: number }> = {
  WOOD: { min: 50, max: 150 },
  BRONZE: { min: 100, max: 300 },
  SILVER: { min: 250, max: 600 },
  GOLD: { min: 500, max: 1200 },
  PLATINUM: { min: 1000, max: 2500 },
  DIAMOND: { min: 2000, max: 5000 },
};

const TIER_DROP_RATES: Record<ChestTier, number> = {
  WOOD: 0.4,
  BRONZE: 0.3,
  SILVER: 0.2,
  GOLD: 0.08,
  PLATINUM: 0.015,
  DIAMOND: 0.005,
};

// ============================================================================
// Validation Result Types
// ============================================================================

export interface ValidationResult<T> {
  valid: boolean;
  data?: T;
  violations: RewardViolation[];
  warnings: RewardWarning[];
  manipulationRisk: "NONE" | "LOW" | "MEDIUM" | "HIGH";
}

export interface RewardViolation {
  type: "VALUE_MISMATCH" | "IMPOSSIBLE_DROP" | "RATE_LIMIT" | "DUPLICATE" | "POLICY";
  field: string;
  message: string;
  severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
}

export interface RewardWarning {
  field: string;
  message: string;
  code: string;
}

// ============================================================================
// Core Validation
// ============================================================================

/**
 * Validate chest reward for anti-cheat
 */
export function validateChestReward(
  reward: ChestReward,
  userHistory: {
    recentChests: ChestReward[];
    totalChestsOpened: number;
    rareDropsInLast24h: number;
  },
): ValidationResult<ChestReward> {
  const result: ValidationResult<ChestReward> = {
    valid: true,
    violations: [],
    warnings: [],
    manipulationRisk: "NONE",
  };

  // Schema validation
  const schemaResult = ChestRewardSchema.safeParse(reward);
  if (!schemaResult.success) {
    result.valid = false;
    result.violations.push({
      type: "POLICY",
      field: "reward",
      message: "Invalid reward structure",
      severity: "HIGH",
    });
    result.manipulationRisk = "HIGH";
    return result;
  }

  result.data = schemaResult.data;

  // Check 1: Tier value range
  const tierRange = TIER_VALUE_RANGES[reward.tier];
  if (reward.totalValue < tierRange.min || reward.totalValue > tierRange.max) {
    result.violations.push({
      type: "VALUE_MISMATCH",
      field: "totalValue",
      message: `Value ${reward.totalValue} outside ${reward.tier} tier range (${tierRange.min}-${tierRange.max})`,
      severity: "HIGH",
    });
    result.manipulationRisk = "HIGH";
  }

  // Check 2: Item count per tier
  const maxItemsPerTier: Record<ChestTier, number> = {
    WOOD: 2,
    BRONZE: 2,
    SILVER: 3,
    GOLD: 3,
    PLATINUM: 4,
    DIAMOND: 5,
  };

  if (reward.items.length > maxItemsPerTier[reward.tier]) {
    result.violations.push({
      type: "POLICY",
      field: "items",
      message: `Too many items for ${reward.tier} chest: ${reward.items.length} > ${maxItemsPerTier[reward.tier]}`,
      severity: "MEDIUM",
    });
    result.manipulationRisk = "MEDIUM";
  }

  // Check 3: Drop rate validation for rare tiers
  if (["PLATINUM", "DIAMOND"].includes(reward.tier)) {
    const expectedRate = TIER_DROP_RATES[reward.tier];
    const actualRate = 1 / (userHistory.totalChestsOpened + 1);

    // If getting rare drops too frequently
    if (userHistory.rareDropsInLast24h > 3) {
      result.violations.push({
        type: "IMPOSSIBLE_DROP",
        field: "tier",
        message: `Suspicious rare drop frequency: ${userHistory.rareDropsInLast24h} in 24h`,
        severity: "HIGH",
      });
      result.manipulationRisk = "HIGH";
    }
  }

  // Check 4: Duplicate chest detection
  const recentDuplicate = userHistory.recentChests.find((c) => c.chestId === reward.chestId && c.openedAt > Date.now() - 60000);
  if (recentDuplicate) {
    result.violations.push({
      type: "DUPLICATE",
      field: "chestId",
      message: "Duplicate chest open detected",
      severity: "CRITICAL",
    });
    result.manipulationRisk = "HIGH";
  }

  // Check 5: Item rarity distribution
  validateRarityDistribution(reward, result);

  // Check 6: Time-based validation
  const timeDrift = Date.now() - reward.openedAt;
  if (timeDrift < 0 || timeDrift > 7 * 24 * 60 * 60 * 1000) {
    result.violations.push({
      type: "POLICY",
      field: "openedAt",
      message: "Suspicious chest open timestamp",
      severity: "MEDIUM",
    });
    result.manipulationRisk = "MEDIUM";
  }

  // Finalize
  if (result.violations.length > 0) {
    result.valid = false;

    eventBus.publish("analytics:track", {
      event: "reward_validation_alert",
      properties: {
        userId: reward.userId,
        tier: reward.tier,
        manipulationRisk: result.manipulationRisk,
        violationCount: result.violations.length,
      },
    });
  }

  return result;
}

/**
 * Validate rarity distribution in chest
 */
function validateRarityDistribution(reward: ChestReward, result: ValidationResult<ChestReward>): void {
  const rarityCounts: Record<string, number> = {};

  for (const item of reward.items) {
    const rarity = item.rarity || "COMMON";
    rarityCounts[rarity] = (rarityCounts[rarity] || 0) + 1;
  }

  // Tier-specific rarity rules
  const rarityRules: Record<ChestTier, Record<string, number>> = {
    WOOD: { COMMON: 2, UNCOMMON: 1, RARE: 0, EPIC: 0, LEGENDARY: 0 },
    BRONZE: { COMMON: 2, UNCOMMON: 1, RARE: 0, EPIC: 0, LEGENDARY: 0 },
    SILVER: { COMMON: 2, UNCOMMON: 2, RARE: 1, EPIC: 0, LEGENDARY: 0 },
    GOLD: { COMMON: 2, UNCOMMON: 2, RARE: 1, EPIC: 1, LEGENDARY: 0 },
    PLATINUM: { COMMON: 2, UNCOMMON: 2, RARE: 1, EPIC: 1, LEGENDARY: 1 },
    DIAMOND: { COMMON: 2, UNCOMMON: 2, RARE: 1, EPIC: 1, LEGENDARY: 1 },
  };

  const rules = rarityRules[reward.tier];

  for (const [rarity, count] of Object.entries(rarityCounts)) {
    const maxAllowed = rules[rarity] || 0;
    if (count > maxAllowed) {
      result.violations.push({
        type: "IMPOSSIBLE_DROP",
        field: "items.rarity",
        message: `Too many ${rarity} items in ${reward.tier} chest: ${count} > ${maxAllowed}`,
        severity: "MEDIUM",
      });
      result.manipulationRisk = "MEDIUM";
    }
  }

  // Legendary drops only from Gold+
  if (rarityCounts.LEGENDARY && !["GOLD", "PLATINUM", "DIAMOND"].includes(reward.tier)) {
    result.violations.push({
      type: "IMPOSSIBLE_DROP",
      field: "items.rarity",
      message: `Legendary item in ${reward.tier} chest (requires Gold+))`,
      severity: "HIGH",
    });
    result.manipulationRisk = "HIGH";
  }
}

// ============================================================================
// Daily Login Validation
// ============================================================================

export function validateDailyLogin(
  claim: {
    userId: string;
    day: number;
    claimedAt: number;
    expectedReward: RewardItem;
  },
  userHistory: {
    lastClaimDate: number | null;
    consecutiveDays: number;
    totalClaims: number;
  },
): ValidationResult<void> {
  const result: ValidationResult<void> = {
    valid: true,
    violations: [],
    warnings: [],
    manipulationRisk: "NONE",
  };

  // Check day is valid (1-7)
  if (claim.day < 1 || claim.day > 7) {
    result.valid = false;
    result.violations.push({
      type: "POLICY",
      field: "day",
      message: `Invalid day: ${claim.day} (must be 1-7)`,
      severity: "HIGH",
    });
    result.manipulationRisk = "HIGH";
    return result;
  }

  // Check not claiming same day twice
  if (userHistory.lastClaimDate) {
    const lastClaimDate = new Date(userHistory.lastClaimDate).setHours(0, 0, 0, 0);
    const today = new Date(claim.claimedAt).setHours(0, 0, 0, 0);

    if (lastClaimDate === today) {
      result.valid = false;
      result.violations.push({
        type: "DUPLICATE",
        field: "claimedAt",
        message: "Already claimed today",
        severity: "HIGH",
      });
      result.manipulationRisk = "HIGH";
      return result;
    }

    // Check streak broken
    const dayDifference = (today - lastClaimDate) / (24 * 60 * 60 * 1000);
    if (dayDifference > 1) {
      result.warnings.push({
        field: "consecutiveDays",
        message: `Streak broken: ${dayDifference} days since last claim`,
        code: "STREAK_BROKEN",
      });
    }
  }

  // Validate day matches consecutive days + 1
  const expectedDay = (userHistory.consecutiveDays % 7) + 1;
  if (claim.day !== expectedDay && userHistory.consecutiveDays > 0) {
    result.warnings.push({
      field: "day",
      message: `Day mismatch: claiming day ${claim.day} but expected day ${expectedDay}`,
      code: "DAY_MISMATCH",
    });
  }

  return result;
}

// ============================================================================
// Reward Ledger Validation
// ============================================================================

export function validateLedgerBalance(
  userId: string,
  ledger: {
    transactions: { type: "EARN" | "SPEND"; amount: number; timestamp: number }[];
    currentBalance: number;
  },
): ValidationResult<{ expectedBalance: number; discrepancy: number }> {
  const result: ValidationResult<{ expectedBalance: number; discrepancy: number }> = {
    valid: true,
    violations: [],
    warnings: [],
    manipulationRisk: "NONE",
  };

  // Calculate expected balance
  const earned = ledger.transactions.filter((t) => t.type === "EARN").reduce((sum, t) => sum + t.amount, 0);

  const spent = ledger.transactions.filter((t) => t.type === "SPEND").reduce((sum, t) => sum + t.amount, 0);

  const expectedBalance = earned - spent;
  const discrepancy = Math.abs(expectedBalance - ledger.currentBalance);

  result.data = { expectedBalance, discrepancy };

  if (discrepancy > 0) {
    result.violations.push({
      type: "VALUE_MISMATCH",
      field: "balance",
      message: `Ledger discrepancy: expected ${expectedBalance}, found ${ledger.currentBalance}`,
      severity: discrepancy > 1000 ? "CRITICAL" : "HIGH",
    });
    result.manipulationRisk = discrepancy > 1000 ? "HIGH" : "MEDIUM";
    result.valid = false;

    eventBus.publish("analytics:track", {
      event: "reward_ledger_discrepancy",
      properties: {
        userId,
        expectedBalance,
        actualBalance: ledger.currentBalance,
        discrepancy,
      },
    });
  }

  return result;
}

// ============================================================================
// Export
// ============================================================================

export const RewardsValidation = {
  validateChestReward,
  validateDailyLogin,
  validateLedgerBalance,
  ChestTierSchema,
  RewardItemSchema,
  TIER_VALUE_RANGES,
  TIER_DROP_RATES,
};

export default RewardsValidation;
