/**
 * Shop Hooks Tests
 *
 * Tests for shop functionality including purchases, currency, and inventory
 */

import { renderHook, act, waitFor } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import {
  useShopItems,
  usePurchaseItem,
  useUserCurrency,
  useShopCategories,
} from '../hooks';
import { getSupabaseClient } from '../../../config/supabase';

// Mock Supabase
jest.mock('../../../config/supabase');

const mockSupabase = {
  from: jest.fn().mockReturnThis(),
  select: jest.fn().mockReturnThis(),
  eq: jest.fn().mockReturnThis(),
  order: jest.fn().mockReturnThis(),
  single: jest.fn(),
  insert: jest.fn().mockReturnThis(),
  update: jest.fn().mockReturnThis(),
  rpc: jest.fn(),
};

(getSupabaseClient as jest.Mock).mockReturnValue(mockSupabase);

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });
  return ({ children }: { children: React.ReactNode }) => (
    React.createElement(QueryClientProvider, { client: queryClient }, children)
  );
};

const TEST_USER_ID = 'test-user-123';

describe('Shop Hooks', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('useShopItems', () => {
    it('should fetch shop items', async () => {
      const mockItems = [
        {
          id: 'item-1',
          name: 'Energy Potion',
          description: 'Restores energy',
          price: 100,
          currency: 'COINS',
          category: 'CONSUMABLES',
          icon: 'potion',
          maxPurchaseQuantity: 99,
        },
        {
          id: 'item-2',
          name: 'Focus Sword',
          description: 'Increases focus',
          price: 500,
          currency: 'GEMS',
          category: 'EQUIPMENT',
          icon: 'sword',
          maxPurchaseQuantity: 1,
        },
      ];

      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            order: jest.fn().mockResolvedValue({ data: mockItems, error: null }),
          }),
        }),
      });

      const { result } = renderHook(() => useShopItems({ category: 'ALL' }), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data).toHaveLength(2);
      expect(result.current.data?.[0].name).toBe('Energy Potion');
    });

    it('should filter items by category', async () => {
      const mockItems = [
        { id: 'item-1', name: 'Potion', category: 'CONSUMABLES' },
        { id: 'item-2', name: 'Sword', category: 'EQUIPMENT' },
      ];

      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            order: jest.fn().mockResolvedValue({ data: [mockItems[0]], error: null }),
          }),
        }),
      });

      const { result } = renderHook(() => useShopItems({ category: 'CONSUMABLES' }), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data?.every(item => item.category === 'CONSUMABLES')).toBe(true);
    });
  });

  describe('usePurchaseItem', () => {
    it('should purchase item successfully', async () => {
      mockSupabase.rpc.mockResolvedValue({
        data: { success: true, itemId: 'item-1', newBalance: 900 },
        error: null,
      });

      const { result } = renderHook(() => usePurchaseItem(TEST_USER_ID), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        await result.current.mutateAsync({
          itemId: 'item-1',
          quantity: 1,
          currency: 'COINS',
        });
      });

      expect(result.current.isSuccess).toBe(true);
    });

    it('should handle purchase failure', async () => {
      mockSupabase.rpc.mockResolvedValue({
        data: null,
        error: { message: 'Insufficient funds' },
      });

      const { result } = renderHook(() => usePurchaseItem(TEST_USER_ID), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        try {
          await result.current.mutateAsync({
            itemId: 'item-1',
            quantity: 1,
            currency: 'COINS',
          });
        } catch (e) {
          // Expected to throw
        }
      });

      expect(result.current.isError).toBe(true);
    });
  });

  describe('useUserCurrency', () => {
    it('should fetch user currency balance', async () => {
      const mockBalance = {
        coins: 1500,
        gems: 50,
        premium: true,
      };

      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({ data: mockBalance, error: null }),
          }),
        }),
      });

      const { result } = renderHook(() => useUserCurrency(TEST_USER_ID), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data?.coins).toBe(1500);
      expect(result.current.data?.gems).toBe(50);
    });
  });

  describe('useShopCategories', () => {
    it('should return shop categories', async () => {
      const { result } = renderHook(() => useShopCategories());

      // Categories should be available immediately (static data)
      expect(result.current.data).toBeDefined();
      expect(result.current.data?.length).toBeGreaterThan(0);
      expect(result.current.data?.some(c => c.id === 'CONSUMABLES')).toBe(true);
      expect(result.current.data?.some(c => c.id === 'EQUIPMENT')).toBe(true);
    });
  });
});
