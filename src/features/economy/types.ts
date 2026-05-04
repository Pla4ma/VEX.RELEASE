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

export type CurrencyType = 'COINS' | 'GEMS' | 'FOCUS_POINTS';

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
  focusPoints: number; // New: simplified focus-based currency
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
  focusPoints: number;
}

// ============================================================================
// Transactions
// ============================================================================

export type TransactionType = 'EARN' | 'SPEND' | 'REFUND' | 'CONVERT' | 'GIFT_RECEIVE' | 'GIFT_SEND';

export type TransactionSource =
  | 'SESSION'
  | 'STREAK'
  | 'BOSS'
  | 'LEVEL_UP'
  | 'SHOP'
  | 'REWARD'
  | 'CRAFTING'
  | 'SQUAD'
  | 'DAILY_LOGIN'
  | 'ACHIEVEMENT'
  | 'PROMOTION'
  | 'REFUND';

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

export type PurchaseStatus =
  | 'PENDING'
  | 'VALIDATING'
  | 'PROCESSING_PAYMENT'
  | 'DELIVERING'
  | 'COMPLETED'
  | 'FAILED'
  | 'REFUNDED'
  | 'PARTIAL_DELIVERY';

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

// ============================================================================
// Currency Conversion
// ============================================================================

export interface CurrencyConversion {
  id: string;
  userId: string;
  fromCurrency: CurrencyType;
  fromAmount: number;
  toCurrency: CurrencyType;
  toAmount: number;
  exchangeRate: number;
  fee: number;
  createdAt: number;
}

// ============================================================================
// Price History
// ============================================================================

export interface PricePoint {
  timestamp: number;
  price: CurrencyAmount;
  reason: string | null;
}

export interface ItemPriceHistory {
  itemId: string;
  pricePoints: PricePoint[];
  currentPrice: CurrencyAmount;
  lowestPrice: CurrencyAmount;
  highestPrice: CurrencyAmount;
}

// ============================================================================
// Offer System
// ============================================================================

export type OfferType = 'FLASH_SALE' | 'BUNDLE' | 'DAILY_DEAL' | 'FIRST_PURCHASE' | 'VIP_EXCLUSIVE' | 'SEASONAL';

export type OfferStatus = 'SCHEDULED' | 'ACTIVE' | 'EXPIRED' | 'SOLD_OUT';

export interface LimitedOffer {
  id: string;
  type: OfferType;
  name: string;
  description: string;

  // Items included
  itemIds: string[];
  bonusItemIds: string[];

  // Pricing
  originalPrice: CurrencyAmount;
  discountedPrice: CurrencyAmount;
  discountPercent: number;

  // Availability
  status: OfferStatus;
  startAt: number;
  endAt: number;
  maxPurchases: number | null; // null = unlimited
  currentPurchases: number;

  // Targeting
  minLevel: number;
  maxLevel: number | null;
  requiredItems: string[]; // Must own these items
  excludedItems: string[]; // Cannot own these items

  // Display
  badgeText: string | null;
  timerDisplay: boolean;
  priority: number;

  createdAt: number;
}

export interface UserOfferClaim {
  id: string;
  offerId: string;
  userId: string;
  purchaseId: string;
  claimedAt: number;
}
