/**
 * Inventory Grid Component
 * Displays inventory items in a grid layout with filtering and sorting
 */

import React, { useState, useCallback, useMemo } from 'react';
import { View, Pressable, Text, RefreshControl } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { EmptyState } from '../../../components/EmptyState';
import { getPremiumCardStyle } from '../../../components/premiumStyles';
import { Skeleton } from '../../../components/ui/Skeleton';
import { useInventory, useFilteredInventory, inventoryKeys } from '../hooks';
import type { InventoryItem, InventoryFilter, ItemRarity, ItemType } from '../schemas';
import { createSheet } from '@/shared/ui/create-sheet';

// ============================================================================
// Types
// ============================================================================

interface InventoryGridProps {
  userId: string;
  onItemPress: (item: InventoryItem) => void;
  onItemLongPress?: (item: InventoryItem) => void;
  selectedItemIds?: string[];
  filter?: InventoryFilter;
  emptyState?: React.ReactNode;
  showQuickActions?: boolean;
}

interface InventoryItemCardProps {
  item: InventoryItem;
  onPress: () => void;
  onLongPress?: () => void;
  isSelected?: boolean;
  showQuickActions?: boolean;
  onQuickUse?: () => void;
}

// ============================================================================
// Inventory Item Card
// ============================================================================

const RARITY_COLORS: Record<ItemRarity, string> = {
  COMMON: '#9CA3AF',
  UNCOMMON: '#10B981',
  RARE: '#3B82F6',
  EPIC: '#8B5CF6',
  LEGENDARY: '#F59E0B',
};

const TYPE_ICONS: Record<ItemType, string> = {
  CONSUMABLE: '🧪',
  EQUIPMENT: '⚔️',
  COSMETIC: '👑',
  CRAFTING: '🔧',
  COLLECTIBLE: '🏆',
};

function InventoryItemCard({ item, onPress, onLongPress, isSelected, showQuickActions, onQuickUse }: InventoryItemCardProps) {
  // Would fetch item definition in real implementation
  const itemName = 'Item Name'; // Placeholder
  const itemRarity: ItemRarity = 'COMMON';
  const itemType: ItemType = 'CONSUMABLE';
  const isEquipped = item.status === 'EQUIPPED';

  return (
    <Pressable onPress={onPress} onLongPress={onLongPress} style={({ pressed }) => [styles.card, isSelected && styles.cardSelected, isEquipped && styles.cardEquipped, pressed && { opacity: 0.8 }]} accessibilityLabel={`${itemName}, quantity ${item.quantity}`} accessibilityRole="button" accessibilityHint="Activates this control">
      <View style={[styles.rarityBorder, { borderColor: RARITY_COLORS[itemRarity] }]}>
        <View style={styles.iconContainer}>
          <Text style={styles.icon}>{TYPE_ICONS[itemType]}</Text>
        </View>

        {item.quantity > 1 && (
          <View style={styles.quantityBadge}>
            <Text style={styles.quantityText}>{item.quantity}</Text>
          </View>
        )}

        {isEquipped && (
          <View style={styles.equippedBadge}>
            <Text style={styles.equippedText}>EQUIPPED</Text>
          </View>
        )}
      </View>

      <Text style={styles.itemName} numberOfLines={1}>
        {itemName}
      </Text>

      {showQuickActions && itemType === 'CONSUMABLE' && (
        <Pressable
          onPress={(e) => {
            e.stopPropagation();
            onQuickUse?.();
          }}
          style={({ pressed }) => [styles.quickUseButton, pressed && { opacity: 0.8 }]}
          accessibilityLabel="Quick use item"
          accessibilityRole="button"
          accessibilityHint="Activates this control"
        >
          <Text style={styles.quickUseText}>USE</Text>
        </Pressable>
      )}
    </Pressable>
  );
}

// ============================================================================
// Filter Bar
// ============================================================================

interface FilterBarProps {
  filter: InventoryFilter;
  onFilterChange: (filter: InventoryFilter) => void;
}

function FilterBar({ filter, onFilterChange }: FilterBarProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const typeOptions: ItemType[] = ['CONSUMABLE', 'EQUIPMENT', 'COSMETIC', 'CRAFTING', 'COLLECTIBLE'];
  const rarityOptions: ItemRarity[] = ['COMMON', 'UNCOMMON', 'RARE', 'EPIC', 'LEGENDARY'];

  const toggleType = (type: ItemType) => {
    const current = filter.types ?? [];
    const updated = current.includes(type) ? current.filter((t) => t !== type) : [...current, type];
    onFilterChange({ ...filter, types: updated });
  };

  const toggleRarity = (rarity: ItemRarity) => {
    const current = filter.rarities ?? [];
    const updated = current.includes(rarity) ? current.filter((r) => r !== rarity) : [...current, rarity];
    onFilterChange({ ...filter, rarities: updated });
  };

  return (
    <View style={styles.filterBar}>
      <Pressable onPress={() => setIsExpanded(!isExpanded)} style={({ pressed }) => [styles.filterToggle, pressed && { opacity: 0.8 }]} accessibilityLabel="Toggle filters button" accessibilityRole="button" accessibilityHint="Activates this control">
        <Text style={styles.filterToggleText}>{isExpanded ? '▼ Hide Filters' : '▶ Show Filters'}</Text>
      </Pressable>

      {isExpanded && (
        <View style={styles.filterPanel}>
          <Text style={styles.filterLabel}>Type</Text>
          <View style={styles.filterChips}>
            {typeOptions.map((type) => (
              <Pressable key={type} onPress={() => toggleType(type)} style={({ pressed }) => [styles.filterChip, filter.types?.includes(type) && styles.filterChipActive, pressed && { opacity: 0.8 }]} accessibilityLabel="Interactive control" accessibilityRole="button" accessibilityHint="Activates this control">
                <Text style={styles.filterChipText}>
                  {TYPE_ICONS[type]} {type}
                </Text>
              </Pressable>
            ))}
          </View>

          <Text style={styles.filterLabel}>Rarity</Text>
          <View style={styles.filterChips}>
            {rarityOptions.map((rarity) => (
              <Pressable key={rarity} onPress={() => toggleRarity(rarity)} style={({ pressed }) => [styles.filterChip, filter.rarities?.includes(rarity) && styles.filterChipActive, { borderColor: RARITY_COLORS[rarity] }, pressed && { opacity: 0.8 }]} accessibilityLabel="Interactive control" accessibilityRole="button" accessibilityHint="Activates this control">
                <Text style={[styles.filterChipText, { color: RARITY_COLORS[rarity] }]}>{rarity}</Text>
              </Pressable>
            ))}
          </View>
        </View>
      )}
    </View>
  );
}

// ============================================================================
// Main Grid Component
// ============================================================================

export function InventoryGrid({ userId, onItemPress, onItemLongPress, selectedItemIds = [], filter, emptyState, showQuickActions = false }: InventoryGridProps) {
  const [refreshing, setRefreshing] = useState(false);
  const [activeFilter, setActiveFilter] = useState<InventoryFilter>(
    filter ?? {
      sortBy: 'acquiredAt',
      sortOrder: 'desc',
    },
  );

  const { data: inventory, isLoading, isError, refetch } = useFilteredInventory(userId, activeFilter);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  const handleItemPress = useCallback(
    (item: InventoryItem) => {
      onItemPress(item);
    },
    [onItemPress],
  );

  const handleItemLongPress = useCallback(
    (item: InventoryItem) => {
      onItemLongPress?.(item);
    },
    [onItemLongPress],
  );

  const renderItem = useCallback(({ item }: { item: InventoryItem }) => <InventoryItemCard item={item} onPress={() => handleItemPress(item)} onLongPress={() => handleItemLongPress(item)} isSelected={selectedItemIds.includes(item.id)} showQuickActions={showQuickActions} />, [handleItemPress, handleItemLongPress, selectedItemIds, showQuickActions]);

  const keyExtractor = useCallback((item: InventoryItem, _index: number) => item.id, []);

  // Skeleton loading state
  if (isLoading) {
    return (
      <View style={styles.container}>
        <View style={styles.skeletonGrid}>
          {Array.from({ length: 12 }).map((_, i) => (
            <Skeleton key={i} width="23%" height={88} borderRadius={16} />
          ))}
        </View>
      </View>
    );
  }

  // Error state
  if (isError) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>Failed to load inventory</Text>
        <Pressable onPress={() => refetch()} style={({ pressed }) => [styles.retryButton, pressed && { opacity: 0.8 }]} accessibilityLabel="Retry button" accessibilityRole="button" accessibilityHint="Activates this control">
          <Text style={styles.retryText}>Retry</Text>
        </Pressable>
      </View>
    );
  }

  // Empty state
  if (!inventory || inventory.length === 0) {
    return <View style={styles.centerContainer}>{emptyState ?? <EmptyState icon="🎒" title="Your inventory is empty" body="Visit the shop or complete sessions to start collecting items, boosts, and rewards." />}</View>;
  }

  const flashListProps = {
    data: inventory,
    renderItem,
    keyExtractor,
    numColumns: 4,
    contentContainerStyle: styles.grid,
    refreshing,
    onRefresh,
    estimatedItemSize: 80,
  };

  return (
    <View style={styles.container}>
      <FilterBar filter={activeFilter} onFilterChange={setActiveFilter} />
      <FlashList {...flashListProps} />
    </View>
  );
}

// ============================================================================
// Styles
// ============================================================================

const styles = createSheet({
  container: {
    flex: 1,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  grid: {
    padding: 8,
  },
  skeletonGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 8,
  },
  skeletonCard: {
    width: '23%',
    aspectRatio: 1,
    margin: '1%',
    backgroundColor: '#E5E7EB',
    borderRadius: 16,
  },
  card: {
    width: '23%',
    margin: '1%',
    backgroundColor: '#FFFFFF',
    ...getPremiumCardStyle('small'),
    padding: 8,
  },
  cardSelected: {
    backgroundColor: '#DBEAFE',
    borderWidth: 2,
    borderColor: '#3B82F6',
  },
  cardEquipped: {
    backgroundColor: '#FEF3C7',
  },
  rarityBorder: {
    borderWidth: 2,
    borderRadius: 6,
    padding: 4,
  },
  iconContainer: {
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  icon: {
    fontSize: 32,
  },
  quantityBadge: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    backgroundColor: '#374151',
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  quantityText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  equippedBadge: {
    position: 'absolute',
    top: -8,
    left: 0,
    right: 0,
    backgroundColor: '#F59E0B',
    borderRadius: 4,
    paddingVertical: 2,
  },
  equippedText: {
    color: '#FFFFFF',
    fontSize: 8,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  itemName: {
    fontSize: 10,
    color: '#374151',
    marginTop: 4,
    textAlign: 'center',
  },
  quickUseButton: {
    backgroundColor: '#10B981',
    borderRadius: 4,
    paddingVertical: 4,
    marginTop: 4,
  },
  quickUseText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  filterBar: {
    backgroundColor: '#F9FAFB',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  filterToggle: {
    paddingVertical: 4,
  },
  filterToggleText: {
    color: '#6B7280',
    fontSize: 14,
  },
  filterPanel: {
    marginTop: 12,
  },
  filterLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#374151',
    marginTop: 8,
    marginBottom: 4,
  },
  filterChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    backgroundColor: '#FFFFFF',
  },
  filterChipActive: {
    backgroundColor: '#DBEAFE',
    borderColor: '#3B82F6',
  },
  filterChipText: {
    fontSize: 12,
    color: '#374151',
  },
  errorText: {
    fontSize: 16,
    color: '#EF4444',
    marginBottom: 12,
  },
  retryButton: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
});
