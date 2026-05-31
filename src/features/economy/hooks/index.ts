import { useQuery } from '@tanstack/react-query';

interface WalletData {
  coins: number;
  gems: number;
}

export function useWallet(
  userId?: string | null,
  options?: { enabled?: boolean },
) {
  return useQuery<WalletData>({
    enabled: Boolean(userId) && (options?.enabled ?? true),
    queryFn: () => Promise.resolve({ coins: 0, gems: 0 }),
    queryKey: ['wallet', userId ?? ''],
  });
}


export function useBalance(userId?: string | null, _currency?: string) {
  return useQuery<number>({
    enabled: !!userId,
    queryFn: () => Promise.resolve(0),
    queryKey: ['balance', userId ?? ''],
  });
}

export const economyKeys = {
  all: ['economy'] as const,
  wallet: (userId: string) => ['economy', 'wallet', userId] as const,
  transactions: (userId: string) =>
    ['economy', 'transactions', userId] as const,
};
