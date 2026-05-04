/**
 * Currency Types V2 - Consolidated System
 *
 * Phase 4 Economy Redesign
 * Removes confusing 3rd currency (seasonal) for cleaner 2-currency system
 *
 * Currencies:
 * - COINS: Earned from gameplay, spent on basic items
 * - GEMS: Premium currency, spent on cosmetics and emergency saves
 *
 * @deprecated SEASONAL currency is deprecated - migrate to COINS/GEMS only
 */

import { z } from 'zod';
import { featureFlags } from '../feature-flags/FeatureFlagEngine';

// ============================================================================
// Consolidated Currency Schema (V2)
// ============================================================================

export const CurrencyTypeV2Schema = z.enum(['COINS', 'GEMS']);
export type CurrencyTypeV2 = z.infer<typeof CurrencyTypeV2Schema>;

export const WalletV2Schema = z.object({
  coins: z.number().min(0).default(0),
  gems: z.number().min(0).default(0),
  totalEarned: z.object({
    COINS: z.number().min(0).default(0),
    GEMS: z.number().min(0).default(0),
  }).default({}),
  totalSpent: z.object({
    COINS: z.number().min(0).default(0),
    GEMS: z.number().min(0).default(0),
  }).default({}),
  lastUpdated: z.number().default(Date.now),
});

export type WalletV2 = z.infer<typeof WalletV2Schema>;

// ============================================================================
// Legacy Currency (Deprecated)
// ============================================================================

/**
 * @deprecated Use CurrencyTypeV2 instead
 * Seasonal currency is being removed - migrate any balances to COINS
 */
export const LegacyCurrencyTypeSchema = z.enum(['COINS', 'GEMS', 'SEASONAL']);
export type LegacyCurrencyType = z.infer<typeof LegacyCurrencyTypeSchema>;

// ============================================================================
// Currency Configuration
// ============================================================================

export interface CurrencyConfig {
  name: string;
  symbol: string;
  color: string;
  description: string;
  earnSources: string[];
  spendLocations: string[];
  isPremium: boolean;
}

export const CURRENCY_CONFIG: Record<CurrencyTypeV2, CurrencyConfig> = {
  COINS: {
    name: 'Coins',
    symbol: '🪙',
    color: '#F59E0B', // amber-500
    description: 'Earned from completing sessions and challenges',
    earnSources: ['Sessions', 'Challenges', 'Streaks', 'Boss Defeats', 'Quests'],
    spendLocations: ['Shop Items', 'Basic Boosts', 'Gifts'],
    isPremium: false,
  },
  GEMS: {
    name: 'Gems',
    symbol: '💎',
    color: '#3B82F6', // blue-500
    description: 'Premium currency for cosmetics and emergency saves',
    earnSources: ['Achievements', 'Rare Drops', 'Purchases', 'Tournaments'],
    spendLocations: ['Cosmetics', 'Emergency Saves', 'Gacha', 'Premium Pass'],
    isPremium: true,
  },
};

// ============================================================================
// Conversion Rates
// ============================================================================

export const CURRENCY_CONVERSION_RATES: Record<string, number> = {
  'GEMS-COINS': 100,    // 1 gem = 100 coins
  'COINS-GEMS': 0.008,  // 1000 coins = 8 gems (lossy)
};

// ============================================================================
// Migration Helpers
// ============================================================================

/**
 * Check if consolidated currencies feature is enabled
 */
export function isConsolidatedCurrenciesEnabled(): boolean {
  return featureFlags.isEnabled('consolidated_currencies');
}

/**
 * Migrate legacy wallet to V2 (removes seasonal currency)
 */
export function migrateWalletToV2(legacyWallet: {
  coins: number;
  gems: number;
  seasonal?: Record<string, number>;
  totalEarned?: Record<string, number>;
  totalSpent?: Record<string, number>;
}): WalletV2 {
  // Convert seasonal currency to coins at 10:1 ratio
  const seasonalTotal = Object.values(legacyWallet.seasonal || {}).reduce(
    (sum, val) => sum + val,
    0
  );
  const convertedCoins = Math.floor(seasonalTotal / 10);

  console.log(`[MIGRATION] Converting ${seasonalTotal} seasonal → ${convertedCoins} coins`);

  return {
    coins: legacyWallet.coins + convertedCoins,
    gems: legacyWallet.gems,
    totalEarned: {
      COINS: (legacyWallet.totalEarned?.COINS || 0) + convertedCoins,
      GEMS: legacyWallet.totalEarned?.GEMS || 0,
    },
    totalSpent: {
      COINS: legacyWallet.totalSpent?.COINS || 0,
      GEMS: legacyWallet.totalSpent?.GEMS || 0,
    },
    lastUpdated: Date.now(),
  };
}

/**
 * Get display currency (respects feature flag)
 */
export function getActiveCurrencies(): CurrencyTypeV2[] {
  if (isConsolidatedCurrenciesEnabled()) {
    return ['COINS', 'GEMS'];
  }

  // Legacy: return all 3 currencies
  return ['COINS', 'GEMS', 'SEASONAL'] as CurrencyTypeV2[];
}

// ============================================================================
// Emergency Gem Sinks (Phase 4 Feature)
// ============================================================================

export interface EmergencyGemSink {
  id: string;
  name: string;
  cost: number;
  description: string;
  trigger: 'streak_at_risk' | 'boss_failed' | 'session_abandoned' | 'manual';
  maxUsesPerDay: number;
}

export const EMERGENCY_GEM_SINKS: EmergencyGemSink[] = [
  {
    id: 'streak_freeze',
    name: 'Streak Freeze',
    cost: 50,
    description: 'Prevent your streak from breaking',
    trigger: 'streak_at_risk',
    maxUsesPerDay: 1,
  },
  {
    id: 'boss_retry',
    name: 'Boss Retry',
    cost: 20,
    description: 'Try the boss again for a better score',
    trigger: 'boss_failed',
    maxUsesPerDay: 3,
  },
  {
    id: 'session_save',
    name: 'Session Save',
    cost: 30,
    description: 'Get partial credit for abandoned session',
    trigger: 'session_abandoned',
    maxUsesPerDay: 2,
  },
  {
    id: 'focus_shield',
    name: 'Focus Shield',
    cost: 15,
    description: 'Block the next boss attack automatically',
    trigger: 'manual',
    maxUsesPerDay: 5,
  },
];

/**
 * Check if emergency gem sinks feature is enabled
 */
export function isEmergencyGemSinksEnabled(): boolean {
  return featureFlags.isEnabled('emergency_gem_sinks');
}
