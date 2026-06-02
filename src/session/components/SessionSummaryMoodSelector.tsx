import React from 'react';
import { View, Text, Pressable, TextInput } from 'react-native';

import { getMoodEmoji, type MoodType } from './SessionSummary.helpers';
import { selection } from '../../utils/haptics';

interface SessionSummaryMoodSelectorProps {
  mood: MoodType;
  reflection: string;
  onMoodChange: (mood: MoodType) => void;
  onReflectionChange: (text: string) => void;
}

export const SessionSummaryMoodSelector: React.FC<
  SessionSummaryMoodSelectorProps
> = ({ mood, reflection, onMoodChange, onReflectionChange }) => {
  const moods: MoodType[] = ['GREAT', 'GOOD', 'NEUTRAL', 'BAD', 'TERRIBLE'];
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
            onPress={() => { selection(); onMoodChange(m); }}
            accessibilityLabel={`Select mood ${getMoodEmoji(m)}`}
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
        placeholderTextColor={'#666'}
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
    fontWeight: '600' as const,
    color: '#fff',
    marginBottom: 12,
  },
  moodSelector: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    marginBottom: 12,
  },
  moodButton: {
    padding: 12,
    backgroundColor: '#2a2a3e',
    borderRadius: 8,
  },
  moodButtonActive: { backgroundColor: '#e94560' },
  moodEmoji: { fontSize: 24 },
  reflectionInput: {
    backgroundColor: '#2a2a3e',
    borderRadius: 12,
    padding: 16,
    color: '#fff',
    fontSize: 16,
    minHeight: 100,
    textAlignVertical: 'top' as const,
  },
};
