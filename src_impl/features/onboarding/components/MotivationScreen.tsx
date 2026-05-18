import React, { useState } from 'react';
import { Pressable } from 'react-native';
import Animated, { FadeIn, FadeInUp, useAnimatedStyle, withSpring } from 'react-native-reanimated';

import { Box } from '../../../components/primitives/Box';
import { Text } from '../../../components/primitives/Text';
import { useTheme } from '../../../theme';
import type { MotivationProfileType } from '../schemas';

interface MotivationScreenProps {
  onSelect: (style: MotivationProfileType) => void;
  onBack?: () => void;
}

interface MotivationOption {
  key: MotivationProfileType;
  label: string;
  emoji: string;
  description: string;
  tier: 'gentle' | 'intense';
}

const MOTIVATION_OPTIONS: MotivationOption[] = [
  {
    key: 'calm', label: 'Calm', emoji: '🌿',
    description: 'Gentle focus, low pressure. Progress at your own pace.',
    tier: 'gentle',
  },
  {
    key: 'friendly', label: 'Encouraging', emoji: '🤝',
    description: 'Friendly support and positive reinforcement.',
    tier: 'gentle',
  },
  {
    key: 'game_like', label: 'Game-like', emoji: '🎮',
    description: 'Boss fights, XP, and unlocks make focus feel like progress.',
    tier: 'intense',
  },
  {
    key: 'competitive', label: 'Competitive', emoji: '🏆',
    description: 'Challenges, leaderboards, and proving your best.',
    tier: 'intense',
  },
  {
    key: 'intense', label: 'Intense', emoji: '⚔️',
    description: 'High stakes, maximum drive. Every session is a test.',
    tier: 'intense',
  },
  {
    key: 'student', label: 'Study-focused', emoji: '📚',
    description: 'Structure, learning tools, and deep comprehension.',
    tier: 'gentle',
  },
];

function MotivationCard({
  option, isSelected, onPress, index,
}: {
  option: MotivationOption;
  isSelected: boolean;
  onPress: () => void;
  index: number;
}): JSX.Element {
  const { theme } = useTheme();

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: withSpring(isSelected ? 0.96 : 1, { damping: 15, stiffness: 150 }) }],
    backgroundColor: isSelected ? theme.colors.primary[500] : theme.colors.background.secondary,
    borderColor: isSelected ? theme.colors.primary[500] : theme.colors.border.light,
  }));

  return (
    <Animated.View entering={FadeInUp.duration(400).delay(100 + index * 60)} style={{ width: '48%' }}>
      <Pressable
        onPress={onPress}
        accessibilityLabel={`${option.label}: ${option.description}`}
        accessibilityRole="button"
        accessibilityHint={`Selects ${option.label} motivation style`}
      >
        <Animated.View
          style={[{
            padding: theme.spacing[4],
            borderRadius: 14,
            borderWidth: 2,
            alignItems: 'center',
            gap: theme.spacing[1],
            minHeight: 120,
          }, animatedStyle]}
        >
          <Text fontSize={28}>{option.emoji}</Text>
          <Text variant="h4" color={isSelected ? 'text.inverse' : 'text.primary'} fontWeight="600">
            {option.label}
          </Text>
          <Text
            variant="caption"
            color={isSelected ? 'text.inverse' : 'text.secondary'}
            textAlign="center"
            numberOfLines={2}
          >
            {option.description}
          </Text>
        </Animated.View>
      </Pressable>
    </Animated.View>
  );
}

export function MotivationScreen({ onSelect, onBack }: MotivationScreenProps): JSX.Element {
  const { theme } = useTheme();
  const [selectedStyle, setSelectedStyle] = useState<MotivationProfileType | null>(null);
  const [isAdvancing, setIsAdvancing] = useState(false);

  const handleSelect = (style: MotivationProfileType) => {
    if (isAdvancing) return;
    setSelectedStyle(style);
    setIsAdvancing(true);
    setTimeout(() => { onSelect(style); }, 400);
  };

  return (
    <Box flex={1} bg="background.primary" px="lg" py="xl">
      <Box flexDirection="row" alignItems="center" mb="md">
        {onBack && (
          <Pressable onPress={onBack} style={{ marginRight: 12 }}>
            <Box p="xs"><Text variant="h3" color="text.secondary">‹</Text></Box>
          </Pressable>
        )}
      </Box>

      <Animated.View entering={FadeIn.duration(400)}>
        <Box gap="sm" mb="lg">
          <Text variant="label" color="primary.500">Step 2 of 4</Text>
          <Text variant="h2" color="text.primary">
            How should VEX motivate you?
          </Text>
          <Text variant="body" color="text.secondary">
            This controls what VEX sounds like, which features open first, and how rewards feel. You can change this later.
          </Text>
        </Box>
      </Animated.View>

      <Box flexDirection="row" flexWrap="wrap" gap="md" justifyContent="center">
        {MOTIVATION_OPTIONS.map((option, index) => (
          <MotivationCard
            key={option.key}
            option={option}
            isSelected={selectedStyle === option.key}
            onPress={() => handleSelect(option.key)}
            index={index}
          />
        ))}
      </Box>

      <Box flex={1} minHeight={20} />
      <Animated.View entering={FadeIn.duration(400).delay(300)} style={{ marginTop: 'auto' }}>
        <Pressable onPress={() => handleSelect('friendly')}
          accessibilityLabel="Skip and use default motivation style"
          accessibilityRole="button"
          accessibilityHint="Activates this control">
          <Box alignItems="center" py="md">
            <Text variant="bodySmall" color="text.tertiary">Skip for now ›</Text>
          </Box>
        </Pressable>
      </Animated.View>
    </Box>
  );
}

export default MotivationScreen;
