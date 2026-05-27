import React from "react";
import { View, Text, Pressable } from "react-native";
import type { SessionHistoryEntry } from "../types";
import { launchColors } from "@theme/tokens/launch-colors";
import { formatDuration, formatDate, getStatusColor } from "./session-history-helpers";

interface SessionHistoryCardProps {
  entry: SessionHistoryEntry;
  onSelect?: (entry: SessionHistoryEntry) => void;
}

export const SessionHistoryCard: React.FC<SessionHistoryCardProps> = ({
  entry,
  onSelect,
}) => {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.historyItem,
        pressed && { opacity: 0.8 },
      ]}
      onPress={() => onSelect?.(entry)}
      accessibilityLabel="Interactive control"
      accessibilityRole="button"
      accessibilityHint="Activates this control"
    >
      <View style={styles.itemLeft}>
        <View
          style={[
            styles.statusDot,
            { backgroundColor: getStatusColor(entry.status) },
          ]}
        />
        <View>
          <Text style={styles.itemDate}>
            {formatDate(entry.endedAt ?? entry.createdAt)}
          </Text>
          <Text style={styles.itemCategory}>
            {entry.config.category || "Focus Session"}
          </Text>
        </View>
      </View>
      <View style={styles.itemRight}>
        {entry.summary && (
          <>
            <Text style={styles.itemScore}>
              {entry.summary.finalScore} pts
            </Text>
            <Text style={styles.itemDuration}>
              {formatDuration(entry.summary.effectiveDuration)}
            </Text>
          </>
        )}
      </View>
    </Pressable>
  );
};

const styles = {
  historyItem: {
    flexDirection: "row" as const,
    justifyContent: "space-between" as const,
    alignItems: "center" as const,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 8,
    backgroundColor: launchColors.hex_2a2a3e,
    borderRadius: 12,
  },
  itemLeft: { flexDirection: "row" as const, alignItems: "center" as const, gap: 12 },
  statusDot: { width: 12, height: 12, borderRadius: 6 },
  itemDate: { fontSize: 14, fontWeight: "600" as const, color: launchColors.hex_fff },
  itemCategory: { fontSize: 12, color: launchColors.hex_9e9e9e, marginTop: 2 },
  itemRight: { alignItems: "flex-end" as const },
  itemScore: {
    fontSize: 16,
    fontWeight: "700" as const,
    color: launchColors.hex_e94560,
  },
  itemDuration: { fontSize: 12, color: launchColors.hex_9e9e9e, marginTop: 2 },
};
