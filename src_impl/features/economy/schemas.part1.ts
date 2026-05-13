import { z } from "zod";


export const CurrencyTypeSchema = z.enum(['COINS', 'GEMS']);

export const CurrencyAmountSchema = z
  .object({
    currency: CurrencyTypeSchema,
    amount: z.number().int().min(0),
  })
  .strict();

export const WalletSchema = z
  .object({
    id: z.string().uuid(),
    userId: z.string().uuid(),
    coins: z.number().int().min(0).default(0),
    gems: z.number().int().min(0).default(0),
    totalCoinsEarned: z.number().int().min(0).default(0),
    totalCoinsSpent: z.number().int().min(0).default(0),
    totalGemsEarned: z.number().int().min(0).default(0),
    totalGemsSpent: z.number().int().min(0).default(0),
    createdAt: z.number().int(),
    updatedAt: z.number().int(),
  })
  .strict();

export const WalletSummarySchema = z
  .object({
    coins: z.number().int().min(0),
    gems: z.number().int().min(0),
  })
  .strict();

export const TransactionTypeSchema = z.enum(['EARN', 'SPEND', 'REFUND', 'CONVERT', 'GIFT_RECEIVE', 'GIFT_SEND']);

export const TransactionSourceSchema = z.enum(['SESSION', 'STREAK', 'BOSS', 'LEVEL_UP', 'SHOP', 'REWARD', 'CRAFTING', 'SQUAD', 'DAILY_LOGIN', 'ACHIEVEMENT', 'PROMOTION', 'REFUND']);

export const WalletTransactionSchema = z
  .object({
    id: z.string().uuid(),
    walletId: z.string().uuid(),
    userId: z.string().uuid(),
    type: TransactionTypeSchema,
    currency: CurrencyTypeSchema,
    amount: z.number().int().positive(),
    balanceBefore: z.number().int().min(0),
    balanceAfter: z.number().int().min(0),
    source: TransactionSourceSchema,
    sourceId: z.string().uuid().nullable(),
    description: z.string().min(1).max(500),
    metadata: z.record(z.unknown()).nullable(),
    createdAt: z.number().int(),
  })
  .strict();

export const EarningMultiplierSchema = z
  .object({
    source: TransactionSourceSchema,
    baseMultiplier: z.number().min(0.1).default(1),
    levelBonus: z.number().min(0).default(0),
    streakBonus: z.number().min(0).default(0),
    squadBonus: z.number().min(0).default(0),
    eventBonus: z.number().min(0).default(0),
    totalMultiplier: z.number().min(0.1),
  })
  .strict();

export const CalculateEarningsInputSchema = z
  .object({
    userId: z.string().uuid(),
    source: TransactionSourceSchema,
    baseAmount: z.number().int().positive(),
    currency: CurrencyTypeSchema,
    userLevel: z.number().int().min(1),
    streakDays: z.number().int().min(0).optional(),
    squadMultiplier: z.number().min(1).optional(),
    eventMultiplier: z.number().min(1).optional(),
    metadata: z.record(z.unknown()).optional(),
  })
  .strict();

export const SpendingSinkSchema = z
  .object({
    id: z.string().uuid(),
    type: z.enum(['SHOP', 'CRAFTING', 'UPGRADE', 'GIFT', 'CONVERT', 'STREAK_INSURANCE', 'STREAK_WAGER', 'BOSS_BOUNTY']),
    currency: CurrencyTypeSchema,
    baseAmount: z.number().int().positive(),
    discountApplied: z.number().min(0).max(1).default(0),
    finalAmount: z.number().int().positive(),
    spentAt: z.number().int(),
    metadata: z.record(z.unknown()).nullable(),
  })
  .strict();

export const PurchaseStatusSchema = z.enum(['PENDING', 'VALIDATING', 'PROCESSING_PAYMENT', 'DELIVERING', 'COMPLETED', 'FAILED', 'REFUNDED', 'PARTIAL_DELIVERY']);

export const PurchaseErrorCodeSchema = z.enum(['INSUFFICIENT_FUNDS', 'ITEM_UNAVAILABLE', 'PRICE_CHANGED', 'INVENTORY_FULL', 'NETWORK_ERROR', 'SYSTEM_ERROR']);

export const PurchaseErrorSchema = z
  .object({
    code: PurchaseErrorCodeSchema,
    message: z.string(),
    recoverable: z.boolean(),
  })
  .strict();

export const PurchaseAttemptSchema = z
  .object({
    id: z.string().uuid(),
    userId: z.string().uuid(),
    shopItemId: z.string().uuid(),
    quantity: z.number().int().min(1).max(999),
    unitPrice: CurrencyAmountSchema,
    totalPrice: CurrencyAmountSchema,
    status: PurchaseStatusSchema,
    errorCode: PurchaseErrorCodeSchema.nullable(),
    errorMessage: z.string().nullable(),
    inventoryItemIds: z.array(z.string().uuid()).nullable(),
    refundedAt: z.number().int().nullable(),
    refundReason: z.string().nullable(),
    createdAt: z.number().int(),
    updatedAt: z.number().int(),
  })
  .strict();

export const InitiatePurchaseInputSchema = z
  .object({
    userId: z.string().uuid(),
    shopItemId: z.string().uuid(),
    quantity: z.number().int().min(1).max(999).default(1),
    expectedPrice: CurrencyAmountSchema.optional(), // For price validation
  })
  .strict();

export const PurchaseResultSchema = z
  .object({
    success: z.boolean(),
    purchaseId: z.string().uuid().nullable(),
    inventoryItemIds: z.array(z.string().uuid()).nullable(),
    error: PurchaseErrorSchema.nullable(),
    remainingBalance: CurrencyAmountSchema.nullable(),
  })
  .strict();

export const RefundStatusSchema = z.enum(['PENDING', 'APPROVED', 'REJECTED', 'PROCESSED']);

export const RefundRequestSchema = z
  .object({
    id: z.string().uuid(),
    purchaseId: z.string().uuid(),
    userId: z.string().uuid(),
    reason: z.string().min(1).max(500),
    status: RefundStatusSchema,
    requestedAt: z.number().int(),
    processedAt: z.number().int().nullable(),
    refundAmount: CurrencyAmountSchema.nullable(),
    itemsRecovered: z.boolean().default(false),
  })
  .strict();

export const ProcessRefundInputSchema = z
  .object({
    refundRequestId: z.string().uuid(),
    approved: z.boolean(),
    adminId: z.string().uuid(),
    notes: z.string().max(1000).optional(),
  })
  .strict();

export const AddCurrencyInputSchema = z
  .object({
    userId: z.string().uuid(),
    currency: CurrencyTypeSchema,
    amount: z.number().int().positive(),
    source: TransactionSourceSchema,
    sourceId: z.string().uuid().optional(),
    description: z.string().min(1).max(500),
    metadata: z.record(z.unknown()).optional(),
    skipEvents: z.boolean().default(false).optional(),
  })
  .strict()
  .transform((data) => ({
    ...data,
    skipEvents: data.skipEvents ?? false,
  }));