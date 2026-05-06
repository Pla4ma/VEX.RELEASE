/**
 * Item Card Component
 *
 * Displays item information in card format.
 * Works with enriched inventory items that include definition data.
 */

import React from "react";
import { View, Text, Pressable, ViewStyle } from "react-native";

import type { ItemDefinition, ItemRarity } from "../schemas";
import { getRarityColor, getRarityLabel } from "../../../shared/utils/rarity";
import { createSheet } from "@/shared/ui/create-sheet";

// ============================================================================
// Types
// ============================================================================

interface ItemCardProps {
  item: ItemDefinition;
  quantity?: number;
  isEquipped?: boolean;
  onPress?: () => void;
  onLongPress?: () => void;
  showPrice?: boolean;
  price?: number;
  currency?: string;
  disabled?: boolean;
  selected?: boolean;
  style?: ViewStyle;
  compact?: boolean;
}

// ============================================================================
// Component
// ============================================================================

export function ItemCard({ item, quantity, isEquipped, onPress, onLongPress, showPrice, price, currency, disabled, selected, style, compact = false }: ItemCardProps) {
  const rarityColor = getRarityColor(item.rarity);
  const rarityLabel = getRarityLabel(item.rarity);
  const icon = item.iconUrl ?? "📦";

  if (compact) {
    return (
      <Pressable style={({ pressed }) => [styles.compactCard, { borderLeftColor: rarityColor }, selected && styles.compactCardSelected, disabled && styles.compactCardDisabled, { opacity: disabled ? 0.5 : pressed ? 0.7 : 1 }, style]} onPress={onPress} onLongPress={onLongPress} disabled={disabled} accessibilityLabel="Item card button" accessibilityRole="button" accessibilityHint="Activates this control">
        <Text style={styles.compactIcon}>{icon}</Text>
        <View style={styles.compactInfo}>
          <Text style={styles.compactName} numberOfLines={1}>
            {item.name}
          </Text>
          <Text style={[styles.compactRarity, { color: rarityColor }]}>{rarityLabel}</Text>
        </View>
        {quantity !== undefined && quantity > 0 && (
          <View style={styles.compactQuantity}>
            <Text style={styles.compactQuantityText}>×{quantity}</Text>
          </View>
        )}
      </Pressable>
    );
  }

  return (
    <Pressable style={({ pressed }) => [styles.card, { borderTopColor: rarityColor }, selected && styles.cardSelected, disabled && styles.cardDisabled, { opacity: disabled ? 0.5 : pressed ? 0.7 : 1 }, style]} onPress={onPress} onLongPress={onLongPress} disabled={disabled} accessibilityLabel="Interactive control" accessibilityRole="button" accessibilityHint="Activates this control">
      {/* Rarity Strip */}
      <View style={[styles.rarityStrip, { backgroundColor: rarityColor }]} />

      {/* Icon Section */}
      <View style={styles.iconContainer}>
        <Text style={styles.icon}>{icon}</Text>
        {isEquipped && (
          <View style={styles.equippedBadge}>
            <Text style={styles.equippedText}>E</Text>
          </View>
        )}
      </View>

      {/* Info Section */}
      <View style={styles.infoContainer}>
        <Text style={styles.name} numberOfLines={1}>
          {item.name}
        </Text>
        <Text style={[styles.rarity, { color: rarityColor }]}>{rarityLabel}</Text>

        {showPrice && price !== undefined && (
          <View style={styles.priceContainer}>
            <Text style={styles.priceIcon}>{currency === "GEMS" ? "💎" : "🪙"}</Text>
            <Text style={styles.price}>{price.toLocaleString()}</Text>
          </View>
        )}
      </View>

      {/* Quantity Badge */}
      {quantity !== undefined && quantity > 1 && (
        <View style={styles.quantityBadge}>
          <Text style={styles.quantityText}>×{quantity}</Text>
        </View>
      )}
    </Pressable>
  );
}

// ============================================================================
// Mini Item Card (for ingredient lists, etc.)
// ============================================================================

interface MiniItemCardProps {
  name: string;
  icon: string;
  quantity: number;
  owned: number;
  rarity?: ItemRarity;
}

export function MiniItemCard({ name, icon, quantity, owned, rarity = "COMMON" }: MiniItemCardProps) {
  const rarityColor = getRarityColor(rarity);
  const hasEnough = owned >= quantity;

  return (
    <View style={[styles.miniCard, { borderColor: rarityColor }]}>
      <Text style={styles.miniIcon}>{icon}</Text>
      <View style={styles.miniInfo}>
        <Text style={styles.miniName} numberOfLines={1}>
          {name}
        </Text>
        <Text style={[styles.miniCount, hasEnough ? styles.hasEnough : styles.notEnough]}>
          {owned} / {quantity}
        </Text>
      </View>
    </View>
  );
}

// ============================================================================
// Styles
// ============================================================================

const styles = createSheet({
  card: {
    flexDirection: "row",
    backgroundColor: "#1A1A2E",
    borderRadius: 16,
    overflow: "hidden",
    borderTopWidth: 4,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  cardSelected: {
    borderWidth: 2,
    borderColor: "#6366F1",
  },
  cardDisabled: {
    opacity: 0.5,
  },
  rarityStrip: {
    width: 4,
  },
  iconContainer: {
    padding: 16,
    justifyContent: "center",
    position: "relative",
  },
  icon: {
    fontSize: 40,
  },
  equippedBadge: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#4CAF50",
    alignItems: "center",
    justifyContent: "center",
  },
  equippedText: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  infoContainer: {
    flex: 1,
    paddingVertical: 12,
    paddingRight: 16,
    justifyContent: "center",
  },
  name: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
    marginBottom: 4,
  },
  rarity: {
    fontSize: 12,
    fontWeight: "500",
    textTransform: "uppercase",
    marginBottom: 4,
  },
  priceContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  priceIcon: {
    fontSize: 14,
  },
  price: {
    fontSize: 14,
    fontWeight: "600",
    color: "#FFD700",
  },
  quantityBadge: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: "#6366F1",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  quantityText: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#FFFFFF",
  },

  // Compact styles
  compactCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1A1A2E",
    borderRadius: 12,
    padding: 12,
    borderLeftWidth: 4,
  },
  compactCardSelected: {
    backgroundColor: "#2D2D44",
  },
  compactCardDisabled: {
    opacity: 0.5,
  },
  compactIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  compactInfo: {
    flex: 1,
  },
  compactName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  compactRarity: {
    fontSize: 10,
    textTransform: "uppercase",
  },
  compactQuantity: {
    backgroundColor: "#6366F1",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  compactQuantityText: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#FFFFFF",
  },

  // Mini card styles
  miniCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#0F0F1A",
    borderRadius: 8,
    padding: 8,
    borderWidth: 1,
  },
  miniIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  miniInfo: {
    flex: 1,
  },
  miniName: {
    fontSize: 12,
    color: "#FFFFFF",
    marginBottom: 2,
  },
  miniCount: {
    fontSize: 10,
  },
  hasEnough: {
    color: "#4CAF50",
  },
  notEnough: {
    color: "#FF5252",
  },
});
