import { z } from "zod";
export const CurrencyLimitsSchema = z.object({
  currency: z.enum(["COINS", "GEMS", "FOCUS_POINTS", "SEASONAL"]),
  maxDailyEarnings: z.number().min(0),
  maxDailyEarningsPremium: z.number().min(0),
  maxSingleEarn: z.number().min(0),
  maxSingleSpend: z.number().min(0),
  maxWalletBalance: z.number().min(0),
  maxWalletBalancePremium: z.number().min(0),
  maxTransactionsPerHour: z.number().min(1),
  maxTransactionsPerDay: z.number().min(1),
  maxDailyConversion: z.number().min(0),
  conversionFeePercent: z.number().min(0).max(100),
  maxDailyGifts: z.number().min(0),
  maxGiftAmount: z.number().min(0),
});
export type CurrencyLimits = z.infer<typeof CurrencyLimitsSchema>;
export const BoundaryViolationTypeSchema = z.enum([
  "DAILY_EARNING_EXCEEDED",
  "WALLET_CAP_EXCEEDED",
  "TRANSACTION_VELOCITY_EXCEEDED",
  "SINGLE_TRANSACTION_LIMIT_EXCEEDED",
  "CONVERSION_LIMIT_EXCEEDED",
  "GIFT_LIMIT_EXCEEDED",
  "SUSPICIOUS_PATTERN",
  "PREMIUM_FEATURE_ABUSE",
]);
export type BoundaryViolationType = z.infer<typeof BoundaryViolationTypeSchema>;
export const BoundaryViolationSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  type: BoundaryViolationTypeSchema,
  currency: z.enum(["COINS", "GEMS", "FOCUS_POINTS", "SEASONAL"]),
  attemptedAmount: z.number(),
  attemptedAction: z.enum(["EARN", "SPEND", "CONVERT", "GIFT"]),
  limitAmount: z.number(),
  limitType: z.enum(["DAILY", "WALLET", "TRANSACTION", "SINGLE"]),
  source: z.string(),
  sourceId: z.string().nullable(),
  metadata: z.record(z.unknown()).nullable(),
  action: z.enum(["BLOCKED", "ALLOWED_WITH_WARNING", "DETECTED"]),
  warningMessage: z.string().nullable(),
  createdAt: z.number(),
});
export type BoundaryViolation = z.infer<typeof BoundaryViolationSchema>;
export const MonetizationBoundarySchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  description: z.string(),
  freeUserLimit: z.number().min(0),
  premiumUserLimit: z.number().min(0),
  appliesTo: z.enum([
    "DAILY_EARNINGS",
    "WALLET_BALANCE",
    "TRANSACTIONS",
    "CONVERSIONS",
  ]),
  currency: z.enum(["COINS", "GEMS", "FOCUS_POINTS", "SEASONAL"]).nullable(),
  enforcement: z.enum(["HARD_BLOCK", "SOFT_WARNING", "RATE_LIMIT"]),
  conditions: z.object({
    minLevel: z.number().min(1).nullable(),
    requiredEntitlements: z.array(z.string()).optional(),
    excludedFromEvents: z.boolean().optional(),
  }),
  isActive: z.boolean(),
  priority: z.number().min(1),
});
export type MonetizationBoundary = z.infer<typeof MonetizationBoundarySchema>;
export const TransactionValidationRequestSchema = z.object({
  userId: z.string().uuid(),
  currency: z.enum(["COINS", "GEMS", "FOCUS_POINTS", "SEASONAL"]),
  amount: z.number(),
  action: z.enum(["EARN", "SPEND", "CONVERT", "GIFT"]),
  source: z.string(),
  sourceId: z.string().nullable(),
  metadata: z.record(z.unknown()).nullable(),
  isPremiumUser: z.boolean(),
  userLevel: z.number().min(1),
});
export type TransactionValidationRequest = z.infer<
  typeof TransactionValidationRequestSchema
>;
export const TransactionValidationResultSchema = z.object({
  allowed: z.boolean(),
  reason: z.string().nullable(),
  warningMessage: z.string().nullable(),
  adjustedAmount: z.number().nullable(),
  violations: z.array(BoundaryViolationSchema),
  requiresPremium: z.boolean(),
  premiumUpgradeMessage: z.string().nullable(),
});
export type TransactionValidationResult = z.infer<
  typeof TransactionValidationResultSchema
>;
export const EconomyProtectionRuleSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  description: z.string(),
  type: z.enum([
    "RATE_LIMIT",
    "CAP_LIMIT",
    "PATTERN_DETECTION",
    "PREMIUM_GATE",
  ]),
  conditions: z.object({
    timeWindow: z.number().min(60),
    maxCount: z.number().min(1),
    currency: z.enum(["COINS", "GEMS", "FOCUS_POINTS", "SEASONAL"]).nullable(),
    minAmount: z.number().nullable(),
    maxAmount: z.number().nullable(),
    userLevel: z.number().nullable(),
    isPremium: z.boolean().nullable(),
  }),
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
export const BoundaryAnalyticsSchema = z.object({
  period: z.enum(["HOURLY", "DAILY", "WEEKLY"]),
  periodStart: z.number(),
  periodEnd: z.number(),
  violationsByType: z.record(z.number()),
  violationsByCurrency: z.record(z.number()),
  uniqueUsersAffected: z.number(),
  totalViolations: z.number(),
  freeUserViolations: z.number(),
  premiumUserViolations: z.number(),
  blockedTransactions: z.number(),
  warningsIssued: z.number(),
  premiumUpgradesTriggered: z.number(),
});
export type BoundaryAnalytics = z.infer<typeof BoundaryAnalyticsSchema>;
export const CurrencyBoundariesConfigSchema = z.object({
  enableBoundaryValidation: z.boolean(),
  enableViolationTracking: z.boolean(),
  enablePremiumUpgrades: z.boolean(),
  defaultLimits: z.record(CurrencyLimitsSchema),
  protectionRules: z.array(EconomyProtectionRuleSchema),
  monetizationBoundaries: z.array(MonetizationBoundarySchema),
  analyticsRetentionDays: z.number().min(1),
  violationCooldownMinutes: z.number().min(1),
});
export type CurrencyBoundariesConfig = z.infer<
  typeof CurrencyBoundariesConfigSchema
>;
