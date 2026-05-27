import React from "react";
import { View, Text, Pressable, Modal } from "react-native";
import type { RecoveryType } from "../types";
import { styles } from "./RecoveryPrompt.styles";

interface RecoveryOption {
  type: RecoveryType;
  label: string;
  description: string;
  icon: string;
  penalty: string;
  available: boolean;
}
interface RecoveryPromptProps {
  isVisible: boolean;
  sessionId: string;
  timeLost: number;
  onSelect: (type: RecoveryType) => void;
  onAbandon: () => void;
  hasStreakSave: boolean;
  streakDays: number;
}
export const RecoveryPrompt: React.FC<RecoveryPromptProps> = ({
  isVisible,
  sessionId: _sessionId,
  timeLost,
  onSelect,
  onAbandon,
  hasStreakSave,
  streakDays,
}) => {
  const recoveryOptions: RecoveryOption[] = [
    {
      type: "AUTO_RESUME",
      label: "Auto Resume",
      description: "Continue from where you left",
      icon: "▶️",
      penalty: "None - if resumed quickly",
      available: timeLost < 300,
    },
    {
      type: "USER_RESUME",
      label: "Manual Resume",
      description: "Resume with minor penalty",
      icon: "👆",
      penalty: "-10% score penalty",
      available: true,
    },
    {
      type: "STREAK_SAVE",
      label: "Use Streak Save",
      description: `Protect your ${streakDays}-day streak`,
      icon: "🔥",
      penalty: "Consumes 1 streak save",
      available: hasStreakSave,
    },
    {
      type: "PARTIAL_CREDIT",
      label: "Take Partial Credit",
      description: "Get credit for completed time",
      icon: "💰",
      penalty: "50% XP & coins only",
      available: timeLost > 0,
    },
  ];
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    return `${mins} minutes`;
  };
  return (
    <Modal
      visible={isVisible}
      transparent
      animationType="slide"
      onRequestClose={() => {}}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          {}
          <View style={styles.header}>
            <Text style={styles.icon}>🔄</Text>
            <Text style={styles.title}>Session Interrupted</Text>
            <Text style={styles.subtitle}>
              {formatTime(timeLost)} of focus time was lost
            </Text>
          </View>

          {}
          <Text style={styles.sectionTitle}>Choose Recovery Option:</Text>

          <View style={styles.options}>
            {recoveryOptions
              .filter((opt) => opt.available)
              .map((option) => (
                <Pressable
                  key={option.type}
                  style={({ pressed }) => [
                    styles.optionCard,
                    pressed && { opacity: 0.8 },
                  ]}
                  onPress={() => onSelect(option.type)}
                  accessibilityLabel="Interactive control"
                  accessibilityRole="button"
                  accessibilityHint="Activates this control"
                >
                  <View style={styles.optionHeader}>
                    <Text style={styles.optionIcon}>{option.icon}</Text>
                    <View style={styles.optionInfo}>
                      <Text style={styles.optionLabel}>{option.label}</Text>
                      <Text style={styles.optionDescription}>
                        {option.description}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.penaltyBadge}>
                    <Text style={styles.penaltyText}>{option.penalty}</Text>
                  </View>
                </Pressable>
              ))}
          </View>

          {}
          <View style={styles.abandonSection}>
            <Text style={styles.orText}>— or —</Text>
            <Pressable
              style={({ pressed }) => [
                styles.abandonButton,
                pressed && { opacity: 0.8 },
              ]}
              onPress={onAbandon}
              accessibilityLabel="Abandon Session button"
              accessibilityRole="button"
              accessibilityHint="Activates this control"
            >
              <Text style={styles.abandonText}>Abandon Session</Text>
              <Text style={styles.abandonPenalty}>
                Lose all progress & streak risk
              </Text>
            </Pressable>
          </View>

          {}
          <Text style={styles.helpText}>
            Select the best option based on how much time you lost and your
            current streak status.
          </Text>
        </View>
      </View>
    </Modal>
  );
};
export default RecoveryPrompt;
