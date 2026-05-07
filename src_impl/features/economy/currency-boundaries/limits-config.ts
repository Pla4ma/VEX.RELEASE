/**
 * Currency Limits Configuration
 *
 * Phase 6.03 - Currency And Monetization Boundaries
 * Default currency limits separated to comply with file size limits
 */

import type { CurrencyLimits } from './schemas';

// ============================================================================
// Default Currency Limits
// ============================================================================

export const DEFAULT_CURRENCY_LIMITS: Record<string, CurrencyLimits> = {
  COINS: {
    currency: 'COINS',

    // Daily earning limits
    maxDailyEarnings: 1000,
    maxDailyEarningsPremium: 2500,

    // Single transaction limits
    maxSingleEarn: 500,
    maxSingleSpend: 10000,

    // Wallet caps
    maxWalletBalance: 10000,
    maxWalletBalancePremium: 50000,

    // Velocity limits
    maxTransactionsPerHour: 100,
    maxTransactionsPerDay: 500,

    // Conversion limits
    maxDailyConversion: 2000,
    conversionFeePercent: 5,

    // Gifting limits
    maxDailyGifts: 10,
    maxGiftAmount: 500,
  },

  GEMS: {
    currency: 'GEMS',

    // Daily earning limits (gems are premium currency)
    maxDailyEarnings: 50,
    maxDailyEarningsPremium: 200,

    // Single transaction limits
    maxSingleEarn: 25,
    maxSingleSpend: 5000,

    // Wallet caps
    maxWalletBalance: 1000,
    maxWalletBalancePremium: 10000,

    // Velocity limits
    maxTransactionsPerHour: 50,
    maxTransactionsPerDay: 200,

    // Conversion limits
    maxDailyConversion: 100,
    conversionFeePercent: 10,

    // Gifting limits
    maxDailyGifts: 5,
    maxGiftAmount: 100,
  },

  FOCUS_POINTS: {
    currency: 'FOCUS_POINTS',

    // Daily earning limits (focus points are earned through activity)
    maxDailyEarnings: 500,
    maxDailyEarningsPremium: 1500,

    // Single transaction limits
    maxSingleEarn: 100,
    maxSingleSpend: 2000,

    // Wallet caps
    maxWalletBalance: 5000,
    maxWalletBalancePremium: 20000,

    // Velocity limits
    maxTransactionsPerHour: 200,
    maxTransactionsPerDay: 1000,

    // Conversion limits (focus points cannot be converted)
    maxDailyConversion: 0,
    conversionFeePercent: 0,

    // Gifting limits
    maxDailyGifts: 0,
    maxGiftAmount: 0,
  },

  SEASONAL: {
    currency: 'SEASONAL',

    // Daily earning limits (seasonal currency is event-based)
    maxDailyEarnings: 300,
    maxDailyEarningsPremium: 1000,

    // Single transaction limits
    maxSingleEarn: 150,
    maxSingleSpend: 3000,

    // Wallet caps (seasonal currency expires)
    maxWalletBalance: 2000,
    maxWalletBalancePremium: 10000,

    // Velocity limits
    maxTransactionsPerHour: 75,
    maxTransactionsPerDay: 300,

    // Conversion limits (seasonal currency cannot be converted)
    maxDailyConversion: 0,
    conversionFeePercent: 0,

    // Gifting limits
    maxDailyGifts: 3,
    maxGiftAmount: 200,
  },
};