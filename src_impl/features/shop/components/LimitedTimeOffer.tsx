/**
 * Limited Time Offer Component
 *
 * Flash sales and rotating shop items with countdown timers.
 * Creates urgency through scarcity and time-limited deals.
 *
 * Features:
 * - Flash sales with percentage discounts
 * - Countdown timers
 * - "Last seen" tracking for rare items
 * - Sale badges with original price crossed out
 *
 * Passes the test: "Would a free user feel like they're missing out?"
 * Answer: YES — limited time creates urgency, rare items create FOMO
 */

import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { Pressable, StyleSheet, View, Dimensions } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withRepeat, withSequence, withTiming, interpolate, Extrapolation, FadeIn, FadeInRight } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';

import { Text } from '../../../components/primitives/Text';
import { useTheme } from '../../../theme';
import { capture } from '../../../shared/analytics';
import { EconomyEvents } from '../../../shared/analytics/analytics-events';
import { triggerHaptic } from '../../../utils/haptics';
import { createSheet } from '@/shared/ui/create-sheet';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Sale gradient
const FLASH_SALE_GRADIENT = ['#EF4444', '#F97316', '#F59E0B'] as const;
const RARE_GRADIENT = ['#A855F7', '#EC4899'] as const;

export interface ShopItem {
  id: string;
  name: string;
  description: string;
  icon: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  price: {
    gems?: number;
    coins?: number;
  };
  originalPrice?: {
    gems?: number;
    coins?: number;
  };
  discount?: number;
  isFlashSale?: boolean;
  flashSaleEndsAt?: Date;
  lastSeenDays?: number;
  totalAppearances?: number;
}

interface LimitedTimeOfferProps {
  /** Items currently on sale */
  items: ShopItem[];
  /** Callback when item is purchased */
  onPurchase: (item: ShopItem) => void;
  /** Callback when item details are viewed */
  onViewDetails?: (item: ShopItem) => void;
  /** User's current gem balance */
  gemBalance: number;
  /** User's current coin balance */
  coinBalance: number;
}

export function LimitedTimeOffer({ items, onPurchase, onViewDetails, gemBalance, coinBalance }: LimitedTimeOfferProps): JSX.Element | null {
  const { theme } = useTheme();
  const { colors } = theme;
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update countdown timer every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Filter to only show items with limited time offers
  const limitedItems = useMemo(() => {
    return items.filter((item) => item.isFlashSale || item.discount || (item.totalAppearances && item.totalAppearances < 3));
  }, [items]);

  if (limitedItems.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      {/* Section Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.flashIcon}>
            <Text style={styles.flashEmoji}>⚡</Text>
          </View>
          <View>
            <Text variant="h4" fontSize={18} color="text.primary">
              Limited Time
            </Text>
            <Text variant="bodySmall" color="text.secondary">
              {limitedItems.length} exclusive deals
            </Text>
          </View>
        </View>
        <View style={[styles.rareBadge, { backgroundColor: colors.warning.DEFAULT }]}>
          <Text style={styles.rareBadgeText}>FLASH</Text>
        </View>
      </View>

      {/* Items Grid */}
      <View style={styles.itemsGrid}>
        {limitedItems.map((item, index) => (
          <OfferCard key={item.id} item={item} index={index} currentTime={currentTime} gemBalance={gemBalance} coinBalance={coinBalance} onPurchase={onPurchase} onViewDetails={onViewDetails} />
        ))}
      </View>
    </View>
  );
}

// Individual offer card
interface OfferCardProps {
  item: ShopItem;
  index: number;
  currentTime: Date;
  gemBalance: number;
  coinBalance: number;
  onPurchase: (item: ShopItem) => void;
  onViewDetails?: (item: ShopItem) => void;
}

function OfferCard({ item, index, currentTime, gemBalance, coinBalance, onPurchase, onViewDetails }: OfferCardProps) {
  const { theme } = useTheme();
  const { colors } = theme;

  const [isPressed, setIsPressed] = useState(false);
  const pulseScale = useSharedValue(1);

  // Pulsing animation for flash sales
  useEffect(() => {
    if (item.isFlashSale) {
      pulseScale.value = withRepeat(withSequence(withTiming(1.02, { duration: 800 }), withTiming(1, { duration: 800 })), -1, true);
    }
  }, [item.isFlashSale, pulseScale]);

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }],
  }));

  // Calculate countdown for flash sales
  const getCountdown = () => {
    if (!item.flashSaleEndsAt) {
      return null;
    }
    const diff = item.flashSaleEndsAt.getTime() - currentTime.getTime();
    if (diff <= 0) {
      return 'Expired';
    }

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m ${seconds}s`;
  };

  // Check affordability
  const canAfford = useMemo(() => {
    if (item.price.gems) {
      return gemBalance >= (item.price.gems || 0);
    }
    if (item.price.coins) {
      return coinBalance >= (item.price.coins || 0);
    }
    return false;
  }, [item.price, gemBalance, coinBalance]);

  const handlePress = () => {
    triggerHaptic('impactLight');
    capture(EconomyEvents.SHOP_VIEWED, {
      item_id: item.id,
      item_name: item.name,
      item_type: 'limited_time',
      item_rarity: item.rarity,
      source: 'flash_sale',
    });
    onViewDetails?.(item);
  };

  const handlePurchase = () => {
    if (!canAfford) {
      return;
    }
    triggerHaptic('success');
    onPurchase(item);
  };

  // Determine card styling based on rarity and sale type
  const isRare = item.totalAppearances && item.totalAppearances < 3;
  const isFlashSale = item.isFlashSale;

  const rarityColors = {
    common: colors.border.DEFAULT,
    rare: '#3B82F6',
    epic: '#A855F7',
    legendary: '#FFD700',
  };

  const gradientColors: readonly [string, string, ...string[]] = isFlashSale ? FLASH_SALE_GRADIENT : isRare ? RARE_GRADIENT : [rarityColors[item.rarity], rarityColors[item.rarity]];

  return (
    <Animated.View entering={FadeInRight.duration(400).delay(index * 100)} style={[styles.card, pulseStyle]}>
      <Pressable
        onPress={handlePress}
        onPressIn={() => setIsPressed(true)}
        onPressOut={() => setIsPressed(false)}
        style={[
          styles.cardInner,
          {
            backgroundColor: colors.background.secondary,
            borderColor: isFlashSale ? '#EF4444' : rarityColors[item.rarity],
            borderWidth: isFlashSale ? 3 : 2,
            opacity: canAfford ? 1 : 0.6,
            transform: [{ scale: isPressed ? 0.98 : 1 }],
          },
        ]}
        accessibilityLabel="Interactive control"
        accessibilityRole="button"
        accessibilityHint="Activates this control"
      >
        {/* Flash Sale / Rare Banner */}
        {(isFlashSale || isRare) && (
          <LinearGradient colors={[...gradientColors]} style={styles.banner} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
            <Text style={styles.bannerText}>{isFlashSale ? `⚡ FLASH SALE -${item.discount}%` : isRare ? `🔥 RARE - Last seen ${item.lastSeenDays}d ago` : `${item.rarity.toUpperCase()}`}</Text>
          </LinearGradient>
        )}

        {/* Item Content */}
        <View style={styles.content}>
          <Text style={styles.icon}>{item.icon}</Text>
          <Text variant="body" fontWeight="700" color="text.primary" style={styles.name}>
            {item.name}
          </Text>
          <Text variant="caption" color="text.secondary" numberOfLines={2}>
            {item.description}
          </Text>
        </View>

        {/* Countdown Timer */}
        {item.isFlashSale && (
          <View style={styles.countdownContainer}>
            <View style={[styles.countdown, { backgroundColor: 'rgba(239, 68, 68, 0.1)' }]}>
              <Text style={[styles.countdownText, { color: '#EF4444' }]}>⏰ {getCountdown()}</Text>
            </View>
          </View>
        )}

        {/* Price Section */}
        <View style={styles.priceSection}>
          {/* Original price (crossed out if on sale) */}
          {item.originalPrice && (
            <View style={styles.originalPrice}>
              {item.originalPrice.gems && (
                <Text variant="bodySmall" color="text.tertiary" style={styles.strikethrough}>
                  💎{item.originalPrice.gems}
                </Text>
              )}
              {item.originalPrice.coins && (
                <Text variant="bodySmall" color="text.tertiary" style={styles.strikethrough}>
                  🪙{item.originalPrice.coins}
                </Text>
              )}
            </View>
          )}

          {/* Current price */}
          <View style={styles.currentPrice}>
            {item.price.gems && (
              <Text variant="body" fontWeight="800" color={canAfford ? '#8B5CF6' : 'error.DEFAULT'}>
                💎{item.price.gems}
              </Text>
            )}
            {item.price.coins && (
              <Text variant="body" fontWeight="800" color={canAfford ? '#F59E0B' : 'error.DEFAULT'}>
                🪙{item.price.coins}
              </Text>
            )}
          </View>
        </View>

        {/* Purchase Button */}
        <Pressable
          onPress={handlePurchase}
          disabled={!canAfford}
          style={[
            styles.buyButton,
            {
              backgroundColor: canAfford ? '#10B981' : colors.background.tertiary,
              opacity: canAfford ? 1 : 0.5,
            },
          ]}
          accessibilityLabel="Interactive control"
          accessibilityRole="button"
          accessibilityHint="Activates this control"
        >
          <Text style={styles.buyButtonText}>{canAfford ? 'BUY NOW' : 'NOT ENOUGH'}</Text>
        </Pressable>

        {/* FOMO indicator for rare items */}
        {isRare && !isFlashSale && (
          <View style={styles.fomoIndicator}>
            <Text variant="caption" color="text.tertiary" style={styles.fomoText}>
              Only appeared {item.totalAppearances}x total
            </Text>
          </View>
        )}
      </Pressable>
    </Animated.View>
  );
}

const styles = createSheet({
  container: {
    padding: 16,
    gap: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  flashIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  flashEmoji: {
    fontSize: 22,
  },
  rareBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  rareBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  itemsGrid: {
    gap: 12,
  },
  card: {
    width: '100%',
  },
  cardInner: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  banner: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  bannerText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
    textAlign: 'center',
  },
  content: {
    padding: 16,
    alignItems: 'center',
    gap: 8,
  },
  icon: {
    fontSize: 48,
  },
  name: {
    textAlign: 'center',
  },
  countdownContainer: {
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  countdown: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    alignSelf: 'center',
  },
  countdownText: {
    fontSize: 13,
    fontWeight: '700',
  },
  priceSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  originalPrice: {
    flexDirection: 'row',
    gap: 6,
  },
  strikethrough: {
    textDecorationLine: 'line-through',
  },
  currentPrice: {
    flexDirection: 'row',
    gap: 6,
  },
  buyButton: {
    margin: 16,
    marginTop: 0,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  buyButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  fomoIndicator: {
    alignItems: 'center',
    paddingBottom: 12,
    marginTop: -4,
  },
  fomoText: {
    fontStyle: 'italic',
  },
});

export default LimitedTimeOffer;
