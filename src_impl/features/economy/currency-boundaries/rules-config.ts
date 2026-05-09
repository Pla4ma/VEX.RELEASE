/**
 * Currency Boundaries Rules Configuration
 *
 * Phase 6.03 - Currency And Monetization Boundaries
 * Protection rules and monetization boundaries separated to comply with file size limits
 */

import type {
  MonetizationBoundary,
  EconomyProtectionRule,
  CurrencyBoundariesConfig,
} from './schemas';
import { DEFAULT_CURRENCY_LIMITS } from './limits-config';

// ============================================================================
// Economy Protection Rules
// ============================================================================

export const DEFAULT_PROTECTION_RULES: EconomyProtectionRule[] = [
  {
    id: 'rate-limit-coins-hourly',
    name: 'Coin Transaction Rate Limit',
    description: 'Prevents rapid coin transactions that could indicate abuse',
    type: 'RATE_LIMIT',
    conditions: {
      timeWindow: 3600, // 1 hour
      maxCount: 100,
      currency: 'COINS',
      minAmount: null,
      maxAmount: null,
      userLevel: null,
      isPremium: null,
    },
    actions: {
      block: false,
      warn: true,
      logViolation: true,
      requirePremium: false,
      customMessage: 'You are approaching the hourly transaction limit. Consider upgrading to Premium for higher limits.',
    },
    isActive: true,
    priority: 1,
  },

  {
    id: 'wallet-cap-gems',
    name: 'Gem Wallet Cap',
    description: 'Prevents excessive gem accumulation',
    type: 'CAP_LIMIT',
    conditions: {
      timeWindow: 86400, // 24 hours
      maxCount: 1,
      currency: 'GEMS',
      minAmount: 1000,
      maxAmount: null,
      userLevel: null,
      isPremium: false,
    },
    actions: {
      block: true,
      warn: true,
      logViolation: true,
      requirePremium: true,
      customMessage: 'Free users have a gem wallet cap of 1,000. Upgrade to Premium for a 10,000 gem cap.',
    },
    isActive: true,
    priority: 2,
  },

  {
    id: 'daily-earnings-coins',
    name: 'Daily Coin Earnings Limit',
    description: 'Limits daily coin earnings to prevent exploitation',
    type: 'CAP_LIMIT',
    conditions: {
      timeWindow: 86400, // 24 hours
      maxCount: 1000,
      currency: 'COINS',
      minAmount: null,
      maxAmount: null,
      userLevel: null,
      isPremium: false,
    },
    actions: {
      block: true,
      warn: true,
      logViolation: true,
      requirePremium: false,
      customMessage: 'You have reached the daily coin earnings limit. Premium users earn 2.5x more coins daily.',
    },
    isActive: true,
    priority: 3,
  },

  {
    id: 'premium-feature-abuse',
    name: 'Premium Feature Abuse Detection',
    description: 'Detects suspicious patterns that may indicate premium feature abuse',
    type: 'PATTERN_DETECTION',
    conditions: {
      timeWindow: 1800, // 30 minutes
      maxCount: 50,
      currency: null,
      minAmount: 100,
      maxAmount: null,
      userLevel: null,
      isPremium: false,
    },
    actions: {
      block: false,
      warn: true,
      logViolation: true,
      requirePremium: false,
      customMessage: 'Unusual activity detected. This pattern is typically associated with Premium features.',
    },
    isActive: true,
    priority: 4,
  },

  {
    id: 'gem-conversion-gate',
    name: 'Gem Conversion Premium Gate',
    description: 'Requires Premium for high-value gem conversions',
    type: 'PREMIUM_GATE',
    conditions: {
      timeWindow: 86400, // 24 hours
      maxCount: 100,
      currency: 'GEMS',
      minAmount: 50,
      maxAmount: null,
      userLevel: 5,
      isPremium: false,
    },
    actions: {
      block: false,
      warn: true,
      logViolation: false,
      requirePremium: true,
      customMessage: 'Convert 50+ gems daily with Premium. Free users have lower conversion limits.',
    },
    isActive: true,
    priority: 5,
  },
];

// ============================================================================
// Monetization Boundaries
// ============================================================================

export const DEFAULT_MONETIZATION_BOUNDARIES: MonetizationBoundary[] = [
  {
    id: 'daily-earnings-boundary',
    name: 'Daily Earnings Boundary',
    description: 'Separates free and premium daily earning limits',
    freeUserLimit: 1000,
    premiumUserLimit: 2500,
    appliesTo: 'DAILY_EARNINGS',
    currency: 'COINS',
    enforcement: 'HARD_BLOCK',
    conditions: {
      minLevel: 1,
      requiredEntitlements: [],
      excludedFromEvents: false,
    },
    isActive: true,
    priority: 1,
  },

  {
    id: 'wallet-cap-boundary',
    name: 'Wallet Cap Boundary',
    description: 'Maximum wallet balance limits',
    freeUserLimit: 10000,
    premiumUserLimit: 50000,
    appliesTo: 'WALLET_BALANCE',
    currency: 'COINS',
    enforcement: 'SOFT_WARNING',
    conditions: {
      minLevel: 1,
      requiredEntitlements: [],
      excludedFromEvents: false,
    },
    isActive: true,
    priority: 2,
  },

  {
    id: 'gem-daily-earnings',
    name: 'Gem Daily Earnings',
    description: 'Strict gem earning limits (premium currency)',
    freeUserLimit: 50,
    premiumUserLimit: 200,
    appliesTo: 'DAILY_EARNINGS',
    currency: 'GEMS',
    enforcement: 'HARD_BLOCK',
    conditions: {
      minLevel: 1,
      requiredEntitlements: [],
      excludedFromEvents: false,
    },
    isActive: true,
    priority: 3,
  },

  {
    id: 'transaction-velocity',
    name: 'Transaction Velocity',
    description: 'Limits transaction frequency to prevent abuse',
    freeUserLimit: 500,
    premiumUserLimit: 1000,
    appliesTo: 'TRANSACTIONS',
    currency: null,
    enforcement: 'RATE_LIMIT',
    conditions: {
      minLevel: 1,
      requiredEntitlements: [],
      excludedFromEvents: false,
    },
    isActive: true,
    priority: 4,
  },

  {
    id: 'conversion-limits',
    name: 'Currency Conversion Limits',
    description: 'Limits how much currency can be converted daily',
    freeUserLimit: 100,
    premiumUserLimit: 500,
    appliesTo: 'CONVERSIONS',
    currency: 'GEMS',
    enforcement: 'HARD_BLOCK',
    conditions: {
      minLevel: 5,
      requiredEntitlements: ['premium'],
      excludedFromEvents: false,
    },
    isActive: true,
    priority: 5,
  },
];

// ============================================================================
// Default Configuration
// ============================================================================

export const DEFAULT_CURRENCY_BOUNDARIES_CONFIG: CurrencyBoundariesConfig = {
  enableBoundaryValidation: true,
  enableViolationTracking: true,
  enablePremiumUpgrades: true,

  defaultLimits: DEFAULT_CURRENCY_LIMITS,

  protectionRules: DEFAULT_PROTECTION_RULES,

  monetizationBoundaries: DEFAULT_MONETIZATION_BOUNDARIES,

  analyticsRetentionDays: 90,
  violationCooldownMinutes: 60,
};
