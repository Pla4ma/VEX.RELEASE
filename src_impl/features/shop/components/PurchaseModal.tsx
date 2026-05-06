/**
 * Purchase Modal Component
 * Modal for confirming shop purchases
 */

import React from "react";
import { View, Text, Modal, Pressable, ActivityIndicator } from "react-native";
import type { ItemDefinition } from "../../items/schemas";
import type { LimitedOffer } from "../../economy/schemas";
import { RARITY_COLORS } from "./shop-constants";
import { createSheet } from "@/shared/ui/create-sheet";

interface PurchaseModalProps {
  visible: boolean;
  item: ItemDefinition | null;
  offer: LimitedOffer | null;
  userCoins: number;
  userGems: number;
  onConfirm: () => void;
  onCancel: () => void;
  isProcessing: boolean;
}

export function PurchaseModal({ visible, item, offer, userCoins, onConfirm, onCancel, isProcessing }: PurchaseModalProps): React.ReactElement | null {
  if (!item) {
    return null;
  }

  const price = offer?.discountedPrice?.amount ?? item.baseValue;
  const canAfford = userCoins >= (price as number);
  const discount = offer?.discountPercent ?? 0;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Confirm Purchase</Text>

          <View style={styles.previewContainer}>
            <View style={[styles.previewIcon, { borderColor: RARITY_COLORS[item.rarity] }]}>
              <Text style={styles.previewIconText}>📦</Text>
            </View>
            <Text style={styles.previewName}>{item.name}</Text>
            <Text style={styles.previewRarity}>{item.rarity}</Text>
            {item.description && <Text style={styles.previewDescription}>{item.description}</Text>}
          </View>

          <View style={styles.priceDisplay}>
            {discount > 0 && (
              <View style={styles.savingsRow}>
                <Text style={styles.originalPriceLarge}>{item.baseValue}</Text>
                <Text style={styles.savingsBadge}>Save {discount}%</Text>
              </View>
            )}
            <View style={styles.finalPriceRow}>
              <Text style={styles.finalPriceLabel}>Total:</Text>
              <View style={styles.finalPriceValue}>
                <Text style={styles.coinIconLarge}>🪙</Text>
                <Text style={[styles.finalPrice, !canAfford && styles.priceUnaffordable]}>{price.toLocaleString()}</Text>
              </View>
            </View>
          </View>

          <View style={styles.balanceInfo}>
            <Text style={styles.balanceLabel}>Your Balance:</Text>
            <Text style={[styles.balanceValue, !canAfford && styles.balanceInsufficient]}>🪙 {userCoins.toLocaleString()}</Text>
          </View>

          {!canAfford && <Text style={styles.errorText}>Insufficient coins. Need {price - userCoins} more.</Text>}

          <View style={styles.modalActions}>
            <Pressable onPress={onCancel} style={({ pressed }) => [styles.cancelButton, pressed && { opacity: 0.8 }]} disabled={isProcessing} accessibilityLabel="Cancel button" accessibilityRole="button" accessibilityHint="Activates this control">
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </Pressable>
            <Pressable onPress={onConfirm} style={({ pressed }) => [styles.confirmButton, (!canAfford || isProcessing) && styles.confirmButtonDisabled, pressed && { opacity: 0.8 }]} disabled={!canAfford || isProcessing} accessibilityLabel="Purchase button" accessibilityRole="button" accessibilityHint="Activates this control">
              {isProcessing ? <ActivityIndicator size="small" color="#fff" /> : <Text style={styles.confirmButtonText}>Purchase</Text>}
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = createSheet({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  modalContent: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 24,
    width: "100%",
    maxWidth: 360,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 16,
  },
  previewContainer: {
    alignItems: "center",
    marginBottom: 16,
  },
  previewIcon: {
    width: 80,
    height: 80,
    borderWidth: 3,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  previewIconText: {
    fontSize: 40,
  },
  previewName: {
    fontSize: 16,
    fontWeight: "600",
  },
  previewRarity: {
    fontSize: 12,
    color: "#6B7280",
    textTransform: "capitalize",
  },
  previewDescription: {
    fontSize: 12,
    color: "#6B7280",
    textAlign: "center",
    marginTop: 4,
  },
  priceDisplay: {
    backgroundColor: "#F3F4F6",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  savingsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginBottom: 8,
  },
  originalPriceLarge: {
    fontSize: 14,
    textDecorationLine: "line-through",
    color: "#9CA3AF",
  },
  savingsBadge: {
    backgroundColor: "#10B981",
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  finalPriceRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  finalPriceLabel: {
    fontSize: 14,
    color: "#6B7280",
  },
  finalPriceValue: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  coinIconLarge: {
    fontSize: 20,
  },
  finalPrice: {
    fontSize: 24,
    fontWeight: "700",
  },
  priceUnaffordable: {
    color: "#EF4444",
  },
  balanceInfo: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  balanceLabel: {
    fontSize: 12,
    color: "#6B7280",
  },
  balanceValue: {
    fontSize: 14,
    fontWeight: "600",
  },
  balanceInsufficient: {
    color: "#EF4444",
  },
  errorText: {
    color: "#EF4444",
    fontSize: 12,
    textAlign: "center",
    marginBottom: 16,
  },
  modalActions: {
    flexDirection: "row",
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
  },
  cancelButtonText: {
    color: "#374151",
    fontWeight: "600",
  },
  confirmButton: {
    flex: 2,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: "#3B82F6",
    alignItems: "center",
  },
  confirmButtonDisabled: {
    backgroundColor: "#9CA3AF",
  },
  confirmButtonText: {
    color: "#FFFFFF",
    fontWeight: "600",
  },
});
