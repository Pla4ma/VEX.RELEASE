/**
 * Reward Ledger Component
 * Displays reward history with claim status
 */

import React from "react";
import { View, Text, Pressable, ScrollView } from "react-native";
import { useRewardHistory, useRewardStats, useClaimReward } from "../hooks";
import { RewardStatusSchema } from "../schemas";
import { createSheet } from "@/shared/ui/create-sheet";

// ============================================================================
// Types
// ============================================================================

interface RewardLedgerProps {
  userId: string;
  limit?: number;
  showClaimButton?: boolean;
}

// ============================================================================
// Component
// ============================================================================

export function RewardLedger({ userId, limit = 20, showClaimButton = true }: RewardLedgerProps) {
  const { data: rewards, isPending, isError } = useRewardHistory(userId, limit);
  const { data: stats } = useRewardStats(userId);
  const claimMutation = useClaimReward();

  if (isPending) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Loading rewards...</Text>
      </View>
    );
  }

  if (isError) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Failed to load rewards</Text>
      </View>
    );
  }

  if (!rewards || rewards.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.emptyText}>No rewards yet</Text>
        <Text style={styles.emptySubtext}>Complete sessions to earn rewards!</Text>
      </View>
    );
  }

  const getStatusColor = (status: string): string => {
    switch (status) {
      case "PENDING":
        return "#fbbf24";
      case "CLAIMED":
        return "#22c55e";
      case "EXPIRED":
        return "#6b7280";
      case "FAILED":
        return "#ef4444";
      default:
        return "#9ca3af";
    }
  };

  const getRewardIcon = (type: string): string => {
    switch (type) {
      case "XP":
        return "⭐";
      case "COINS":
        return "🪙";
      case "GEMS":
        return "💎";
      case "ITEM":
        return "📦";
      case "COSMETIC":
        return "👕";
      case "TITLE":
        return "🏆";
      case "STREAK_SHIELD":
        return "🛡️";
      default:
        return "🎁";
    }
  };

  const handleClaim = (rewardId: string) => {
    claimMutation.mutate({ rewardId, userId });
  };

  return (
    <View style={styles.container}>
      {/* Stats Header */}
      {stats && (
        <View style={styles.statsHeader}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{stats.totalRewards}</Text>
            <Text style={styles.statLabel}>Total</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statValue, styles.pendingValue]}>{stats.pendingRewards}</Text>
            <Text style={styles.statLabel}>Pending</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{stats.totalXp.toLocaleString()}</Text>
            <Text style={styles.statLabel}>XP Earned</Text>
          </View>
        </View>
      )}

      {/* Reward List */}
      <ScrollView style={styles.list} showsVerticalScrollIndicator={false}>
        {rewards.map((reward) => (
          <View key={reward.id} style={styles.rewardItem}>
            <View style={styles.rewardIcon}>
              <Text style={styles.iconText}>{getRewardIcon(reward.type)}</Text>
            </View>

            <View style={styles.rewardInfo}>
              <View style={styles.rewardHeader}>
                <Text style={styles.rewardType}>{reward.type}</Text>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(reward.status) + "30" }]}>
                  <Text style={[styles.statusText, { color: getStatusColor(reward.status) }]}>{reward.status}</Text>
                </View>
              </View>

              <Text style={styles.rewardAmount}>
                {reward.amount?.toLocaleString() || ""} {reward.type}
              </Text>

              <Text style={styles.rewardSource}>From: {reward.triggerType.replace("_", " ").toLowerCase()}</Text>

              {reward.expiresAt && reward.status === "PENDING" && <Text style={styles.expiresText}>Expires: {new Date(reward.expiresAt).toLocaleDateString()}</Text>}
            </View>

            {showClaimButton && reward.status === "PENDING" && (
              <Pressable style={({ pressed }) => [styles.claimButton, claimMutation.isPending && styles.claimButtonDisabled, pressed && { opacity: 0.8 }]} onPress={() => handleClaim(reward.id)} disabled={claimMutation.isPending} accessibilityLabel="Interactive control" accessibilityRole="button" accessibilityHint="Activates this control">
                <Text style={styles.claimButtonText}>{claimMutation.isPending ? "Claiming..." : "Claim"}</Text>
              </Pressable>
            )}
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

// ============================================================================
// Styles
// ============================================================================

const styles = createSheet({
  container: {
    backgroundColor: "#1a1a2e",
    borderRadius: 12,
    padding: 16,
    maxHeight: 500,
  },
  loadingText: {
    color: "#9ca3af",
    fontSize: 14,
  },
  errorText: {
    color: "#ef4444",
    fontSize: 14,
  },
  emptyText: {
    color: "#9ca3af",
    fontSize: 16,
    textAlign: "center",
  },
  emptySubtext: {
    color: "#6b7280",
    fontSize: 12,
    textAlign: "center",
    marginTop: 4,
  },
  statsHeader: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#374151",
    marginBottom: 12,
  },
  statItem: {
    alignItems: "center",
  },
  statValue: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#f3f4f6",
  },
  pendingValue: {
    color: "#fbbf24",
  },
  statLabel: {
    fontSize: 12,
    color: "#9ca3af",
    marginTop: 2,
  },
  list: {
    maxHeight: 400,
  },
  rewardItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#374151",
  },
  rewardIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#252542",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  iconText: {
    fontSize: 20,
  },
  rewardInfo: {
    flex: 1,
  },
  rewardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 2,
  },
  rewardType: {
    fontSize: 14,
    fontWeight: "600",
    color: "#f3f4f6",
    textTransform: "capitalize",
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 10,
    fontWeight: "600",
    textTransform: "uppercase",
  },
  rewardAmount: {
    fontSize: 12,
    color: "#9ca3af",
  },
  rewardSource: {
    fontSize: 11,
    color: "#6b7280",
    marginTop: 2,
  },
  expiresText: {
    fontSize: 10,
    color: "#fbbf24",
    marginTop: 2,
  },
  claimButton: {
    backgroundColor: "#3b82f6",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    marginLeft: 8,
  },
  claimButtonDisabled: {
    opacity: 0.5,
  },
  claimButtonText: {
    color: "#ffffff",
    fontSize: 12,
    fontWeight: "600",
  },
});
