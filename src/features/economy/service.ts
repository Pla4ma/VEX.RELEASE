/**
 * Economy Service - Barrel File
 * Re-exports all economy sub-services for backward compatibility
 */

// Wallet management
export {
  getOrCreateWallet,
  getWalletSummary,
  getBalance,
  hasEnoughBalance,
  calculateEarningsMultiplier,
  addCurrency,
} from './wallet-service';

// Spending
export { spendCurrency } from './spending-service';

// Session rewards
export { creditSessionRewards } from './session-rewards';

// Purchases
export {
  initiatePurchase,
  processPurchasePayment,
  completePurchaseDelivery,
  handlePurchaseFailure,
} from './purchase-service';

// Refunds
export {
  requestRefund,
  processRefund,
  refundPurchase,
} from './refund-service';

// Currency conversion
export {
  getConversionRate,
  calculateConversion,
  convertCurrency,
} from './conversion-service';

// Offers
export {
  getActiveOffers,
  checkOfferEligibility,
  claimOffer,
} from './offer-service';

// Analytics
export {
  getTransactionHistory,
  getEconomyAnalytics,
} from './analytics-service';

// Re-export types
export type {
  Wallet,
  WalletTransaction,
  CurrencyType,
  PurchaseResult,
  PurchaseError,
  RefundRequest,
  LimitedOffer,
  UserOfferClaim,
} from './schemas';

// Service getter for compatibility with hooks expecting service pattern
export interface EconomyService {
  getOrCreateWallet: typeof import('./wallet-service').getOrCreateWallet;
  getWalletSummary: typeof import('./wallet-service').getWalletSummary;
  getBalance: typeof import('./wallet-service').getBalance;
  hasEnoughBalance: typeof import('./wallet-service').hasEnoughBalance;
  addCurrency: typeof import('./wallet-service').addCurrency;
  spendCurrency: typeof import('./spending-service').spendCurrency;
  creditSessionRewards: typeof import('./session-rewards').creditSessionRewards;
  initiatePurchase: typeof import('./purchase-service').initiatePurchase;
  processPurchasePayment: typeof import('./purchase-service').processPurchasePayment;
  completePurchaseDelivery: typeof import('./purchase-service').completePurchaseDelivery;
  requestRefund: typeof import('./refund-service').requestRefund;
  processRefund: typeof import('./refund-service').processRefund;
}

const economyServiceInstance: EconomyService = {
  getOrCreateWallet: async () => { throw new Error('Not implemented'); },
  getWalletSummary: async () => { throw new Error('Not implemented'); },
  getBalance: async () => 0,
  hasEnoughBalance: () => false,
  addCurrency: async (_input: any) => ({
    newBalance: 0,
    earnedAmount: 0,
    transaction: {
      id: '00000000-0000-0000-0000-000000000000',
      walletId: '00000000-0000-0000-0000-000000000000',
      userId: '00000000-0000-0000-0000-000000000000',
      type: 'EARN',
      currency: 'COINS',
      amount: 0,
      balanceBefore: 0,
      balanceAfter: 0,
      source: 'DAILY_LOGIN',
      sourceId: null,
      description: 'Stub transaction',
      metadata: null,
      createdAt: Date.now(),
    },
  }),
  spendCurrency: async (_input: any) => ({
    success: false,
    newBalance: 0,
    transaction: null,
    error: {
      code: 'SYSTEM_ERROR',
      message: 'Not implemented',
      recoverable: false,
    },
  }),
  creditSessionRewards: async (_userId: any, _chestResult: any) => ({
    xpAdded: 0,
    coinsAdded: 0,
    gemsAdded: 0,
    bonusItemGranted: false,
  }),
  initiatePurchase: async (_input: any) => ({
    success: false,
    error: {
      code: 'SYSTEM_ERROR',
      message: 'Not implemented',
      recoverable: false,
    },
    purchaseId: null,
    inventoryItemIds: null,
    remainingBalance: null,
  }),
  processPurchasePayment: async (_input: any) => ({
    success: false,
    error: {
      code: 'SYSTEM_ERROR',
      message: 'Not implemented',
      recoverable: false,
    },
    purchaseId: null,
    inventoryItemIds: null,
    remainingBalance: null,
  }),
  completePurchaseDelivery: async (_input: any) => ({
    success: false,
    error: {
      code: 'SYSTEM_ERROR',
      message: 'Not implemented',
      recoverable: false,
    },
    purchaseId: null,
    inventoryItemIds: null,
    remainingBalance: null,
  }),
  requestRefund: async (_purchaseId: any, _userId: any, _reason: any) => ({
    id: '00000000-0000-0000-0000-000000000000',
    purchaseId: '00000000-0000-0000-0000-000000000000',
    userId: '00000000-0000-0000-0000-000000000000',
    reason: 'Stub refund request',
    status: 'PENDING',
    requestedAt: Date.now(),
    processedAt: null,
    refundAmount: null,
    itemsRecovered: false,
  }),
  processRefund: async (_input: any) => ({
    id: '00000000-0000-0000-0000-000000000000',
    purchaseId: '00000000-0000-0000-0000-000000000000',
    userId: '00000000-0000-0000-0000-000000000000',
    reason: 'Stub refund request',
    status: 'PENDING',
    requestedAt: Date.now(),
    processedAt: null,
    refundAmount: null,
    itemsRecovered: false,
  }),
};

export function getEconomyService(): EconomyService {
  return economyServiceInstance;
}
