import React from "react";
import { View } from "react-native";
import type { CoachSettings } from "../types";
import { ToggleSetting } from "./ToggleSetting";
import { SettingItem } from "./SettingItem";
import { createSheet } from "@/shared/ui/create-sheet";
import { launchColors } from "@theme/tokens/launch-colors";

interface SettingsCoachSectionProps {
  coach: CoachSettings | undefined;
}

export function SettingsCoachSection({ coach }: SettingsCoachSectionProps) {
  return (
    <View style={styles.settingsGroup}>
      <ToggleSetting
        label="Enable Coach"
        value={coach?.enabled ?? true}
        onToggle={() => {}}
      />
      <SettingItem
        label="Personality"
        value={coach?.personality ?? "supportive"}
        onPress={() => {}}
      />
      <SettingItem
        label="Frequency"
        value={coach?.frequency ?? "moderate"}
        onPress={() => {}}
      />
      <ToggleSetting
        label="Streak Reminders"
        value={coach?.messageTypes?.streakReminders ?? true}
        onToggle={() => {}}
      />
      <ToggleSetting
        label="Session Tips"
        value={coach?.messageTypes?.sessionTips ?? true}
        onToggle={() => {}}
      />
    </View>
  );
}

const styles = createSheet({
  settingsGroup: {
    backgroundColor: launchColors.hex_ffffff,
    marginTop: 8,
    paddingHorizontal: 16,
  },
});
