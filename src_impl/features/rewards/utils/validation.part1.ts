import { z } from "zod";
import { createDebugger } from "../../../utils/debug";
import { eventBus } from "../../../events";


export const ChestTierSchema = z.enum(['WOOD', 'BRONZE', 'SILVER', 'GOLD', 'PLATINUM', 'DIAMOND']);

export const RewardItemSchema = z.object({
  id: z.string(),
  type: z.enum(['COINS', 'GEMS', 'XP', 'ITEM', 'COSMETIC', 'BOOST']),
  amount: z.number().min(0),
  itemId: z.string().optional(),
  rarity: z.enum(['COMMON', 'UNCOMMON', 'RARE', 'EPIC', 'LEGENDARY']).optional(),
});

export const ChestRewardSchema = z.object({
  chestId: z.string().uuid(),
  userId: z.string(),
  tier: ChestTierSchema,
  items: z.array(RewardItemSchema).min(1).max(5),
  totalValue: z.number().min(0),
  openedAt: z.number(),
  sessionId: z.string().optional(),
});

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
    manipulationRisk: 'NONE',
  };

  // Schema validation
  const schemaResult = ChestRewardSchema.safeParse(reward);
  if (!schemaResult.success) {
    result.valid = false;
    result.violations.push({
      type: 'POLICY',
      field: 'reward',
      message: 'Invalid reward structure',
      severity: 'HIGH',
    });
    result.manipulationRisk = 'HIGH';
    return result;
  }

  result.data = schemaResult.data;

  // Check 1: Tier value range
  const tierRange = TIER_VALUE_RANGES[reward.tier];
  if (reward.totalValue < tierRange.min || reward.totalValue > tierRange.max) {
    result.violations.push({
      type: 'VALUE_MISMATCH',
      field: 'totalValue',
      message: `Value ${reward.totalValue} outside ${reward.tier} tier range (${tierRange.min}-${tierRange.max})`,
      severity: 'HIGH',
    });
    result.manipulationRisk = 'HIGH';
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
      type: 'POLICY',
      field: 'items',
      message: `Too many items for ${reward.tier} chest: ${reward.items.length} > ${maxItemsPerTier[reward.tier]}`,
      severity: 'MEDIUM',
    });
    result.manipulationRisk = 'MEDIUM';
  }

  // Check 3: Drop rate validation for rare tiers
  if (['PLATINUM', 'DIAMOND'].includes(reward.tier)) {
    const expectedRate = TIER_DROP_RATES[reward.tier];
    const actualRate = 1 / (userHistory.totalChestsOpened + 1);

    // If getting rare drops too frequently
    if (userHistory.rareDropsInLast24h > 3) {
      result.violations.push({
        type: 'IMPOSSIBLE_DROP',
        field: 'tier',
        message: `Suspicious rare drop frequency: ${userHistory.rareDropsInLast24h} in 24h`,
        severity: 'HIGH',
      });
      result.manipulationRisk = 'HIGH';
    }
  }

  // Check 4: Duplicate chest detection
  const recentDuplicate = userHistory.recentChests.find((c) => c.chestId === reward.chestId && c.openedAt > Date.now() - 60000);
  if (recentDuplicate) {
    result.violations.push({
      type: 'DUPLICATE',
      field: 'chestId',
      message: 'Duplicate chest open detected',
      severity: 'CRITICAL',
    });
    result.manipulationRisk = 'HIGH';
  }

  // Check 5: Item rarity distribution
  validateRarityDistribution(reward, result);

  // Check 6: Time-based validation
  const timeDrift = Date.now() - reward.openedAt;
  if (timeDrift < 0 || timeDrift > 7 * 24 * 60 * 60 * 1000) {
    result.violations.push({
      type: 'POLICY',
      field: 'openedAt',
      message: 'Suspicious chest open timestamp',
      severity: 'MEDIUM',
    });
    result.manipulationRisk = 'MEDIUM';
  }

  // Finalize
  if (result.violations.length > 0) {
    result.valid = false;

    eventBus.publish('analytics:track', {
      event: 'reward_validation_alert',
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
    manipulationRisk: 'NONE',
  };

  // Check day is valid (1-7)
  if (claim.day < 1 || claim.day > 7) {
    result.valid = false;
    result.violations.push({
      type: 'POLICY',
      field: 'day',
      message: `Invalid day: ${claim.day} (must be 1-7)`,
      severity: 'HIGH',
    });
    result.manipulationRisk = 'HIGH';
    return result;
  }

  // Check not claiming same day twice
  if (userHistory.lastClaimDate) {
    const lastClaimDate = new Date(userHistory.lastClaimDate).setHours(0, 0, 0, 0);
    const today = new Date(claim.claimedAt).setHours(0, 0, 0, 0);

    if (lastClaimDate === today) {
      result.valid = false;
      result.violations.push({
        type: 'DUPLICATE',
        field: 'claimedAt',
        message: 'Already claimed today',
        severity: 'HIGH',
      });
      result.manipulationRisk = 'HIGH';
      return result;
    }

    // Check streak broken
    const dayDifference = (today - lastClaimDate) / (24 * 60 * 60 * 1000);
    if (dayDifference > 1) {
      result.warnings.push({
        field: 'consecutiveDays',
        message: `Streak broken: ${dayDifference} days since last claim`,
        code: 'STREAK_BROKEN',
      });
    }
  }

  // Validate day matches consecutive days + 1
  const expectedDay = (userHistory.consecutiveDays % 7) + 1;
  if (claim.day !== expectedDay && userHistory.consecutiveDays > 0) {
    result.warnings.push({
      field: 'day',
      message: `Day mismatch: claiming day ${claim.day} but expected day ${expectedDay}`,
      code: 'DAY_MISMATCH',
    });
  }

  return result;
}