/**
 * Shop Hooks
 * TanStack Query hooks for shop functionality
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as itemService from '../../items/service';
import * as economyService from '../../economy/service';
import type { ItemType } from '../../items/schemas';
import type { InitiatePurchaseInput, PurchaseResult } from '../../economy/schemas';

// ============================================================================
// Query Keys
// ============================================================================

export const shopKeys = {
  all: ['shop'] as const,
  items: (category?: ItemType) => [...shopKeys.all, 'items', category] as const,
  item: (id: string) => [...shopKeys.all, 'item', id] as const,
  offers: (userId: string, level: number) => [...shopKeys.all, 'offers', userId, level] as const,
  purchase: (id: string) => [...shopKeys.all, 'purchase', id] as const,
};

// ============================================================================
// Shop Item Queries
// ============================================================================

export function useShopItems(category?: ItemType | 'ALL' | 'OFFERS') {
  return useQuery({
    queryKey: shopKeys.items(category as ItemType),
    queryFn: async () => {
      if (category && category !== 'ALL' && category !== 'OFFERS') {
        return itemService.getItemsByType({ type: category, includeUnavailable: false });
      }
      return itemService.getShopItems();
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

export function useShopItem(itemId: string) {
  return useQuery({
    queryKey: shopKeys.item(itemId),
    queryFn: () => itemService.getItemDefinition(itemId),
    staleTime: 1000 * 60 * 5,
    enabled: !!itemId,
  });
}

// ============================================================================
// Offer Queries
// ============================================================================

export function useActiveOffers(userId: string, userLevel: number) {
  return useQuery({
    queryKey: shopKeys.offers(userId, userLevel),
    queryFn: () => economyService.getActiveOffers(userLevel),
    staleTime: 1000 * 60 * 5,
    enabled: !!userId,
  });
}

// ============================================================================
// Purchase Mutations
// ============================================================================

export function useInitiatePurchase() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: InitiatePurchaseInput): Promise<PurchaseResult> => {
      return economyService.initiatePurchase(input);
    },
    onSuccess: (result) => {
      if (result.success && result.purchaseId) {
        // Optimistically update pending purchases
        queryClient.setQueryData(
          shopKeys.purchase(result.purchaseId),
          result
        );
      }
    },
  });
}

export function useCompletePurchaseDelivery() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ purchaseId, inventoryItemIds }: { purchaseId: string; inventoryItemIds: string[] }) => {
      return economyService.completePurchaseDelivery(purchaseId, inventoryItemIds);
    },
    onSuccess: () => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['economy'] });
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
      queryClient.invalidateQueries({ queryKey: shopKeys.all });
    },
  });
}

export function useProcessPurchasePayment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ purchaseId, currency, amount }: { purchaseId: string; currency: 'COINS' | 'GEMS' | 'SEASONAL'; amount: number }) => {
      return economyService.processPurchasePayment(purchaseId, currency, amount);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: shopKeys.all });
    },
  });
}
