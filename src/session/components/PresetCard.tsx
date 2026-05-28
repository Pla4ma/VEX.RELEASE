import React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import type { SessionPreset } from "../types";
import { launchColors } from "@theme/tokens/launch-colors";

interface PresetCardProps {
  preset: SessionPreset;
  onSelect: (preset: SessionPreset) => void;
  onDelete: (id: string) => void;
}

const formatDuration = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  return `${mins} min`;
};

const getCategoryEmoji = (category?: string): string => {
  switch (category) {
    case "Study":
      return "📚";
    case "Work":
      return "💼";
    case "Creative":
      return "🎨";
    case "Health":
      return "💪";
    default:
      return "🎯";
  }
};

export const PresetCard: React.FC<PresetCardProps> = ({
  preset,
  onSelect,
  onDelete,
}) => {
  return (
    <Pressable
      style={({ pressed }) =>
        pressed ? [styles.presetCard, { opacity: 0.8 }] : styles.presetCard
      }
      onPress={() => onSelect(preset)}
      onLongPress={() => !preset.isDefault && onDelete(preset.id)}
      accessibilityLabel="Interactive control"
      accessibilityRole="button"
      accessibilityHint="Activates this control"
    >
      <View style={styles.presetIcon}>
        <Text style={styles.iconText}>{getCategoryEmoji(preset.category)}</Text>
      </View>
      <Text style={styles.presetName} numberOfLines={1}>
        {preset.name}
      </Text>
      <Text style={styles.presetDuration}>
        {formatDuration(preset.duration)}
      </Text>
      <Text style={styles.presetDetails}>
        {preset.intervals} {preset.intervals > 1 ? "intervals" : "interval"}
      </Text>
      {preset.strictMode && (
        <View style={styles.strictBadge}>
          <Text style={styles.strictText}>Strict</Text>
        </View>
      )}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  presetCard: {
    width: "48%",
    backgroundColor: launchColors.hex_2a2a3e,
    borderRadius: 12,
    padding: 16,
    alignItems: "center" as const,
    borderWidth: 1,
    borderColor: launchColors.hex_3a3a4e,
  },
  presetIcon: {
    width: 48,
    height: 48,
    backgroundColor: launchColors.hex_e9456020,
    borderRadius: 24,
    justifyContent: "center" as const,
    alignItems: "center" as const,
    marginBottom: 12,
  },
  iconText: { fontSize: 24 },
  presetName: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: launchColors.hex_fff,
    marginBottom: 4,
  },
  presetDuration: {
    fontSize: 20,
    fontWeight: "700" as const,
    color: launchColors.hex_e94560,
    marginBottom: 4,
  },
  presetDetails: { fontSize: 12, color: launchColors.hex_9e9e9e },
  strictBadge: {
    position: "absolute" as const,
    top: 8,
    right: 8,
    backgroundColor: launchColors.hex_ffa500,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  strictText: {
    fontSize: 10,
    color: launchColors.hex_fff,
    fontWeight: "600" as const,
  },
});
