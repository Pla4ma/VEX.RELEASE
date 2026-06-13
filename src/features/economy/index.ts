/**
 * Economy feature — currency DISABLED (ARCH-04 decision).
 * All spendable currency (wallet/shop/wagers/transactions) logic archived.
 * addCurrency/spendCurrency are no-ops returning false/zero.
 * Streak insurance is the only active economy feature.
 */
export { SimpleWalletBadge } from './components/SimpleWalletBadge';
export { addCurrency, spendCurrency } from './wallet-service';
export { getInsuranceStatus } from './StreakInsurance';
export type { StreakInsuranceStatus, InsuranceStatus } from './StreakInsurance';
