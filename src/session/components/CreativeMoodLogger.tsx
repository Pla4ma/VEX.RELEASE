import React, { useState } from 'react';
import { Pressable } from 'react-native';
import Animated, { SlideInDown, FadeOut } from 'react-native-reanimated';
import { Box } from '../../components/primitives/Box';
import { Text } from '../../components/primitives/Text';
import { useTheme } from '../../theme/ThemeContext';
import { selection } from '../../utils/haptics';

/**
 * CreativeMoodLogger
 *
 * Appears in the final 2 minutes of a CREATIVE mode session.
 * User picks a mood emoji — stored in session payload as +5 score bonus.
 * Designed to be gentle — always has a skip option.
 */

    
const MOODS = [
  { emoji: '🔥', label: 'On fire', bonus: 10 },
  { emoji: '💡', label: 'Inspired', bonus: 8 },
  { emoji: '😌', label: 'Calm', bonus: 5 },
  { emoji: '😤', label: 'Frustrated', bonus: 3 },
  { emoji: '🤔', label: 'Exploring', bonus: 5 },
] as const;

type Mood = (typeof MOODS)[number];

interface CreativeMoodLoggerProps {
  isVisible: boolean;
  onMoodSelected: (mood: Mood) => void;
  onSkip: () => void;
}

export function CreativeMoodLogger({
  isVisible,
  onMoodSelected,
  onSkip,
}: CreativeMoodLoggerProps): JSX.Element | null {
  const { theme } = useTheme();

  
  const [selected, setSelected] = useState<Mood | null>(null);

  if (!isVisible) {
    return null;
  }

  return (
    <Animated.View
      entering={SlideInDown.duration(400).springify()}
      exiting={FadeOut.duration(200)}
      style={{
  position: 'absolute',
  bottom: theme.spacing[24],
  left: theme.spacing[4],
  right: theme.spacing[4],
  backgroundColor: theme.colors.background.elevated,
  borderRadius: theme.borderRadius.xl,
  padding: theme.spacing[4],
  zIndex: 30,
}}
    >
      <Box mb="sm">
        <Text variant="label" weight="semibold">
          How&apos;s the creative energy?
        </Text>
      </Box>

      <Box flexDirection="row" gap="sm" flexWrap="wrap">
        {MOODS.map((mood) => (
          <Pressable
            key={mood.emoji}
            onPress={() => {
              selection();
              setSelected(mood);
              setTimeout(() => onMoodSelected(mood), 400);
            }}
            style={{
              padding: theme.spacing[2],
              borderRadius: theme.borderRadius.lg,
              backgroundColor:
                selected?.emoji === mood.emoji
                  ? theme.colors.primary[500] + '30'
                  : theme.colors.background.tertiary,
              borderWidth: 1,
              borderColor:
                selected?.emoji === mood.emoji
                  ? theme.colors.primary[500]
                  : 'transparent',
              alignItems: 'center',
            }}
            accessibilityLabel={`${mood.label} mood`}
            accessibilityRole="button"
            accessibilityHint={`Select ${mood.label.toLowerCase()} as your creative mood`}
          >
            <Text fontSize={24}>{mood.emoji}</Text>
            <Text variant="caption" color="text.secondary">
              {mood.label}
            </Text>
          </Pressable>
        ))}
      </Box>

      <Pressable
        onPress={onSkip}
        style={{ marginTop: theme.spacing[3], alignSelf: 'flex-end' }}
        accessibilityLabel="Skip mood logging"
        accessibilityRole="button"
        accessibilityHint="Skips the mood selection step"
      >
        <Text variant="caption" color="text.tertiary">
          Skip
        </Text>
      </Pressable>
    </Animated.View>
  );
}

export type { Mood };
export { MOODS };
