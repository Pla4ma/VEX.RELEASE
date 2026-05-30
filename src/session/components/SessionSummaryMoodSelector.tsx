import React from "react";
import { View, Text, Pressable, TextInput } from "react-native";
import { launchColors } from "@theme/tokens/launch-colors";
import { getMoodEmoji, type MoodType } from "./SessionSummary.helpers";

interface SessionSummaryMoodSelectorProps {
  mood: MoodType;
  reflection: string;
  onMoodChange: (mood: MoodType) => void;
  onReflectionChange: (text: string) => void;
}

export const SessionSummaryMoodSelector: React.FC<
  SessionSummaryMoodSelectorProps
> = ({ mood, reflection, onMoodChange, onReflectionChange }) => {
  const moods: MoodType[] = ["GREAT", "GOOD", "NEUTRAL", "BAD", "TERRIBLE"];
  return (
    <View style={styles.reflectionSection}>
      <Text style={styles.sectionTitle}>How was your session?</Text>
      <View style={styles.moodSelector}>
        {moods.map((m) => (
          <Pressable
            key={m}
            style={({ pressed }) => [
              styles.moodButton,
              mood === m && styles.moodButtonActive,
              pressed && { opacity: 0.8 },
            ]}
            onPress={() => onMoodChange(m)}
            accessibilityLabel={`Mood ${getMoodEmoji(m)} button`}
            accessibilityRole="button"
            accessibilityHint="Double tap to activate"
          >
            <Text style={styles.moodEmoji}>{getMoodEmoji(m)}</Text>
          </Pressable>
        ))}
      </View>
      <TextInput
        style={styles.reflectionInput}
        multiline
        numberOfLines={3}
        placeholder="What did you accomplish? Any distractions?"
        placeholderTextColor={launchColors.hex_666}
        value={reflection}
        onChangeText={onReflectionChange}
      />
    </View>
  );
};

const styles = {
  reflectionSection: { marginBottom: 24 },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600" as const,
    color: launchColors.hex_fff,
    marginBottom: 12,
  },
  moodSelector: {
    flexDirection: "row" as const,
    justifyContent: "space-between" as const,
    marginBottom: 12,
  },
  moodButton: {
    padding: 12,
    backgroundColor: launchColors.hex_2a2a3e,
    borderRadius: 8,
  },
  moodButtonActive: { backgroundColor: launchColors.hex_e94560 },
  moodEmoji: { fontSize: 24 },
  reflectionInput: {
    backgroundColor: launchColors.hex_2a2a3e,
    borderRadius: 12,
    padding: 16,
    color: launchColors.hex_fff,
    fontSize: 16,
    minHeight: 100,
    textAlignVertical: "top" as const,
  },
};
