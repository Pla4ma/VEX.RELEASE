/**
 * Shop Item Card Component
 * Displays a single shop item with its details
 */

import React from 'react';
import { View, Text, Pressable } from 'react-native';
import type { ItemDefinition } from '../../items/schemas';
import type { LimitedOffer } from '../../economy/schemas';
import { RARITY_COLORS, ITEM_WIDTH } from './shop-constants';
import { createSheet } from '@/shared/ui/create-sheet';

interface ShopItemCardProps {
  item: ItemDefinition;
  offer?: LimitedOffer;
  userLevel: number;
  onPress: () => void;
  disabled?: boolean;
}

export function ShopItemCard({ item, offer, userLevel, onPress, disabled }: ShopItemCardProps): React.ReactElement {
  const price = offer?.discountedPrice?.amount ?? item.baseValue;
  const originalPrice = offer?.originalPrice?.amount ?? null;
  const discount = offer?.discountPercent ?? 0;
  const canAfford = true;
  const meetsLevel = userLevel >= ((item as { requiredLevel?: number }).requiredLevel ?? 1);

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || !meetsLevel}
      style={({ pressed }) => [styles.itemCard, (!meetsLevel || disabled) && styles.itemCardDisabled, pressed && { opacity: 0.8 }]}
      accessibilityRole="button"
      accessibilityLabel={`${item.name}, ${price} coins`}
      accessibilityHint="Activates this control">
      <View style={[styles.rarityBorder, { borderColor: RARITY_COLORS[item.rarity] }]}>
        <View style={styles.iconContainer}>
          <Text style={styles.iconPlaceholder}>📦</Text>
        </View>

        {discount > 0 && (
          <View style={styles.discountBadge}>
            <Text style={styles.discountText}>-{discount}%</Text>
          </View>
        )}

        {!meetsLevel && (
          <View style={styles.levelLock}>
            <Text style={styles.levelLockText}>Lv. {item.requiredLevel}</Text>
          </View>
        )}
      </View>

      <Text style={styles.itemName} numberOfLines={1}>{item.name}</Text>

      <View style={styles.priceContainer}>
        {originalPrice && (
          <Text style={styles.originalPrice}>{originalPrice}</Text>
        )}
        <View style={styles.priceRow}>
          <Text style={styles.coinIcon}>🪙</Text>
          <Text style={[styles.price, !canAfford && styles.priceUnaffordable]}>
            {price.toLocaleString()}
          </Text>
        </View>
      </View>

      {offer && (
        <View style={styles.limitedBadge}>
          <Text style={styles.limitedText}>⏰ Limited</Text>
        </View>
      )}
    </Pressable>
  );
}

const styles = createSheet({
  itemCard: {
    width: ITEM_WIDTH,
    marginBottom: 16,
  },
  itemCardDisabled: {
    opacity: 0.5,
  },
  rarityBorder: {
    borderWidth: 2,
    borderRadius: 12,
    padding: 8,
    position: 'relative',
  },
  iconContainer: {
    width: '100%',
    aspectRatio: 1,
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconPlaceholder: {
    fontSize: 32,
  },
  discountBadge: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#EF4444',
    borderRadius: 12,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  discountText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },
  levelLock: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -25 }, { translateY: -10 }],
    backgroundColor: 'rgba(0,0,0,0.7)',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  levelLockText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  itemName: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 8,
    textAlign: 'center',
  },
  priceContainer: {
    alignItems: 'center',
    marginTop: 4,
  },
  originalPrice: {
    fontSize: 11,
    textDecorationLine: 'line-through',
    color: '#9CA3AF',
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  coinIcon: {
    fontSize: 12,
  },
  price: {
    fontSize: 13,
    fontWeight: '700',
  },
  priceUnaffordable: {
    color: '#EF4444',
  },
  limitedBadge: {
    position: 'absolute',
    top: 4,
    left: 4,
    backgroundColor: '#8B5CF6',
    borderRadius: 4,
    paddingHorizontal: 4,
    paddingVertical: 2,
  },
  limitedText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '700',
  },
});
