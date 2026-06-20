import React from 'react';
import {
  View,
  Text,
  Pressable,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { lightColors } from '@/theme/tokens/colors';

import { getMoodEmoji, type MoodType } from './SessionSummary.helpers';
import { selection } from '../../../utils/haptics';

interface SessionSummaryMoodSelectorProps {
  mood: MoodType;
  reflection: string;
  onMoodChange: (mood: MoodType) => void;
  onReflectionChange: (text: string) => void;
}

export const SessionSummaryMoodSelector: React.FC<
  SessionSummaryMoodSelectorProps
> = ({ mood, reflection, onMoodChange, onReflectionChange }) => {
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1 }}
    >
      <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ flexGrow: 1 }}>
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
            placeholderTextColor={lightColors.text.muted}
            value={reflection}
            onChangeText={onReflectionChange}
            accessibilityLabel="Session reflection"
            accessibilityHint="Write a short reflection about your session"
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const moods: MoodType[] = ['GREAT', 'GOOD', 'NEUTRAL', 'BAD', 'TERRIBLE'];

const styles = {
  reflectionSection: { marginBottom: 24 },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: lightColors.text.inverse,
    marginBottom: 12,
  },
  moodSelector: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    marginBottom: 12,
  },
  moodButton: {
    padding: 12,
    backgroundColor: lightColors.semantic.backgroundElevated,
    borderRadius: 8,
  },
  moodButtonActive: { backgroundColor: lightColors.semantic.danger },
  moodEmoji: { fontSize: 24 },
  reflectionInput: {
    backgroundColor: lightColors.semantic.backgroundElevated,
    borderRadius: 12,
    padding: 16,
    color: lightColors.text.inverse,
    fontSize: 16,
    minHeight: 100,
    textAlignVertical: 'top' as const,
  },
};