/**
 * Toggle Setting Component
 * Setting row with a toggle switch
 */

import React from "react";
import { View, Text, Pressable } from "react-native";
import { createSheet } from "@/shared/ui/create-sheet";
import { launchColors } from "@theme/tokens/launch-colors";
import { toggleSwitch } from "../../../utils/haptics";

interface ToggleSettingProps {
  label: string;
  value: boolean;
  onToggle: (value: boolean) => void;
  description?: string;
}

export function ToggleSetting({
  label,
  value,
  onToggle,
  description,
}: ToggleSettingProps): React.ReactElement {
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.label}>{label}</Text>
        {description && <Text style={styles.description}>{description}</Text>}
      </View>
      <Pressable
        onPress={() => { toggleSwitch(); onToggle(!value); }}
        style={({ pressed }) => [
          styles.toggle,
          value ? styles.toggleActive : styles.toggleInactive,
          pressed && { opacity: 0.8 },
        ]}
        accessibilityLabel={`${label}, ${value ? "on" : "off"}`}
        accessibilityRole="button"
        accessibilityHint={`Double tap to turn ${value ? "off" : "on"}`}
      >
        <View
          style={[
            styles.toggleKnob,
            value ? styles.knobActive : styles.knobInactive,
          ]}
        />
      </Pressable>
    </View>
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
    marginRight: 16,
  },
  label: {
    fontSize: 16,
    color: launchColors.hex_111827,
  },
  description: {
    fontSize: 12,
    color: launchColors.hex_6b7280,
    marginTop: 4,
  },
  toggle: {
    width: 50,
    height: 28,
    borderRadius: 14,
    padding: 2,
  },
  toggleActive: {
    backgroundColor: launchColors.hex_6366f1,
  },
  toggleInactive: {
    backgroundColor: launchColors.hex_d1d5db,
  },
  toggleKnob: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: launchColors.hex_ffffff,
  },
  knobActive: {
    marginLeft: "auto",
  },
  knobInactive: {
    marginLeft: 0,
  },
});
