/**
 * Economy Hooks
 * TanStack Query hooks for UI consumption
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as service from '../service';
import type { CurrencyType, TransactionSource, AddCurrencyInput, SpendCurrencyInput, InitiatePurchaseInput } from '../schemas';

// ============================================================================
// Query Keys
// ============================================================================

export const economyKeys = {
  all: ['economy'] as const,
  wallet: (userId: string) => [...economyKeys.all, 'wallet', userId] as const,
  balance: (userId: string, currency?: CurrencyType) => [...economyKeys.all, 'balance', userId, currency] as const,
  transactions: (userId: string, filters?: Record<string, unknown>) => [...economyKeys.all, 'transactions', userId, filters] as const,
  purchase: (purchaseId: string) => [...economyKeys.all, 'purchase', purchaseId] as const,
};

// ============================================================================
// Wallet Queries
// ============================================================================

export function useWallet(userId: string) {
  return useQuery({
    queryKey: economyKeys.wallet(userId),
    queryFn: () => service.getOrCreateWallet(userId),
    enabled: Boolean(userId),
    staleTime: 1000 * 30, // 30 seconds
    gcTime: 1000 * 60 * 5, // 5 minutes
  });
}

// ============================================================================
// Transaction Queries
// ============================================================================

export function useWalletSummary(userId: string) {
  return useQuery({
    queryKey: [...economyKeys.wallet(userId), 'summary'],
    queryFn: () => service.getWalletSummary(userId),
    enabled: Boolean(userId),
    staleTime: 1000 * 30,
  });
}

export function useBalance(userId: string, currency: CurrencyType) {
  return useQuery({
    queryKey: economyKeys.balance(userId, currency),
    queryFn: () => service.getBalance(userId, currency),
    enabled: Boolean(userId),
    staleTime: 1000 * 10,
  });
}

export function useTransactionHistory(
  userId: string,
  options: {
    currency?: CurrencyType;
    source?: TransactionSource;
    startDate?: number;
    endDate?: number;
    limit?: number;
    offset?: number;
  } = {},
) {
  return useQuery({
    queryKey: economyKeys.transactions(userId, options),
    queryFn: () => service.getTransactionHistory(userId, options),
    enabled: Boolean(userId),
    staleTime: 1000 * 60, // 1 minute
  });
}

// ============================================================================
// Mutations
// ============================================================================

export function useAddCurrency() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: AddCurrencyInput) => service.addCurrency(input),
    onSuccess: (_result, input) => {
      queryClient.invalidateQueries({
        queryKey: economyKeys.wallet(input.userId),
      });
      queryClient.invalidateQueries({
        queryKey: economyKeys.balance(input.userId, input.currency),
      });
    },
  });
}

export function useSpendCurrency() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: SpendCurrencyInput) => service.spendCurrency(input),
    onSuccess: (result, input) => {
      if (result.success) {
        queryClient.invalidateQueries({
          queryKey: economyKeys.wallet(input.userId),
        });
        queryClient.invalidateQueries({
          queryKey: economyKeys.balance(input.userId, input.currency),
        });
        queryClient.invalidateQueries({
          queryKey: economyKeys.transactions(input.userId),
        });
      }
    },
  });
}

export function useInitiatePurchase() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: InitiatePurchaseInput) => service.initiatePurchase(input),
    onSuccess: (result) => {
      if (result.purchaseId) {
        queryClient.invalidateQueries({
          queryKey: economyKeys.purchase(result.purchaseId),
        });
      }
    },
  });
}

export function useProcessPurchasePayment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ purchaseId, currency, amount }: { purchaseId: string; currency: CurrencyType; amount: number }) => service.processPurchasePayment(purchaseId, currency, amount),
    onSuccess: (result, variables) => {
      queryClient.invalidateQueries({
        queryKey: economyKeys.purchase(variables.purchaseId),
      });
    },
  });
}

export function useCompletePurchaseDelivery() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ purchaseId, inventoryItemIds }: { purchaseId: string; inventoryItemIds: string[] }) => service.completePurchaseDelivery(purchaseId, inventoryItemIds),
    onSuccess: (result, variables) => {
      queryClient.invalidateQueries({
        queryKey: economyKeys.purchase(variables.purchaseId),
      });
    },
  });
}
