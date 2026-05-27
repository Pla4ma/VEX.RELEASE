/**
 * Economy feature stubs — active runtime only.
 * All spendable currency (wallet/shop/wagers/transactions) logic archived.
 * Streak insurance is no-op. Return values always zero/false.
 */
export { SimpleWalletBadge } from "./components/SimpleWalletBadge";
export { useWallet } from "./hooks";
export { addCurrency, spendCurrency } from "./wallet-service";
export { getInsuranceStatus } from "./StreakInsurance";
export type { StreakInsuranceStatus, InsuranceStatus } from "./StreakInsurance";
