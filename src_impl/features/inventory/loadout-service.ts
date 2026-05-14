/**
 * Loadout Service (Phase 5)
 *
 * Builds loadout options for session setup with real inventory items.
 * Shows compatible consumables, active buffs, and projected impacts.
 *
 * @phase 5
 */

import { getUsableConsumables, getActiveBuffs } from './repository';
import { LoadoutOptionsSchema, LoadoutItemSchema, ActiveBuffSchema, type InventoryItem, type LoadoutOptions, type LoadoutItem, type ActiveBuff } from './schemas';

// ============================================================================
// Compatibility Rules
// ============================================================================

const MODE_RESTRICTIONS: Record<string, string[]> = {
  LIGHT_FOCUS: ['DEEP_WORK_BOOST', 'SPRINT_BOOST'],
  DEEP_WORK: ['LIGHT_FOCUS_BOOST'],
  SPRINT: ['LONG_DURATION_ITEMS'],
  CREATIVE: [],
  STUDY: [],
};

const DURATION_RESTRICTIONS = {
  SHORT: 600, // < 10 minutes
  MEDIUM: 1800, // < 30 minutes
  LONG: 3600, // < 60 minutes
};

/**
 * Check if an item is compatible with the selected session mode and duration
 */
function checkCompatibility(item: InventoryItem, mode: string, durationSeconds: number): { compatible: boolean; reason?: string } {
  // Check mode restrictions
  const modeRestrictions = MODE_RESTRICTIONS[mode] ?? [];
  const itemTags = (item.metadata?.tags as string[]) ?? [];

  for (const restriction of modeRestrictions) {
    if (itemTags.includes(restriction)) {
      return {
        compatible: false,
        reason: `Not compatible with ${mode} mode`,
      };
    }
  }

  // Check duration restrictions
  if (durationSeconds < DURATION_RESTRICTIONS.SHORT) {
    if (itemTags.includes('LONG_DURATION_BOOST')) {
      return {
        compatible: false,
        reason: 'Too short session for this boost',
      };
    }
  }

  // Check if item has uses remaining
  if (item.usesRemaining !== null && item.usesRemaining <= 0) {
    return {
      compatible: false,
      reason: 'No uses remaining',
    };
  }

  return { compatible: true };
}

/**
 * Calculate the projected impact of using an item
 */
function calculateImpact(item: InventoryItem, durationSeconds: number): LoadoutItem['projectedImpact'] {
  const baseMultiplier = 1;
  const metadata = item.metadata ?? {};

  // XP multiplier from item metadata
  const xpBoost = (metadata.xpBoost as number) ?? 0;
  const xpMultiplier = baseMultiplier + xpBoost;

  // Coin multiplier from item metadata
  const coinBoost = (metadata.coinBoost as number) ?? 0;
  const coinMultiplier = baseMultiplier + coinBoost;

  // Streak protection
  const streakProtection = (metadata.streakProtection as boolean) ?? false;

  // Boss damage bonus (scales with duration)
  const bossDamageBase = (metadata.bossDamageBonus as number) ?? 0;
  const bossDamageBonus = Math.floor(bossDamageBase * (durationSeconds / 3600));

  return {
    xpMultiplier,
    coinMultiplier,
    streakProtection,
    bossDamageBonus,
  };
}

/**
 * Calculate summary statistics for the loadout
 */
function calculateSummary(
  items: LoadoutItem[],
  activeBuffs: ActiveBuff[],
): {
  totalItems: number;
  usableItems: number;
  activeBuffs: number;
  projectedXpMultiplier: number;
  projectedCoinMultiplier: number;
  hasStreakProtection: boolean;
} {
  const totalItems = items.length;
  const usableItems = items.filter((i) => i.compatible).length;

  // Calculate combined multipliers from active buffs
  let projectedXpMultiplier = 1;
  let projectedCoinMultiplier = 1;
  let hasStreakProtection = false;

  for (const buff of activeBuffs) {
    projectedXpMultiplier *= buff.effects.xpMultiplier;
    projectedCoinMultiplier *= buff.effects.coinMultiplier;
    if (buff.effects.streakProtection) {
      hasStreakProtection = true;
    }
  }

  return {
    totalItems,
    usableItems,
    activeBuffs: activeBuffs.length,
    projectedXpMultiplier: Math.round(projectedXpMultiplier * 100) / 100,
    projectedCoinMultiplier: Math.round(projectedCoinMultiplier * 100) / 100,
    hasStreakProtection,
  };
}

/**
 * Get offline restrictions for the session
 */
function getOfflineRestrictions(): string[] {
  return ['Wagers require online connection', 'Boss bounty claims require sync', 'Streak insurance requires verification'];
}

// ============================================================================
// Main Loadout Builder
// ============================================================================

/**
 * Build loadout options for session setup
 *
 * Fetches real inventory items and checks compatibility with the
 * selected mode and duration. Returns enriched items with projected
 * impacts and summary statistics.
 */
export async function buildLoadoutOptions(userId: string, mode: string, durationSeconds: number): Promise<LoadoutOptions> {
  // Fetch real inventory data in parallel
  const [inventory, buffs] = await Promise.all([getUsableConsumables(userId).catch(() => [] as InventoryItem[]), getActiveBuffs(userId).catch(() => [] as InventoryItem[])]);

  // Map inventory items to loadout items with compatibility check
  const available = inventory.map((item): LoadoutItem => {
    const compatibility = checkCompatibility(item, mode, durationSeconds);
    const impact = calculateImpact(item, durationSeconds);

    return LoadoutItemSchema.parse({
      id: item.id,
      itemDefinitionId: item.itemDefinitionId,
      name: (item.metadata?.name as string) ?? 'Unknown Item',
      description: (item.metadata?.description as string) ?? '',
      iconUrl: (item.metadata?.iconUrl as string) ?? undefined,
      rarity: (item.metadata?.rarity as string) ?? 'COMMON',
      quantity: item.quantity,
      usesRemaining: item.usesRemaining,
      compatible: compatibility.compatible,
      incompatibilityReason: compatibility.reason,
      projectedImpact: impact,
    });
  });

  // Map active buffs
  const activeBuffs = buffs.map((buff): ActiveBuff => {
    const metadata = buff.metadata ?? {};
    const effects = (metadata.effects as Record<string, unknown>) ?? {};

    return ActiveBuffSchema.parse({
      id: buff.id,
      name: (metadata.name as string) ?? 'Unknown Buff',
      description: (metadata.description as string) ?? '',
      iconUrl: (metadata.iconUrl as string) ?? undefined,
      expiresAt: buff.equippedAt ? (buff.equippedAt as number) + 24 * 60 * 60 * 1000 : null,
      effects: {
        xpMultiplier: (effects.xpMultiplier as number) ?? 1,
        coinMultiplier: (effects.coinMultiplier as number) ?? 1,
        streakProtection: (effects.streakProtection as boolean) ?? false,
        bossDamageBonus: (effects.bossDamageBonus as number) ?? 0,
      },
    });
  });

  // Build and validate the complete loadout options
  const loadout = {
    available,
    activeBuffs,
    summary: calculateSummary(available, activeBuffs),
    offlineRestrictions: getOfflineRestrictions(),
  };

  return LoadoutOptionsSchema.parse(loadout);
}

// ============================================================================
// Hook for React Components
// ============================================================================

import { useQuery } from '@tanstack/react-query';

const LOADOUT_OPTIONS_KEY = 'loadout-options';

/**
 * React hook for fetching loadout options
 */
export function useLoadoutOptions(userId: string | null | undefined, mode: string, durationSeconds: number) {
  return useQuery<LoadoutOptions>({
    queryKey: [LOADOUT_OPTIONS_KEY, userId, mode, durationSeconds],
    queryFn: () => buildLoadoutOptions(userId!, mode, durationSeconds),
    enabled: !!userId && durationSeconds > 0,
    staleTime: 1000 * 30, // 30 seconds
  });
}
