import { captureSilentFailure } from '../../utils/silent-failure';
/**
 * Boss Bounty System
 *
 * Users can spend 50 coins to activate a "Boss Bounty" on their active boss.
 * Bounty effect: next session that deals damage to this boss earns 2× loot drop chance.
 * Multiple users in a squad can stack bounties (4 bounties = 8× loot chance, capped).
 * Bounty expires after 24 hours if no damage dealt.
 *
 * @phase 5.4
 *
 * Dependencies:
 * - Economy/Wallet (atomic transactions - 50 coins)
 * - Boss (encounter tracking, damage application)
 * - Rewards (loot drop chance modification)
 * - Analytics (tracking)
 */

import { z } from 'zod';
import * as Sentry from '@sentry/react-native';
import { spendCurrency } from '../economy/spending-service';
import { eventBus } from '../../events';

// ============================================================================
// Constants
// ============================================================================

export const BOUNTY_COST_COINS = 50;
export const BOUNTY_LOOT_MULTIPLIER = 2; // 2× per bounty
export const MAX_BOUNTY_STACK = 4; // Max 4 bounties (8× loot chance)
export const BOUNTY_DURATION_MS = 24 * 60 * 60 * 1000; // 24 hours

// ============================================================================
// Schemas
// ============================================================================

export const BossBountySchema = z.object({
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
}).strict();

export const PlaceBountyInputSchema = z.object({
  userId: z.string().uuid(),
  encounterId: z.string().uuid(),
  squadId: z.string().uuid().optional(),
}).strict();

export const ConsumeBountyInputSchema = z.object({
  bountyId: z.string().uuid(),
  encounterId: z.string().uuid(),
  damageDealt: z.number().int().min(0),
}).strict();

export const GetBountyStatusInputSchema = z.object({
  encounterId: z.string().uuid(),
  userId: z.string().uuid(),
}).strict();

// ============================================================================
// Types
// ============================================================================

export type BossBounty = z.infer<typeof BossBountySchema>;
export type PlaceBountyInput = z.infer<typeof PlaceBountyInputSchema>;
export type ConsumeBountyInput = z.infer<typeof ConsumeBountyInputSchema>;
export type GetBountyStatusInput = z.infer<typeof GetBountyStatusInputSchema>;

export interface BountyStatus {
  hasActiveBounty: boolean;
  bountyCount: number;
  totalLootMultiplier: number;
  expiresAt: number | null;
  hoursRemaining: number;
  canPlaceBounty: boolean;
  maxStackReached: boolean;
}

export interface PlaceBountyResult {
  success: boolean;
  bountyId: string | null;
  stackCount: number;
  lootMultiplier: number;
  error: { code: string; message: string } | null;
}

// ============================================================================
// Storage (MMKV-based for client-side bounty tracking)
// ============================================================================

const BOUNTY_STORAGE_KEY = (encounterId: string) => `boss_bounties:${encounterId}`;

function getStorage() {
  try {
    const { storage } = require('../../store/mmkv-storage');
    return storage;
  } catch (error) { captureSilentFailure(error, { feature: 'boss', operation: 'ui-fallback', type: 'ui' });
    return null;
  }
}

function saveBounties(encounterId: string, bounties: BossBounty[]): void {
  const storage = getStorage();
  if (!storage) {return;}

  try {
    storage.set(BOUNTY_STORAGE_KEY(encounterId), JSON.stringify(bounties));
  } catch (error) {
    Sentry.captureException(error, {
      tags: { feature: 'boss-bounty', operation: 'save' },
      extra: { encounterId },
    });
  }
}

function loadBounties(encounterId: string): BossBounty[] {
  const storage = getStorage();
  if (!storage) {return [];}

  try {
    const data = storage.getString(BOUNTY_STORAGE_KEY(encounterId));
    if (!data) {return [];}

    const parsed = JSON.parse(data);
    return z.array(BossBountySchema).parse(parsed);
  } catch (error) {
    Sentry.captureException(error, {
      tags: { feature: 'boss-bounty', operation: 'load' },
      extra: { encounterId },
    });
    return [];
  }
}

function clearBounties(encounterId: string): void {
  const storage = getStorage();
  if (!storage) {return;}

  try {
    storage.delete(BOUNTY_STORAGE_KEY(encounterId));
  } catch (error) {
    Sentry.captureException(error, {
      tags: { feature: 'boss-bounty', operation: 'clear' },
      extra: { encounterId },
    });
  }
}

// ============================================================================
// Core Functions
// ============================================================================

/**
 * Get bounty status for an encounter
 */
export function getBountyStatus(
  input: GetBountyStatusInput
): BountyStatus {
  const validated = GetBountyStatusInputSchema.parse(input);
  const now = Date.now();

  const allBounties = loadBounties(validated.encounterId);

  // Filter active (not consumed, not expired) bounties
  const activeBounties = allBounties.filter(
    (b) => !b.consumed && b.expiresAt > now
  );

  const bountyCount = activeBounties.length;
  const hasActiveBounty = bountyCount > 0;
  const maxStackReached = bountyCount >= MAX_BOUNTY_STACK;

  // Calculate loot multiplier (2× per bounty, capped at 4 bounties = 8×)
  const totalLootMultiplier = Math.min(
    bountyCount * BOUNTY_LOOT_MULTIPLIER,
    MAX_BOUNTY_STACK * BOUNTY_LOOT_MULTIPLIER
  );

  // Find earliest expiration
  const earliestExpiry = hasActiveBounty
    ? Math.min(...activeBounties.map((b) => b.expiresAt))
    : null;

  const msRemaining = earliestExpiry ? earliestExpiry - now : 0;
  const hoursRemaining = Math.max(0, Math.floor(msRemaining / (60 * 60 * 1000)));

  // Check if user already has a bounty on this encounter
  const userHasBounty = activeBounties.some(
    (b) => b.userId === validated.userId
  );

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

/**
 * Place a bounty on a boss encounter
 * Costs 50 coins, adds 2× loot multiplier
 */
export async function placeBounty(
  input: PlaceBountyInput
): Promise<PlaceBountyResult> {
  const validated = PlaceBountyInputSchema.parse(input);
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

  const newStackCount = updatedBounties.filter(
    (b) => !b.consumed && b.expiresAt > now
  ).length;
  const newLootMultiplier = Math.min(
    newStackCount * BOUNTY_LOOT_MULTIPLIER,
    MAX_BOUNTY_STACK * BOUNTY_LOOT_MULTIPLIER
  );

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

/**
 * Consume bounties when damage is dealt to the boss
 * Called by the boss damage system when a session deals damage
 * Returns the total loot multiplier to apply
 */
export function consumeBountiesOnDamage(
  encounterId: string,
  damageDealt: number
): { lootMultiplier: number; consumedCount: number; consumedBountyIds: string[] } {
  const now = Date.now();
  const allBounties = loadBounties(encounterId);

  // Find active bounties
  const activeBounties = allBounties.filter(
    (b) => !b.consumed && b.expiresAt > now
  );

  if (activeBounties.length === 0) {
    return { lootMultiplier: 1, consumedCount: 0, consumedBountyIds: [] };
  }

  const consumedBountyIds: string[] = [];

  // Mark bounties as consumed
  const updatedBounties = allBounties.map((bounty) => {
    if (!bounty.consumed && bounty.expiresAt > now) {
      consumedBountyIds.push(bounty.id);
      return {
        ...bounty,
        consumed: true,
        consumedAt: now,
        damageDealtWhenConsumed: damageDealt,
      };
    }
    return bounty;
  });

  // Save updated bounties
  saveBounties(encounterId, updatedBounties);

  // Calculate loot multiplier
  const consumedCount = activeBounties.length;
  const lootMultiplier = Math.min(
    consumedCount * BOUNTY_LOOT_MULTIPLIER,
    MAX_BOUNTY_STACK * BOUNTY_LOOT_MULTIPLIER
  );

  // Cleanup after a delay (keep consumed records briefly for analytics)
  const cleanupTimer = setTimeout(() => clearBounties(encounterId), 60 * 60 * 1000); // 1 hour
  if (typeof cleanupTimer === 'object' && 'unref' in cleanupTimer) {
    cleanupTimer.unref();
  }

  return { lootMultiplier, consumedCount, consumedBountyIds };
}

/**
 * Get all active bounties for an encounter
 * Used for UI display (squad members can see stacked bounties)
 */
export function getActiveBounties(encounterId: string): BossBounty[] {
  const now = Date.now();
  const allBounties = loadBounties(encounterId);

  return allBounties.filter(
    (b) => !b.consumed && b.expiresAt > now
  );
}

/**
 * Check if a user has an active bounty on an encounter
 */
export function userHasActiveBounty(
  encounterId: string,
  userId: string
): boolean {
  const now = Date.now();
  const allBounties = loadBounties(encounterId);

  return allBounties.some(
    (b) => b.userId === userId && !b.consumed && b.expiresAt > now
  );
}

/**
 * Clean up expired bounties
 * Call periodically or when checking status
 */
export function cleanupExpiredBounties(encounterId: string): void {
  const now = Date.now();
  const allBounties = loadBounties(encounterId);

  // Keep only non-expired bounties
  const validBounties = allBounties.filter(
    (b) => b.expiresAt > now || !b.consumed
  );

  if (validBounties.length !== allBounties.length) {
    saveBounties(encounterId, validBounties);
  }
}

/**
 * Get bounty display info for UI
 */
export function getBountyDisplayInfo(
  encounterId: string
): {
  hasBounty: boolean;
  badgeText: string;
  multiplier: string;
  expiresIn: string;
} {
  const status = getBountyStatus({ encounterId, userId: '00000000-0000-0000-0000-000000000000' });

  if (!status.hasActiveBounty) {
    return {
      hasBounty: false,
      badgeText: '',
      multiplier: '',
      expiresIn: '',
    };
  }

  return {
    hasBounty: true,
    badgeText: `🎯 ${status.bountyCount} Bounty${status.bountyCount > 1 ? 'ies' : ''}`,
    multiplier: `${status.totalLootMultiplier}×`,
    expiresIn: `${status.hoursRemaining}h left`,
  };
}
