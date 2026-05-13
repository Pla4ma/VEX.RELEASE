/**
 * Economy Types
 * Domain types for the economy system - no logic, no schemas
 *
 * Dependencies:
 * - Inventory (items purchased go to inventory)
 * - Shop (purchases use economy)
 * - Rewards (currency rewards from other systems)
 * - Analytics (purchase events tracked)
 * - Progression (level affects earning multipliers)
 */

// ============================================================================
// Currency Types
// ============================================================================

export type CurrencyType = 'COINS' | 'GEMS';

export interface CurrencyAmount {
  currency: CurrencyType;
  amount: number;
}

// ============================================================================
// Wallet
// ============================================================================

export interface Wallet {
  id: string;
  userId: string;
  coins: number;
  gems: number;
  totalCoinsEarned: number;
  totalCoinsSpent: number;
  totalGemsEarned: number;
  totalGemsSpent: number;
  createdAt: number;
  updatedAt: number;
}

export interface WalletSummary {
  coins: number;
  gems: number;
}

// ============================================================================
// Transactions
// ============================================================================

export type TransactionType = 'EARN' | 'SPEND' | 'REFUND' | 'CONVERT' | 'GIFT_RECEIVE' | 'GIFT_SEND';

export type TransactionSource = 'SESSION' | 'STREAK' | 'BOSS' | 'LEVEL_UP' | 'SHOP' | 'REWARD' | 'CRAFTING' | 'SQUAD' | 'DAILY_LOGIN' | 'ACHIEVEMENT' | 'PROMOTION' | 'REFUND';

export interface WalletTransaction {
  id: string;
  walletId: string;
  userId: string;
  type: TransactionType;
  currency: CurrencyType;
  amount: number;
  balanceBefore: number;
  balanceAfter: number;
  source: TransactionSource;
  sourceId: string | null; // Session ID, purchase ID, etc.
  description: string;
  metadata: Record<string, unknown> | null;
  createdAt: number;
}

// ============================================================================
// Earning Sources
// ============================================================================

export interface EarningSource {
  id: string;
  type: TransactionSource;
  baseAmount: number;
  currency: CurrencyType;
  multiplier: number;
  finalAmount: number;
  triggeredAt: number;
  metadata: Record<string, unknown> | null;
}

export interface EarningMultiplier {
  source: TransactionSource;
  baseMultiplier: number;
  levelBonus: number;
  streakBonus: number;
  squadBonus: number;
  eventBonus: number;
  totalMultiplier: number;
}

// ============================================================================
// Spending Sinks
// ============================================================================

export interface SpendingSink {
  id: string;
  type: 'SHOP' | 'CRAFTING' | 'UPGRADE' | 'GIFT' | 'CONVERT';
  currency: CurrencyType;
  baseAmount: number;
  discountApplied: number;
  finalAmount: number;
  spentAt: number;
  metadata: Record<string, unknown> | null;
}

// ============================================================================
// Purchase Flow
// ============================================================================

export type PurchaseStatus = 'PENDING' | 'VALIDATING' | 'PROCESSING_PAYMENT' | 'DELIVERING' | 'COMPLETED' | 'FAILED' | 'REFUNDED' | 'PARTIAL_DELIVERY';

export interface PurchaseAttempt {
  id: string;
  userId: string;
  shopItemId: string;
  quantity: number;
  unitPrice: CurrencyAmount;
  totalPrice: CurrencyAmount;
  status: PurchaseStatus;
  errorCode: string | null;
  errorMessage: string | null;
  inventoryItemIds: string[] | null; // IDs of items added to inventory
  refundedAt: number | null;
  refundReason: string | null;
  createdAt: number;
  updatedAt: number;
}

export interface PurchaseResult {
  success: boolean;
  purchaseId: string | null;
  inventoryItemIds: string[] | null;
  error: PurchaseError | null;
  remainingBalance: CurrencyAmount | null;
}

export interface PurchaseError {
  code: 'INSUFFICIENT_FUNDS' | 'ITEM_UNAVAILABLE' | 'PRICE_CHANGED' | 'INVENTORY_FULL' | 'NETWORK_ERROR' | 'SYSTEM_ERROR';
  message: string;
  recoverable: boolean;
}

// ============================================================================
// Refund Handling
// ============================================================================

export interface RefundRequest {
  id: string;
  purchaseId: string;
  userId: string;
  reason: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'PROCESSED';
  requestedAt: number;
  processedAt: number | null;
  refundAmount: CurrencyAmount | null;
  itemsRecovered: boolean;
}

// ============================================================================
// Economy Analytics
// ============================================================================

export interface EconomyAnalytics {
  userId: string;
  period: 'DAILY' | 'WEEKLY' | 'MONTHLY';
  periodStart: number;
  periodEnd: number;

  // Earnings
  totalEarned: Record<CurrencyType, number>;
  earningsBySource: Record<TransactionSource, number>;

  // Spending
  totalSpent: Record<CurrencyType, number>;
  spendingByCategory: Record<string, number>;

  // Conversion metrics
  purchaseAttempts: number;
  purchaseSuccesses: number;
  purchaseFailures: number;
  conversionRate: number;

  // Inventory impact
  itemsAcquired: number;
  itemsConsumed: number;
  craftingAttempts: number;
  craftingSuccesses: number;
}


