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

// Wallet feature integration
export {
  getWalletState,
  earnCoins,
  spendCoins,
  earnGems,
  spendGems,
} from '../wallet/service';

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
