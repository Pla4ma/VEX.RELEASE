import React from "react";
import { View, Pressable } from "react-native";
import { Text } from "../../components/primitives";
import { useTheme } from "../../theme";
import type { SessionPreset } from "../types";

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
  const { theme } = useTheme();

  return (
    <Pressable
      style={({ pressed }) => ({
        width: "48%",
        backgroundColor: pressed
          ? theme.colors.surface.pressed
          : theme.colors.surface.card,
        borderRadius: theme.borderRadius.lg,
        padding: theme.spacing[4],
        alignItems: "center",
        borderWidth: 1,
        borderColor: theme.colors.border.light,
        opacity: pressed ? theme.opacity[80] : theme.opacity[100],
      })}
      onPress={() => onSelect(preset)}
      onLongPress={() => !preset.isDefault && onDelete(preset.id)}
      accessibilityLabel="Interactive control"
      accessibilityRole="button"
      accessibilityHint="Activates this control"
    >
      <View
        style={{
          width: 48,
          height: 48,
          backgroundColor: theme.colors.primary[100] || theme.colors.surface.button,
          borderRadius: 24,
          justifyContent: "center",
          alignItems: "center",
          marginBottom: 12,
        }}
      >
        <Text style={{ fontSize: 24 }}>
          {getCategoryEmoji(preset.category)}
        </Text>
      </View>
      <Text
        variant="body"
        numberOfLines={1}
        style={{ color: theme.colors.text.primary, marginBottom: 4 }}
      >
        {preset.name}
      </Text>
      <Text
        variant="h2"
        style={{ color: theme.colors.primary[500], marginBottom: 4 }}
      >
        {formatDuration(preset.duration)}
      </Text>
      <Text
        variant="caption"
        style={{ color: theme.colors.text.tertiary }}
      >
        {preset.intervals}{" "}
        {preset.intervals > 1 ? "intervals" : "interval"}
      </Text>
      {preset.strictMode && (
        <View
          style={{
            position: "absolute",
            top: 8,
            right: 8,
            backgroundColor: theme.colors.warning.DEFAULT,
            paddingHorizontal: 6,
            paddingVertical: 2,
            borderRadius: 4,
          }}
        >
          <Text variant="caption" style={{ color: theme.colors.text.inverse }}>
            Strict
          </Text>
        </View>
      )}
    </Pressable>
  );
};
