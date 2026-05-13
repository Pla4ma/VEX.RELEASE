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
import { featureFlags } from '../../feature-flags/FeatureFlagEngine';

// ============================================================================
// Constants
// ============================================================================
// ============================================================================
// Schemas
// ============================================================================
// ============================================================================
// Types
// ============================================================================

function isBossBountyEnabled(): boolean {
  return featureFlags.isEnabled('boss_bounty_system');
}

// ============================================================================
// Storage (MMKV-based for client-side bounty tracking)
// ============================================================================

const BOUNTY_STORAGE_KEY = (encounterId: string) => `boss_bounties:${encounterId}`;

function getStorage() {
  try {
    const { storage } = require('../../store/mmkv-storage');
    return storage;
  } catch (error) {
    captureSilentFailure(error, { feature: 'boss', operation: 'ui-fallback', type: 'ui' });
    return null;
  }
}

function saveBounties(encounterId: string, bounties: BossBounty[]): void {
  const storage = getStorage();
  if (!storage) {
    return;
  }

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
  if (!storage) {
    return [];
  }

  try {
    const data = storage.getString(BOUNTY_STORAGE_KEY(encounterId));
    if (!data) {
      return [];
    }

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
  if (!storage) {
    return;
  }

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
export * from "./BossBountySystem.types";
export * from "./BossBountySystem.part1";
export * from "./BossBountySystem.part2";
