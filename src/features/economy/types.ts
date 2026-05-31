/**
 * Internal-only wallet — not user-facing.
 * Currency is infrastructure, not progression. No game economy UI.
 * @deprecated Economy concept is being phased out. Use weekly-intelligence for progression.
 */
export interface WalletSummary {
  /** @deprecated Internal infrastructure only */
  coins: number;
  /** @deprecated Internal infrastructure only */
  gems: number;
}

export type SpendErrorCode = 'INSUFFICIENT_BALANCE' | 'INVALID_CURRENCY' | 'DB_ERROR';

export interface SpendError {
  code: SpendErrorCode;
  message: string;
}
