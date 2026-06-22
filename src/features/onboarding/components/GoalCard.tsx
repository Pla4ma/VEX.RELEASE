/**
 * GoalCard Component
 *
 * Goal option card for name and goal selection screen.
 * Reusable component for displaying goal options with animations.
 *
 * @phase 4
 */

import React from 'react';
import { Pressable } from 'react-native';
import Animated, {
  FadeInUp,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';


import { Text } from '../../../components/primitives/Text';
import { useTheme } from '../../../theme/ThemeContext';
import type { GoalOption } from '../schemas';

interface GoalCardProps {
  option: GoalOption;
  isSelected: boolean;
  onPress: () => void;
  index: number;
}

/**
 * Goal option card
 */
export function GoalCard({
  option,
  isSelected,
  onPress,
  index,
}: GoalCardProps): React.ReactNode {
  const { theme } = useTheme();

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      {
        scale: withSpring(isSelected ? 0.95 : 1, {
          damping: 15,
          stiffness: 150,
        }),
      },
    ],
    backgroundColor: isSelected
      ? theme.colors.primary[500]
      : theme.colors.background.secondary,
    borderColor: isSelected
      ? theme.colors.primary[500]
      : theme.colors.border.light,
  }));

  return (
    <Animated.View
      entering={FadeInUp.duration(400).delay(200 + index * 100)}
      style={{ flex: 1, minWidth: '45%' }}
    >
      <Pressable
        onPress={onPress}
        accessibilityLabel="Goal option"
        accessibilityRole="button"
        accessibilityHint="Double tap to select"
      >
        <Animated.View
          style={[
            {
              padding: theme.spacing[4],
              borderRadius: 16,
              borderWidth: 2,
              alignItems: 'center',
              gap: theme.spacing[2],
            },
            animatedStyle,
          ]}
        >
          <Text fontSize={32}>{option.emoji}</Text>
          <Text
            variant="body"
            color={isSelected ? 'text.inverse' : 'text.primary'}
            fontWeight="600"
            textAlign="center"
          >
            {option.label}
          </Text>
        </Animated.View>
      </Pressable>
    </Animated.View>
  );
}
