import React from "react";
import { View, Text, Pressable } from "react-native";
import { settingsStyles as styles } from "./settings-screen-styles";

interface SettingsActionsProps {
  settingsState: string;
  onSync: () => void;
  onReset: () => void;
}

export function SettingsActions({
  settingsState,
  onSync,
  onReset,
}: SettingsActionsProps) {
  return (
    <View style={styles.actionsContainer}>
      <Pressable
        style={({ pressed }) => [
          styles.actionButton,
          pressed && { opacity: 0.8 },
        ]}
        onPress={onSync}
        disabled={settingsState === "syncing"}
        accessibilityLabel="Sync settings"
        accessibilityRole="button"
        accessibilityHint="Double tap to activate"
      >
        <Text style={styles.actionButtonText}>
          {settingsState === "syncing" ? "Syncing..." : "Sync Now"}
        </Text>
      </Pressable>
      <Pressable
        style={({ pressed }) => [
          styles.actionButton,
          styles.dangerButton,
          pressed && { opacity: 0.8 },
        ]}
        onPress={onReset}
        disabled={settingsState === "saving"}
        accessibilityLabel="Reset to defaults"
        accessibilityRole="button"
        accessibilityHint="Double tap to activate"
      >
        <Text style={[styles.actionButtonText, styles.dangerButtonText]}>
          Reset to Defaults
        </Text>
      </Pressable>
    </View>
  );
}
