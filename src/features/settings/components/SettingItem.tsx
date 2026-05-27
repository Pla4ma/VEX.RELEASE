/**
 * Setting Item Component
 * Single setting row with label, value, and optional toggle
 */

import React from "react";
import { View, Text, Pressable } from "react-native";
import { createSheet } from "@/shared/ui/create-sheet";
import { launchColors } from "@theme/tokens/launch-colors";

interface SettingItemProps {
  label: string;
  value?: unknown;
  onPress?: () => void;
  children?: React.ReactNode;
}

export function SettingItem({
  label,
  value,
  onPress,
  children,
}: SettingItemProps): React.ReactElement {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.container, pressed && { opacity: 0.8 }]}
      accessibilityLabel="Setting item button"
      accessibilityRole="button"
      accessibilityHint="Activates this control"
    >
      <View style={styles.content}>
        <Text style={styles.label}>{label}</Text>
        {value !== undefined && (
          <Text style={styles.value}>{String(value)}</Text>
        )}
        {children}
      </View>
      <Text style={styles.arrow}>→</Text>
    </Pressable>
  );
}

const styles = createSheet({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: launchColors.hex_ffffff,
    borderBottomWidth: 1,
    borderBottomColor: launchColors.hex_e5e7eb,
  },
  content: {
    flex: 1,
  },
  label: {
    fontSize: 16,
    color: launchColors.hex_111827,
  },
  value: {
    fontSize: 14,
    color: launchColors.hex_6b7280,
    marginTop: 4,
  },
  arrow: {
    fontSize: 18,
    color: launchColors.hex_9ca3af,
    marginLeft: 8,
  },
});
