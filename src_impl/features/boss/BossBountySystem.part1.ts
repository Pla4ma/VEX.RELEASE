import { captureSilentFailure } from "../../utils/silent-failure";
import { z } from "zod";
import * as Sentry from "@sentry/react-native";
import { spendCurrency } from "../economy/spending-service";
import { eventBus } from "../../events";
import { featureFlags } from "../../feature-flags/FeatureFlagEngine";


export const BOUNTY_COST_COINS = 50;

export const BOUNTY_LOOT_MULTIPLIER = 2;

export const MAX_BOUNTY_STACK = 4;

export const BOUNTY_DURATION_MS = 24 * 60 * 60 * 1000;

export const BossBountySchema = z
  .object({
    id: z.string().uuid(),
    encounterId: z.string().uuid(),
    userId: z.string().uuid(),
    squadId: z.string().uuid().nullable(),
    costCoins: z.number().int().positive(),
    createdAt: z.number(),
    expiresAt: z.number(),
    consumed: z.boolean().default(false),
    consumedAt: z.number().nullable(),
    damageDealtWhenConsumed: z.number().int().nullable(),
  })
  .strict();

export const PlaceBountyInputSchema = z
  .object({
    userId: z.string().uuid(),
    encounterId: z.string().uuid(),
    squadId: z.string().uuid().optional(),
  })
  .strict();

export const ConsumeBountyInputSchema = z
  .object({
    bountyId: z.string().uuid(),
    encounterId: z.string().uuid(),
    damageDealt: z.number().int().min(0),
  })
  .strict();

export const GetBountyStatusInputSchema = z
  .object({
    encounterId: z.string().uuid(),
    userId: z.string().uuid(),
  })
  .strict();

export function getBountyStatus(input: GetBountyStatusInput): BountyStatus {
  const validated = GetBountyStatusInputSchema.parse(input);
  if (!isBossBountyEnabled()) {
    return {
      hasActiveBounty: false,
      bountyCount: 0,
      totalLootMultiplier: 1,
      expiresAt: null,
      hoursRemaining: 0,
      canPlaceBounty: false,
      maxStackReached: false,
    };
  }
  const now = Date.now();

  const allBounties = loadBounties(validated.encounterId);

  // Filter active (not consumed, not expired) bounties
  const activeBounties = allBounties.filter((b) => !b.consumed && b.expiresAt > now);

  const bountyCount = activeBounties.length;
  const hasActiveBounty = bountyCount > 0;
  const maxStackReached = bountyCount >= MAX_BOUNTY_STACK;

  // Calculate loot multiplier (2× per bounty, capped at 4 bounties = 8×)
  const totalLootMultiplier = Math.min(bountyCount * BOUNTY_LOOT_MULTIPLIER, MAX_BOUNTY_STACK * BOUNTY_LOOT_MULTIPLIER);

  // Find earliest expiration
  const earliestExpiry = hasActiveBounty ? Math.min(...activeBounties.map((b) => b.expiresAt)) : null;

  const msRemaining = earliestExpiry ? earliestExpiry - now : 0;
  const hoursRemaining = Math.max(0, Math.floor(msRemaining / (60 * 60 * 1000)));

  // Check if user already has a bounty on this encounter
  const userHasBounty = activeBounties.some((b) => b.userId === validated.userId);

  return {
    hasActiveBounty,
    bountyCount,
    totalLootMultiplier,
    expiresAt: earliestExpiry,
    hoursRemaining,
    canPlaceBounty: !userHasBounty && !maxStackReached,
    maxStackReached,
  };
}

export async function placeBounty(input: PlaceBountyInput): Promise<PlaceBountyResult> {
  const validated = PlaceBountyInputSchema.parse(input);
  if (!isBossBountyEnabled()) {
    return {
      success: false,
      bountyId: null,
      stackCount: 0,
      lootMultiplier: 1,
      error: {
        code: 'FEATURE_DISABLED',
        message: 'Boss bounties are disabled',
      },
    };
  }
  const now = Date.now();

  // Check current status
  const status = getBountyStatus({
    encounterId: validated.encounterId,
    userId: validated.userId,
  });

  if (status.maxStackReached) {
    return {
      success: false,
      bountyId: null,
      stackCount: status.bountyCount,
      lootMultiplier: status.totalLootMultiplier,
      error: {
        code: 'MAX_STACK_REACHED',
        message: 'Maximum bounty stack reached (4 bounties)',
      },
    };
  }

  // Check if user already has a bounty on this encounter
  if (!status.canPlaceBounty) {
    return {
      success: false,
      bountyId: null,
      stackCount: status.bountyCount,
      lootMultiplier: status.totalLootMultiplier,
      error: {
        code: 'ALREADY_ACTIVE',
        message: 'You already have an active bounty on this boss',
      },
    };
  }

  // Attempt atomic spend
  const spendResult = await spendCurrency({
    userId: validated.userId,
    currency: 'COINS',
    amount: BOUNTY_COST_COINS,
    sink: 'BOSS_BOUNTY',
    description: 'Boss Bounty placed',
    metadata: {
      encounterId: validated.encounterId,
      stackPosition: status.bountyCount + 1,
    },
  });

  if (!spendResult.success) {
    return {
      success: false,
      bountyId: null,
      stackCount: status.bountyCount,
      lootMultiplier: status.totalLootMultiplier,
      error: {
        code: spendResult.error?.code || 'BOUNTY_FAILED',
        message: spendResult.error?.message || 'Failed to place bounty',
      },
    };
  }

  // Create bounty record
  const bounty: BossBounty = {
    id: crypto.randomUUID(),
    encounterId: validated.encounterId,
    userId: validated.userId,
    squadId: validated.squadId || null,
    costCoins: BOUNTY_COST_COINS,
    createdAt: now,
    expiresAt: now + BOUNTY_DURATION_MS,
    consumed: false,
    consumedAt: null,
    damageDealtWhenConsumed: null,
  };

  // Save bounty
  const existingBounties = loadBounties(validated.encounterId);
  const updatedBounties = [...existingBounties, bounty];
  saveBounties(validated.encounterId, updatedBounties);

  const newStackCount = updatedBounties.filter((b) => !b.consumed && b.expiresAt > now).length;
  const newLootMultiplier = Math.min(newStackCount * BOUNTY_LOOT_MULTIPLIER, MAX_BOUNTY_STACK * BOUNTY_LOOT_MULTIPLIER);

  // Emit event
  eventBus.publish('economy:boss_bounty_placed', {
    userId: validated.userId,
    encounterId: validated.encounterId,
    costCoins: BOUNTY_COST_COINS,
    stackCount: newStackCount,
    lootMultiplier: newLootMultiplier,
  });

  // Analytics
  Sentry.addBreadcrumb({
    message: 'Boss bounty placed',
    category: 'economy',
    data: {
      userId: validated.userId,
      encounterId: validated.encounterId,
      costCoins: BOUNTY_COST_COINS,
      stackCount: newStackCount,
    },
  });

  return {
    success: true,
    bountyId: bounty.id,
    stackCount: newStackCount,
    lootMultiplier: newLootMultiplier,
    error: null,
  };
}