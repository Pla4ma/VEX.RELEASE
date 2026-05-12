import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getWalletState,
  getTransactionHistory,
  earnCoins,
  spendCoins,
  earnGems,
  spendGems,
  getBalance,
} from './service';
import type { EarnCoinsInput, SpendCoinsInput } from './types';

export function useWallet(userId: string) {
  const query = useQuery({
    queryKey: ['wallet', 'state', userId],
    queryFn: () => getWalletState(userId),
    staleTime: 1000 * 60,
  });

  return {
    wallet: query.data ?? null,
    isPending: query.isPending,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
}

export function useTransactionHistory(userId: string, limit: number = 50) {
  const query = useQuery({
    queryKey: ['wallet', 'transactions', userId, limit],
    queryFn: () => getTransactionHistory(userId, limit),
    staleTime: 1000 * 30,
  });

  return {
    transactions: query.data ?? [],
    isPending: query.isPending,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
}

export function useEarnCoins() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: EarnCoinsInput) => earnCoins(input),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['wallet', 'state', variables.userId] });
      queryClient.invalidateQueries({ queryKey: ['wallet', 'transactions', variables.userId] });
    },
  });
}

export function useSpendCoins() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: SpendCoinsInput) => spendCoins(input),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['wallet', 'state', variables.userId] });
      queryClient.invalidateQueries({ queryKey: ['wallet', 'transactions', variables.userId] });
    },
  });
}

export function useEarnGems() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: EarnCoinsInput) => earnGems(input),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['wallet', 'state', variables.userId] });
      queryClient.invalidateQueries({ queryKey: ['wallet', 'transactions', variables.userId] });
    },
  });
}

export function useSpendGems() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: SpendCoinsInput) => spendGems(input),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['wallet', 'state', variables.userId] });
      queryClient.invalidateQueries({ queryKey: ['wallet', 'transactions', variables.userId] });
    },
  });
}

export function useBalance(userId: string, currency: string) {
  const query = useQuery({
    queryKey: ['wallet', 'balance', userId, currency],
    queryFn: () => getBalance(userId, currency),
    staleTime: 1000 * 30,
  });

  return {
    balance: query.data ?? 0,
    isPending: query.isPending,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
}
