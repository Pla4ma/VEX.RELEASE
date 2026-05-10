/**
 * Item Service Tests
 * 
 * Comprehensive test coverage for item definitions, effects, and drop tables
 */

import {
  getItemDefinition,
  getItemsByType,
  getItemsByRarity,
  applyItemEffect,
  getDropTable,
  rollDropTable,
  clearItemCache,
} from '../service';
import { getSupabaseClient } from '../../../config/supabase';

// Mock Supabase
jest.mock('../../../config/supabase');

const mockSupabase = {
  from: jest.fn().mockReturnThis(),
  select: jest.fn().mockReturnThis(),
  eq: jest.fn().mockReturnThis(),
  single: jest.fn(),
  in: jest.fn().mockReturnThis(),
};

(getSupabaseClient as jest.Mock).mockReturnValue(mockSupabase);

const TEST_ITEM_ID = 'item-123';

describe('Item Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    clearItemCache();
    mockSupabase.single.mockReset();
  });

  describe('getItemDefinition', () => {
    it('should return null for non-existent item', async () => {
      mockSupabase.single.mockResolvedValue({ data: null, error: null });

      const result = await getItemDefinition('non-existent');

      expect(result).toBeNull();
    });

    it('should fetch and cache item definition', async () => {
      const mockItem = {
        id: TEST_ITEM_ID,
        name: 'Test Item',
        description: 'A test item',
        type: 'CONSUMABLE',
        rarity: 'COMMON',
        effects: [{ type: 'XP_BOOST', value: 10 }],
        icon: 'test-icon',
        value: 100,
        maxStack: 99,
        tradable: true,
        usable: true,
      };
      mockSupabase.single.mockResolvedValue({ data: mockItem, error: null });

      const result = await getItemDefinition(TEST_ITEM_ID);

      expect(result).toMatchObject({
        id: TEST_ITEM_ID,
        name: 'Test Item',
        type: 'CONSUMABLE',
      });
    });

    it('should return cached item on subsequent calls', async () => {
      const mockItem = {
        id: TEST_ITEM_ID,
        name: 'Cached Item',
        description: 'A cached item',
        type: 'EQUIPMENT',
        rarity: 'RARE',
        effects: [],
        icon: 'cached-icon',
        value: 500,
        maxStack: 1,
        tradable: false,
        usable: false,
      };
      mockSupabase.single.mockResolvedValue({ data: mockItem, error: null });

      // First call - should hit database
      await getItemDefinition(TEST_ITEM_ID);
      expect(mockSupabase.from).toHaveBeenCalledWith('item_definitions');

      // Reset mock to verify cache is used
      jest.clearAllMocks();

      // Second call - should use cache
      const result = await getItemDefinition(TEST_ITEM_ID);
      expect(result?.name).toBe('Cached Item');
      expect(mockSupabase.from).not.toHaveBeenCalled();
    });

    it('should throw error on database failure', async () => {
      mockSupabase.single.mockResolvedValue({ 
        data: null, 
        error: { message: 'Database error' } 
      });

      await expect(getItemDefinition(TEST_ITEM_ID)).rejects.toThrow();
    });
  });

  describe('getItemsByType', () => {
    it('should return items filtered by type', async () => {
      const mockItems = [
        { id: 'item-1', name: 'Potion', type: 'CONSUMABLE' },
        { id: 'item-2', name: 'Sword', type: 'EQUIPMENT' },
      ];
      
      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            data: mockItems,
            error: null,
          }),
        }),
      });

      const result = await getItemsByType({ type: 'CONSUMABLE' });

      expect(result).toHaveLength(2);
    });
  });

  describe('getItemsByRarity', () => {
    it('should return items filtered by rarity', async () => {
      const mockItems = [
        { id: 'item-1', name: 'Common Sword', rarity: 'COMMON' },
        { id: 'item-2', name: 'Rare Shield', rarity: 'RARE' },
        { id: 'item-3', name: 'Epic Armor', rarity: 'EPIC' },
      ];
      
      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          in: jest.fn().mockReturnValue({
            data: mockItems.filter(i => ['COMMON', 'RARE'].includes(i.rarity)),
            error: null,
          }),
        }),
      });

      const result = await getItemsByRarity({ rarities: ['COMMON', 'RARE'] });

      expect(result.length).toBeGreaterThan(0);
    });
  });

  describe('applyItemEffect', () => {
    it('should apply XP boost effect', async () => {
      const mockItem = {
        id: TEST_ITEM_ID,
        name: 'XP Boost Potion',
        effects: [{ type: 'XP_BOOST', value: 50, duration: 3600 }],
      };
      mockSupabase.single.mockResolvedValue({ data: mockItem, error: null });

      const result = await applyItemEffect({
        itemDefinitionId: TEST_ITEM_ID,
        userId: 'user-123',
        context: { sessionQuality: 'good' },
      });

      expect(result.success).toBe(true);
      expect(result.effectType).toBe('XP_BOOST');
    });

    it('should apply coin reward effect', async () => {
      const mockItem = {
        id: TEST_ITEM_ID,
        name: 'Coin Bag',
        effects: [{ type: 'COIN_REWARD', value: 100 }],
      };
      mockSupabase.single.mockResolvedValue({ data: mockItem, error: null });

      const result = await applyItemEffect({
        itemDefinitionId: TEST_ITEM_ID,
        userId: 'user-123',
        context: {},
      });

      expect(result.success).toBe(true);
      expect(result.effectType).toBe('COIN_REWARD');
    });

    it('should throw error for non-usable item', async () => {
      const mockItem = {
        id: TEST_ITEM_ID,
        name: 'Decorative Item',
        usable: false,
        effects: [],
      };
      mockSupabase.single.mockResolvedValue({ data: mockItem, error: null });

      await expect(
        applyItemEffect({
          itemDefinitionId: TEST_ITEM_ID,
          userId: 'user-123',
          context: {},
        })
      ).rejects.toThrow('Item is not usable');
    });
  });

  describe('getDropTable', () => {
    it('should return drop table for source', async () => {
      const mockDropTable = {
        id: 'drop-123',
        source: 'BOSS_DEFEAT',
        drops: [
          { itemId: 'sword-1', weight: 50, minQuantity: 1, maxQuantity: 1 },
          { itemId: 'shield-1', weight: 30, minQuantity: 1, maxQuantity: 1 },
          { itemId: 'potion-1', weight: 20, minQuantity: 1, maxQuantity: 3 },
        ],
      };
      
      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            data: mockDropTable,
            error: null,
          }),
        }),
      });

      const result = await getDropTable({ source: 'BOSS_DEFEAT' });

      expect(result).toBeDefined();
      expect(result?.drops).toHaveLength(3);
    });

    it('should return null for non-existent drop table', async () => {
      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            data: null,
            error: null,
          }),
        }),
      });

      const result = await getDropTable({ source: 'NON_EXISTENT' });

      expect(result).toBeNull();
    });
  });

  describe('rollDropTable', () => {
    it('should return drops based on weights', async () => {
      const mockDropTable = {
        id: 'drop-123',
        source: 'CHEST',
        drops: [
          { itemId: 'common-1', weight: 70, minQuantity: 1, maxQuantity: 1 },
          { itemId: 'rare-1', weight: 25, minQuantity: 1, maxQuantity: 1 },
          { itemId: 'epic-1', weight: 5, minQuantity: 1, maxQuantity: 1 },
        ],
      };

      // Mock multiple rolls
      const results = [];
      for (let i = 0; i < 10; i++) {
        results.push(await rollDropTable(mockDropTable));
      }

      // All results should have at least one drop
      expect(results.every(r => r.length > 0)).toBe(true);

      // Should have variety of items based on weights
      const allItemIds = results.flat().map(d => d.itemId);
      expect(allItemIds.some(id => id === 'common-1')).toBe(true);
    });

    it('should respect min/max quantity', async () => {
      const mockDropTable = {
        id: 'drop-123',
        source: 'CHEST',
        drops: [
          { itemId: 'coins', weight: 100, minQuantity: 10, maxQuantity: 50 },
        ],
      };

      const result = await rollDropTable(mockDropTable);

      expect(result).toHaveLength(1);
      expect(result[0].quantity).toBeGreaterThanOrEqual(10);
      expect(result[0].quantity).toBeLessThanOrEqual(50);
    });
  });

  describe('Cache management', () => {
    it('should clear item cache', async () => {
      const mockItem = {
        id: TEST_ITEM_ID,
        name: 'Cached Item',
        description: 'Test',
        type: 'CONSUMABLE',
        rarity: 'COMMON',
        effects: [],
        icon: 'test',
        value: 100,
        maxStack: 99,
        tradable: true,
        usable: true,
      };
      mockSupabase.single.mockResolvedValue({ data: mockItem, error: null });

      // Cache item
      await getItemDefinition(TEST_ITEM_ID);

      // Clear cache
      clearItemCache();

      // Reset mock
      jest.clearAllMocks();
      mockSupabase.single.mockResolvedValue({ data: mockItem, error: null });

      // Should fetch from database again
      await getItemDefinition(TEST_ITEM_ID);
      expect(mockSupabase.from).toHaveBeenCalled();
    });
  });
});
