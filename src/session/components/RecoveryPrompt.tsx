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
      icon: "\u25B6\uFE0F",
      penalty: "No penalty — if resumed quickly",
      available: timeLost < 300,
    },
    {
      type: "USER_RESUME",
      label: "Resume Session",
      description: "Pick up with a small adjustment",
      icon: "\uD83D\uDC46",
      penalty: "VEX adjusts quality slightly",
      available: true,
    },
    {
      type: "STREAK_SAVE",
      label: "Protect Your Rhythm",
      description: `Keep your ${streakDays}-day pattern intact`,
      icon: "\uD83D\uDD04",
      penalty: "Uses one rhythm protection",
      available: hasStreakSave,
    },
    {
      type: "PARTIAL_CREDIT",
      label: "Save What You Did",
      description: "Keep credit for completed time",
      icon: "\u2705",
      penalty: "Partial session credit retained",
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
            <Text style={styles.icon}>&#x1F504;</Text>
            <Text style={styles.title}>VEX noticed the pause</Text>
            <Text style={styles.subtitle}>
              {formatTime(timeLost)} of focus time was affected
            </Text>
          </View>

          {}
          <Text style={styles.sectionTitle}>How should VEX handle this?</Text>

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
            <Text style={styles.orText}>&#x2014; or &#x2014;</Text>
            <Pressable
              style={({ pressed }) => [
                styles.abandonButton,
                pressed && { opacity: 0.8 },
              ]}
              onPress={onAbandon}
              accessibilityLabel="End session button"
              accessibilityRole="button"
              accessibilityHint="Ends this session"
            >
              <Text style={styles.abandonText}>End This Session</Text>
              <Text style={styles.abandonPenalty}>
                VEX still learns from what you completed
              </Text>
            </Pressable>
          </View>

          {}
          <Text style={styles.helpText}>
            VEX will remember how this session ended and adjust your next
            recommendation.
          </Text>
        </View>
      </View>
    </Modal>
  );
};
export default RecoveryPrompt;
