// REVIEW(ARCH-04): This barrel claims currency is "archived" (always zero/false) but
// wallet-service exports live RPC calls consumed by reward-ledger and companion.
// Confirm with product owner: is currency live or disabled?
// If live: P0-07/P0-08 fixes above are critical.
// If disabled: replace addCurrency/spendCurrency with true no-ops returning {success:false}/0.
export { SimpleWalletBadge } from './components/SimpleWalletBadge';
export { useWallet } from './hooks';
export { addCurrency, spendCurrency } from './wallet-service';
export { getInsuranceStatus } from './StreakInsurance';
export type { StreakInsuranceStatus, InsuranceStatus } from './StreakInsurance';
