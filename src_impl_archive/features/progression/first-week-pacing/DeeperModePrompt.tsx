import React, { useState } from 'react';
import { Pressable, ScrollView } from 'react-native';
import Animated, { FadeIn, FadeInUp, useAnimatedStyle, withSpring } from 'react-native-reanimated';

import { Box } from '../../../components/primitives/Box';
import { Text } from '../../../components/primitives/Text';
import { Button } from '../../../components/primitives/Button';
import { useTheme } from '../../../theme';
import type { MotivationProfileType } from '../../onboarding/schemas';

interface DeeperModePromptProps {
  onSelect: (mode: MotivationProfileType) => void;
  onContinueAsIs?: () => void;
}

interface ModeOption {
  key: MotivationProfileType;
  label: string;
  emoji: string;
  tagline: string;
  description: string;
}

const MODE_OPTIONS: ModeOption[] = [
  {
    key: 'calm', label: 'Calm Companion', emoji: '🌿',
    tagline: 'Gentle focus, low pressure',
    description: 'VEX stays quiet and supportive. Sessions feel light. Progress at your pace.',
  },
  {
    key: 'student', label: 'Study Coach', emoji: '📚',
    tagline: 'Structure and deep learning',
    description: 'Content mastery, study plans, and AI coaching for real comprehension.',
  },
  {
    key: 'game_like', label: 'Focus Game', emoji: '🎮',
    tagline: 'Bosses, XP, and unlocks',
    description: 'Your focus sessions become battles, streaks become achievements. Progress feels like play.',
  },
];

function ModeCard({
  option, isSelected, onPress, index,
}: {
  option: ModeOption; isSelected: boolean; onPress: () => void; index: number;
}): JSX.Element {
  const { theme } = useTheme();

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: withSpring(isSelected ? 0.97 : 1, { damping: 15, stiffness: 150 }) }],
    backgroundColor: isSelected ? theme.colors.primary[500] : theme.colors.background.secondary,
    borderColor: isSelected ? theme.colors.primary[500] : theme.colors.border.light,
  }));

  return (
    <Animated.View entering={FadeInUp.duration(400).delay(200 + index * 150)} style={{ width: '100%' }}>
      <Pressable
        onPress={onPress}
        accessibilityLabel={`${option.label}: ${option.tagline}`}
        accessibilityRole="button"
        accessibilityHint="Selects this focus mode"
      >
        <Animated.View
          style={[{
            padding: theme.spacing[5], borderRadius: 16, borderWidth: 2,
            alignItems: 'center', gap: theme.spacing[2], marginBottom: theme.spacing[3],
          }, animatedStyle]}
        >
          <Text fontSize={36}>{option.emoji}</Text>
          <Text variant="h3" color={isSelected ? 'text.inverse' : 'text.primary'} fontWeight="700">
            {option.label}
          </Text>
          <Text variant="bodySmall" color={isSelected ? 'text.inverse' : 'primary.500'} fontWeight="600">
            {option.tagline}
          </Text>
          <Text variant="body" color={isSelected ? 'text.inverse' : 'text.secondary'} textAlign="center">
            {option.description}
          </Text>
        </Animated.View>
      </Pressable>
    </Animated.View>
  );
}

export function DeeperModePrompt({ onSelect, onContinueAsIs }: DeeperModePromptProps): JSX.Element {
  const { theme } = useTheme();
  const [selected, setSelected] = useState<MotivationProfileType | null>(null);
  const [isAdvancing, setIsAdvancing] = useState(false);

  const handleSelect = (mode: MotivationProfileType) => {
    if (isAdvancing) return;
    setSelected(mode);
    setIsAdvancing(true);
    setTimeout(() => { onSelect(mode); }, 400);
  };

  return (
    <Box flex={1} bg="background.primary">
      <ScrollView contentContainerStyle={{ flexGrow: 1, padding: theme.spacing[6] }}>
        <Animated.View entering={FadeIn.duration(500)}>
          <Box alignItems="center" gap="md" mb="xl">
            <Text fontSize={48}>🎯</Text>
            <Text variant="h1" color="text.primary" textAlign="center" fontWeight="800">
              One week complete
            </Text>
            <Text variant="bodyLarge" color="text.secondary" textAlign="center">
              You completed 7 sessions. Your focus rhythm is real. Now choose what VEX becomes for you.
            </Text>
          </Box>
        </Animated.View>

        <Animated.View entering={FadeIn.duration(400).delay(200)}>
          <Box gap="md" mb="xl">
            <Text variant="h3" color="text.primary" textAlign="center">
              Which path feels right?
            </Text>
            <Text variant="body" color="text.tertiary" textAlign="center">
              You can switch anytime in Settings. This just sets the starting tone.
            </Text>
          </Box>
        </Animated.View>

        {MODE_OPTIONS.map((option, index) => (
          <ModeCard
            key={option.key}
            option={option}
            isSelected={selected === option.key}
            onPress={() => handleSelect(option.key)}
            index={index}
          />
        ))}

        <Animated.View entering={FadeIn.duration(400).delay(800)}>
          {onContinueAsIs && (
            <Pressable
              onPress={onContinueAsIs}
              accessibilityLabel="Continue with current mode"
              accessibilityRole="button"
              accessibilityHint="Keeps your current motivation style"
            >
              <Box alignItems="center" py="lg">
                <Text variant="body" color="text.tertiary">
                  Continue as is ›
                </Text>
              </Box>
            </Pressable>
          )}
        </Animated.View>
      </ScrollView>
    </Box>
  );
}

export default DeeperModePrompt;
