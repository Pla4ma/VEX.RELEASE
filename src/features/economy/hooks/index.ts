// Economy hooks — currency DISABLED (ARCH-04 decision).
// Wallet/balance hooks removed for final release (no spendable currency).
// Streak insurance is the only active economy feature.

export const economyKeys = {
  all: ['economy'] as const,
  wallet: (userId: string) => ['economy', 'wallet', userId] as const,
  transactions: (userId: string) =>
    ['economy', 'transactions', userId] as const,
};
