import React from "react";
import { View, Text } from "react-native";
import { launchColors } from "@theme/tokens/launch-colors";
import { formatDuration } from "./SessionSummary.helpers";
import type { SessionSummary as SessionSummaryType } from "../types";

interface SessionSummaryStatsProps {
  summary: SessionSummaryType;
}

export const SessionSummaryStats: React.FC<SessionSummaryStatsProps> = ({ summary }) => {
  return (
    <View style={styles.statsGrid}>
      <View style={styles.statCard}>
        <Text style={styles.statValue}>
          {formatDuration(summary.effectiveDuration)}
        </Text>
        <Text style={styles.statLabel}>Focused Time</Text>
      </View>
      <View style={styles.statCard}>
        <Text style={styles.statValue}>{summary.interruptions}</Text>
        <Text style={styles.statLabel}>Interruptions</Text>
      </View>
      <View style={styles.statCard}>
        <Text style={styles.statValue}>
          {Math.round(summary.focusQuality)}%
        </Text>
        <Text style={styles.statLabel}>Focus Quality</Text>
      </View>
      <View style={styles.statCard}>
        <Text style={styles.statValue}>
          {Math.round(summary.completionPercentage)}%
        </Text>
        <Text style={styles.statLabel}>Completed</Text>
      </View>
    </View>
  );
};

const styles = {
  statsGrid: {
    flexDirection: "row" as const,
    flexWrap: "wrap" as const,
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    width: "48%" as const,
    backgroundColor: launchColors.hex_2a2a3e,
    borderRadius: 12,
    padding: 16,
    alignItems: "center" as const,
  },
  statValue: {
    fontSize: 20,
    fontWeight: "700" as const,
    color: launchColors.hex_e94560,
    marginBottom: 4,
  },
  statLabel: { fontSize: 12, color: launchColors.hex_9e9e9e },
};
