/**
 * RotatingShopSection Component
 *
 * Dedicated section for rotating shop items.
 * Displays items that change on a schedule with countdown timers.
 *
 * @phase 6C.1
 */

import React, { useEffect, useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import Animated, { useAnimatedStyle, useSharedValue, withRepeat, withSequence, withTiming, FadeIn, FadeInRight } from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";

import { Text } from "../../../components/primitives/Text";
import { useTheme } from "../../../theme";
import { capture } from "../../../shared/analytics";
import { EconomyEvents } from "../../../shared/analytics/analytics-events";
import { triggerHaptic } from "../../../utils/haptics";
import { createSheet } from "@/shared/ui/create-sheet";

const ROTATION_GRADIENT = ["#3B82F6", "#8B5CF6"] as const;

export interface RotatingShopItem {
  id: string;
  name: string;
  description: string;
  icon: string;
  rarity: "common" | "rare" | "epic" | "legendary";
  price: {
    gems?: number;
    coins?: number;
  };
  /** Hours remaining in rotation */
  hoursRemaining: number;
  /** Total rotation window in hours */
  rotationDuration: number;
  /** How many times this item appears per month */
  monthlyAppearances: number;
  /** Discount percentage if any */
  discount?: number;
}

interface RotatingShopSectionProps {
  /** Currently available rotating items */
  items: RotatingShopItem[];
  /** User's gem balance */
  gemBalance: number;
  /** User's coin balance */
  coinBalance: number;
  /** When the next rotation occurs */
  nextRotationAt: Date;
  /** Callback when item is purchased */
  onPurchase: (item: RotatingShopItem) => void;
  /** Callback when item details are viewed */
  onViewDetails?: (item: RotatingShopItem) => void;
}

export function RotatingShopSection({ items, gemBalance, coinBalance, nextRotationAt, onPurchase, onViewDetails }: RotatingShopSectionProps): JSX.Element | null {
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

  // Calculate time until next rotation
  const rotationCountdown = useMemo(() => {
    const diff = nextRotationAt.getTime() - currentTime.getTime();
    if (diff <= 0) {
      return "Rotating now...";
    }

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    if (hours > 24) {
      const days = Math.floor(hours / 24);
      return `${days}d ${hours % 24}h`;
    }
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m ${seconds}s`;
  }, [nextRotationAt, currentTime]);

  // Determine if low time (show urgency)
  const isLowTime = useMemo(() => {
    const diff = nextRotationAt.getTime() - currentTime.getTime();
    return diff < 1000 * 60 * 60 * 6; // Less than 6 hours
  }, [nextRotationAt, currentTime]);

  if (items.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      {/* Section Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.iconContainer}>
            <Text style={styles.icon}>🔄</Text>
          </View>
          <View>
            <Text variant="h4" fontSize={18} color="text.primary">
              Rotating Shop
            </Text>
            <Text variant="bodySmall" color="text.secondary">
              {items.length} exclusive items available
            </Text>
          </View>
        </View>

        {/* Rotation Countdown */}
        <View style={[styles.countdownBadge, isLowTime && styles.urgentCountdown]}>
          <Text style={[styles.countdownText, isLowTime && styles.urgentText]}>🕐 {rotationCountdown}</Text>
        </View>
      </View>

      {/* Low Time Warning */}
      {isLowTime && (
        <View style={styles.urgencyBanner}>
          <Text style={styles.urgencyText}>⚠️ These items rotate out soon! Grab them before they're gone.</Text>
        </View>
      )}

      {/* Items Horizontal Scroll */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.itemsContainer}>
        {items.map((item, index) => (
          <RotatingItemCard key={item.id} item={item} index={index} gemBalance={gemBalance} coinBalance={coinBalance} onPurchase={onPurchase} onViewDetails={onViewDetails} />
        ))}
      </ScrollView>

      {/* Monthly Rotation Schedule Note */}
      <View style={styles.scheduleNote}>
        <Text variant="caption" color="text.tertiary" style={styles.scheduleText}>
          Items rotate every {items[0]?.rotationDuration || 24}h. Rare items appear {items[0]?.monthlyAppearances || 2}x per month.
        </Text>
      </View>
    </View>
  );
}

// Individual rotating item card
interface RotatingItemCardProps {
  item: RotatingShopItem;
  index: number;
  gemBalance: number;
  coinBalance: number;
  onPurchase: (item: RotatingShopItem) => void;
  onViewDetails?: (item: RotatingShopItem) => void;
}

function RotatingItemCard({ item, index, gemBalance, coinBalance, onPurchase, onViewDetails }: RotatingItemCardProps) {
  const { theme } = useTheme();
  const { colors } = theme;
  const [isPressed, setIsPressed] = useState(false);

  const pulseScale = useSharedValue(1);

  // Pulse for low time items
  useEffect(() => {
    if (item.hoursRemaining < 6) {
      pulseScale.value = withRepeat(withSequence(withTiming(1.02, { duration: 800 }), withTiming(1, { duration: 800 })), -1, true);
    }
  }, [item.hoursRemaining, pulseScale]);

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }],
  }));

  // Check affordability
  const canAfford = useMemo(() => {
    if (item.price.gems) {
      return gemBalance >= item.price.gems;
    }
    if (item.price.coins) {
      return coinBalance >= item.price.coins;
    }
    return false;
  }, [item.price, gemBalance, coinBalance]);

  // Rarity colors
  const rarityColors = {
    common: colors.border.DEFAULT,
    rare: "#3B82F6",
    epic: "#8B5CF6",
    legendary: "#FFD700",
  };

  const handlePress = () => {
    triggerHaptic("impactLight");
    capture(EconomyEvents.SHOP_VIEWED, {
      source: "rotating_shop",
    });
    onViewDetails?.(item);
  };

  const handlePurchase = () => {
    if (!canAfford) {
      return;
    }
    triggerHaptic("success");
    onPurchase(item);
  };

  const isLowTime = item.hoursRemaining < 6;
  const isRare = item.monthlyAppearances <= 2;

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
            borderColor: rarityColors[item.rarity],
            borderWidth: isRare ? 3 : 2,
            transform: [{ scale: isPressed ? 0.98 : 1 }],
          },
        ]}
        accessibilityLabel="Interactive control"
        accessibilityRole="button"
        accessibilityHint="Activates this control"
      >
        {/* Top gradient bar for rotating items */}
        <LinearGradient colors={ROTATION_GRADIENT} style={styles.topBar} />

        {/* Rarity Badge */}
        <View style={[styles.rarityBadge, { backgroundColor: rarityColors[item.rarity] }]}>
          <Text style={styles.rarityText}>{isRare ? "🔥 RARE" : item.rarity.toUpperCase()}</Text>
        </View>

        {/* Item Content */}
        <View style={styles.content}>
          <Text style={styles.itemIcon}>{item.icon}</Text>
          <Text variant="body" fontWeight="700" color="text.primary" style={styles.itemName}>
            {item.name}
          </Text>
          <Text variant="caption" color="text.secondary" numberOfLines={2} style={styles.itemDesc}>
            {item.description}
          </Text>
        </View>

        {/* Time Remaining */}
        <View style={styles.timeContainer}>
          <Text style={[styles.timeText, isLowTime && styles.urgentTime]}>
            {isLowTime ? "⏰ " : "🕐 "}
            {item.hoursRemaining < 1 ? `${Math.floor(item.hoursRemaining * 60)}m left` : `${Math.floor(item.hoursRemaining)}h left`}
          </Text>
        </View>

        {/* Monthly Appearances Note */}
        {isRare && (
          <View style={styles.rareNote}>
            <Text variant="caption" color="text.tertiary">
              Only {item.monthlyAppearances}x/month
            </Text>
          </View>
        )}

        {/* Price */}
        <View style={styles.priceContainer}>
          {item.discount && (
            <View style={styles.discountBadge}>
              <Text style={styles.discountText}>-{item.discount}%</Text>
            </View>
          )}
          <View style={styles.priceRow}>
            {item.price.gems && (
              <Text variant="body" fontWeight="800" color={canAfford ? "#8B5CF6" : "error.DEFAULT"}>
                💎{item.price.gems}
              </Text>
            )}
            {item.price.coins && (
              <Text variant="body" fontWeight="800" color={canAfford ? "#F59E0B" : "error.DEFAULT"}>
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
            styles.purchaseButton,
            {
              backgroundColor: canAfford ? "#10B981" : colors.background.tertiary,
              opacity: canAfford ? 1 : 0.5,
            },
          ]}
          accessibilityLabel="Interactive control"
          accessibilityRole="button"
          accessibilityHint="Activates this control"
        >
          <Text style={styles.purchaseText}>{canAfford ? "BUY NOW" : "NOT ENOUGH"}</Text>
        </Pressable>
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
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: "rgba(59, 130, 246, 0.1)",
    alignItems: "center",
    justifyContent: "center",
  },
  icon: {
    fontSize: 22,
  },
  countdownBadge: {
    backgroundColor: "rgba(59, 130, 246, 0.15)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  urgentCountdown: {
    backgroundColor: "rgba(239, 68, 68, 0.15)",
  },
  countdownText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#3B82F6",
  },
  urgentText: {
    color: "#EF4444",
  },
  urgencyBanner: {
    backgroundColor: "rgba(239, 68, 68, 0.1)",
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: "rgba(239, 68, 68, 0.3)",
  },
  urgencyText: {
    fontSize: 13,
    color: "#EF4444",
    fontWeight: "600",
    textAlign: "center",
  },
  itemsContainer: {
    paddingRight: 16,
    gap: 12,
  },
  scheduleNote: {
    alignItems: "center",
    paddingTop: 8,
  },
  scheduleText: {
    textAlign: "center",
  },
  card: {
    width: 200,
  },
  cardInner: {
    borderRadius: 20,
    overflow: "hidden",
    paddingBottom: 16,
  },
  topBar: {
    height: 4,
  },
  rarityBadge: {
    alignSelf: "center",
    marginTop: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  rarityText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  content: {
    padding: 16,
    alignItems: "center",
    gap: 8,
  },
  itemIcon: {
    fontSize: 48,
  },
  itemName: {
    textAlign: "center",
  },
  itemDesc: {
    textAlign: "center",
    height: 32,
  },
  timeContainer: {
    alignItems: "center",
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  timeText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#6B7280",
  },
  urgentTime: {
    color: "#EF4444",
    fontWeight: "700",
  },
  rareNote: {
    alignItems: "center",
    paddingBottom: 8,
  },
  priceContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  discountBadge: {
    backgroundColor: "#EF4444",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  discountText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "700",
  },
  priceRow: {
    flexDirection: "row",
    gap: 6,
  },
  purchaseButton: {
    marginHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
  },
  purchaseText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
});

export default RotatingShopSection;
