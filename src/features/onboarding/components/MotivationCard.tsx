import React from 'react';
import { Pressable } from 'react-native';
import Animated, {
  FadeInUp,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';

import { Text } from '../../../components/primitives/Text';
import { useTheme } from '../../../theme';
import type { MotivationProfileType } from '../schemas';

export interface MotivationOption {
  description: string;
  key: MotivationProfileType;
  label: string;
  shortLabel: string;
}

export const MOTIVATION_OPTIONS: MotivationOption[] = [
  {
    key: 'calm',
    label: 'Calm',
    shortLabel: 'Calm',
    description: 'Gentle focus, low pressure.',
  },
  {
    key: 'study_focused',
    label: 'Study-focused',
    shortLabel: 'Study',
    description: 'Structure and learning tools.',
  },
  {
    key: 'game_like',
    label: 'Game-like',
    shortLabel: 'Game',
    description: 'Progress feels visual and alive.',
  },
  {
    key: 'coach_led',
    label: 'Coach-led',
    shortLabel: 'Coach',
    description: 'Direct guidance and a clear next move.',
  },
  {
    key: 'intense',
    label: 'Intense',
    shortLabel: 'Drive',
    description: 'High drive and fewer soft edges.',
  },
];

export function MotivationCard({
  index,
  isSelected,
  onPress,
  option,
}: {
  index: number;
  isSelected: boolean;
  onPress: () => void;
  option: MotivationOption;
}): JSX.Element {
  const { theme } = useTheme();
  const animatedStyle = useAnimatedStyle(() => ({
    backgroundColor: isSelected
      ? theme.colors.primary[500]
      : theme.colors.background.secondary,
    borderColor: isSelected
      ? theme.colors.primary[500]
      : theme.colors.border.light,
    transform: [
      {
        scale: withSpring(isSelected ? 0.96 : 1, {
          damping: 15,
          stiffness: 150,
        }),
      },
    ],
  }));

  return (
    <Animated.View
      entering={FadeInUp.duration(400).delay(100 + index * 60)}
      style={{ width: '48%' }}
    >
      <Pressable
        onPress={onPress}
        accessibilityLabel={`${option.label}: ${option.description}`}
        accessibilityRole="button"
        accessibilityHint={`Selects ${option.label} motivation style`}
      >
        <Animated.View
          style={[
            {
              alignItems: 'center',
              borderRadius: theme.borderRadius.lg,
              borderWidth: 2,
              gap: theme.spacing[1],
              minHeight: 120,
              padding: theme.spacing[4],
            },
            animatedStyle,
          ]}
        >
          <Text
            variant="label"
            color={isSelected ? 'text.inverse' : 'text.secondary'}
          >
            {option.shortLabel}
          </Text>
          <Text
            variant="h4"
            color={isSelected ? 'text.inverse' : 'text.primary'}
            fontWeight="600"
          >
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
