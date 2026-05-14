/**
 * Currency Boundaries Schemas
 *
 * Phase 6.03 - Currency And Monetization Boundaries
 * Defines limits, constraints, and validation rules for currency systems
 * Prevents abuse, ensures fair monetization, and protects economy integrity
 *
 * Dependencies:
 * - Economy (currency types, wallet operations)
 * - Monetization (premium tier validation)
 * - Analytics (boundary violation tracking)
 */

import { z } from 'zod';

// ============================================================================
// Currency Limits
// ============================================================================

export const CurrencyLimitsSchema = z.object({
  currency: z.enum(['COINS', 'GEMS', 'FOCUS_POINTS', 'SEASONAL']),

  // Daily earning limits (per user)
  maxDailyEarnings: z.number().min(0),
  maxDailyEarningsPremium: z.number().min(0),

  // Single transaction limits
  maxSingleEarn: z.number().min(0),
  maxSingleSpend: z.number().min(0),

  // Wallet caps (absolute maximum)
  maxWalletBalance: z.number().min(0),
  maxWalletBalancePremium: z.number().min(0),

  // Velocity limits (prevents rapid exploitation)
  maxTransactionsPerHour: z.number().min(1),
  maxTransactionsPerDay: z.number().min(1),

  // Conversion limits
  maxDailyConversion: z.number().min(0),
  conversionFeePercent: z.number().min(0).max(100),

  // Gifting limits
  maxDailyGifts: z.number().min(0),
  maxGiftAmount: z.number().min(0),
});

export type CurrencyLimits = z.infer<typeof CurrencyLimitsSchema>;

// ============================================================================
// Boundary Violation Types
// ============================================================================

export const BoundaryViolationTypeSchema = z.enum([
  'DAILY_EARNING_EXCEEDED',
  'WALLET_CAP_EXCEEDED',
  'TRANSACTION_VELOCITY_EXCEEDED',
  'SINGLE_TRANSACTION_LIMIT_EXCEEDED',
  'CONVERSION_LIMIT_EXCEEDED',
  'GIFT_LIMIT_EXCEEDED',
  'SUSPICIOUS_PATTERN',
  'PREMIUM_FEATURE_ABUSE',
]);

export type BoundaryViolationType = z.infer<typeof BoundaryViolationTypeSchema>;

export const BoundaryViolationSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  type: BoundaryViolationTypeSchema,
  currency: z.enum(['COINS', 'GEMS', 'FOCUS_POINTS', 'SEASONAL']),

  // What was attempted
  attemptedAmount: z.number(),
  attemptedAction: z.enum(['EARN', 'SPEND', 'CONVERT', 'GIFT']),

  // What the limit was
  limitAmount: z.number(),
  limitType: z.enum(['DAILY', 'WALLET', 'TRANSACTION', 'SINGLE']),

  // Context
  source: z.string(),
  sourceId: z.string().nullable(),
  metadata: z.record(z.unknown()).nullable(),

  // Resolution
  action: z.enum(['BLOCKED', 'ALLOWED_WITH_WARNING', 'DETECTED']),
  warningMessage: z.string().nullable(),

  createdAt: z.number(),
});

export type BoundaryViolation = z.infer<typeof BoundaryViolationSchema>;

// ============================================================================
// Monetization Boundaries
// ============================================================================

export const MonetizationBoundarySchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  description: z.string(),

  // Premium vs Free constraints
  freeUserLimit: z.number().min(0),
  premiumUserLimit: z.number().min(0),

  // What this boundary applies to
  appliesTo: z.enum(['DAILY_EARNINGS', 'WALLET_BALANCE', 'TRANSACTIONS', 'CONVERSIONS']),
  currency: z.enum(['COINS', 'GEMS', 'FOCUS_POINTS', 'SEASONAL']).nullable(),

  // Enforcement
  enforcement: z.enum(['HARD_BLOCK', 'SOFT_WARNING', 'RATE_LIMIT']),

  // Conditions
  conditions: z.object({
    minLevel: z.number().min(1).nullable(),
    requiredEntitlements: z.array(z.string()).optional(),
    excludedFromEvents: z.boolean().optional(),
  }),

  isActive: z.boolean(),
  priority: z.number().min(1),
});

export type MonetizationBoundary = z.infer<typeof MonetizationBoundarySchema>;

// ============================================================================
// Transaction Validation
// ============================================================================

export const TransactionValidationRequestSchema = z.object({
  userId: z.string().uuid(),
  currency: z.enum(['COINS', 'GEMS', 'FOCUS_POINTS', 'SEASONAL']),
  amount: z.number(),
  action: z.enum(['EARN', 'SPEND', 'CONVERT', 'GIFT']),
  source: z.string(),
  sourceId: z.string().nullable(),
  metadata: z.record(z.unknown()).nullable(),
  isPremiumUser: z.boolean(),
  userLevel: z.number().min(1),
});

export type TransactionValidationRequest = z.infer<typeof TransactionValidationRequestSchema>;

export const TransactionValidationResultSchema = z.object({
  allowed: z.boolean(),
  reason: z.string().nullable(),
  warningMessage: z.string().nullable(),
  adjustedAmount: z.number().nullable(),
  violations: z.array(BoundaryViolationSchema),
  requiresPremium: z.boolean(),
  premiumUpgradeMessage: z.string().nullable(),
});

export type TransactionValidationResult = z.infer<typeof TransactionValidationResultSchema>;

// ============================================================================
// Economy Protection Rules
// ============================================================================

export const EconomyProtectionRuleSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  description: z.string(),

  // Rule type
  type: z.enum(['RATE_LIMIT', 'CAP_LIMIT', 'PATTERN_DETECTION', 'PREMIUM_GATE']),

  // Conditions
  conditions: z.object({
    timeWindow: z.number().min(60), // seconds
    maxCount: z.number().min(1),
    currency: z.enum(['COINS', 'GEMS', 'FOCUS_POINTS', 'SEASONAL']).nullable(),
    minAmount: z.number().nullable(),
    maxAmount: z.number().nullable(),
    userLevel: z.number().nullable(),
    isPremium: z.boolean().nullable(),
  }),

  // Actions
  actions: z.object({
    block: z.boolean(),
    warn: z.boolean(),
    logViolation: z.boolean(),
    requirePremium: z.boolean(),
    customMessage: z.string().nullable(),
  }),

  isActive: z.boolean(),
  priority: z.number().min(1),
});

export type EconomyProtectionRule = z.infer<typeof EconomyProtectionRuleSchema>;

// ============================================================================
// Analytics
// ============================================================================

export const BoundaryAnalyticsSchema = z.object({
  period: z.enum(['HOURLY', 'DAILY', 'WEEKLY']),
  periodStart: z.number(),
  periodEnd: z.number(),

  // Violations by type
  violationsByType: z.record(z.number()),

  // Violations by currency
  violationsByCurrency: z.record(z.number()),

  // User impact
  uniqueUsersAffected: z.number(),
  totalViolations: z.number(),

  // Premium vs Free
  freeUserViolations: z.number(),
  premiumUserViolations: z.number(),

  // Resolution outcomes
  blockedTransactions: z.number(),
  warningsIssued: z.number(),
  premiumUpgradesTriggered: z.number(),
});

export type BoundaryAnalytics = z.infer<typeof BoundaryAnalyticsSchema>;

// ============================================================================
// Configuration
// ============================================================================

export const CurrencyBoundariesConfigSchema = z.object({
  // Global settings
  enableBoundaryValidation: z.boolean(),
  enableViolationTracking: z.boolean(),
  enablePremiumUpgrades: z.boolean(),

  // Default limits
  defaultLimits: z.record(CurrencyLimitsSchema),

  // Protection rules
  protectionRules: z.array(EconomyProtectionRuleSchema),

  // Monetization boundaries
  monetizationBoundaries: z.array(MonetizationBoundarySchema),

  // Analytics settings
  analyticsRetentionDays: z.number().min(1),
  violationCooldownMinutes: z.number().min(1),
});

export type CurrencyBoundariesConfig = z.infer<typeof CurrencyBoundariesConfigSchema>;
