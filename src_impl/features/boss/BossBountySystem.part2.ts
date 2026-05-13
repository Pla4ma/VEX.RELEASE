import { captureSilentFailure } from "../../utils/silent-failure";
import { z } from "zod";
import * as Sentry from "@sentry/react-native";
import { spendCurrency } from "../economy/spending-service";
import { eventBus } from "../../events";
import { featureFlags } from "../../feature-flags/FeatureFlagEngine";


export function consumeBountiesOnDamage(encounterId: string, damageDealt: number): { lootMultiplier: number; consumedCount: number; consumedBountyIds: string[] } {
  if (!isBossBountyEnabled()) {
    return { lootMultiplier: 1, consumedCount: 0, consumedBountyIds: [] };
  }
  const now = Date.now();
  const allBounties = loadBounties(encounterId);

  // Find active bounties
  const activeBounties = allBounties.filter((b) => !b.consumed && b.expiresAt > now);

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
  const lootMultiplier = Math.min(consumedCount * BOUNTY_LOOT_MULTIPLIER, MAX_BOUNTY_STACK * BOUNTY_LOOT_MULTIPLIER);

  // Cleanup after a delay (keep consumed records briefly for analytics)
  const cleanupTimer = setTimeout(() => clearBounties(encounterId), 60 * 60 * 1000); // 1 hour
  if (typeof cleanupTimer === 'object' && 'unref' in cleanupTimer) {
    cleanupTimer.unref();
  }

  return { lootMultiplier, consumedCount, consumedBountyIds };
}

export function getActiveBounties(encounterId: string): BossBounty[] {
  if (!isBossBountyEnabled()) {
    return [];
  }
  const now = Date.now();
  const allBounties = loadBounties(encounterId);

  return allBounties.filter((b) => !b.consumed && b.expiresAt > now);
}

export function userHasActiveBounty(encounterId: string, userId: string): boolean {
  if (!isBossBountyEnabled()) {
    return false;
  }
  const now = Date.now();
  const allBounties = loadBounties(encounterId);

  return allBounties.some((b) => b.userId === userId && !b.consumed && b.expiresAt > now);
}

export function cleanupExpiredBounties(encounterId: string): void {
  const now = Date.now();
  const allBounties = loadBounties(encounterId);

  // Keep only non-expired bounties
  const validBounties = allBounties.filter((b) => b.expiresAt > now || !b.consumed);

  if (validBounties.length !== allBounties.length) {
    saveBounties(encounterId, validBounties);
  }
}

export function getBountyDisplayInfo(encounterId: string): {
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