/**
 * DurationCard Component
 *
 * Duration option card for first session setup screen.
 * Reusable component for displaying session duration options.
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

import { Box } from '../../../components/primitives/Box';
import { Text } from '../../../components/primitives/Text';
import { useTheme } from '../../../theme';
import type { DurationOption } from '../schemas';

interface DurationCardProps {
  option: DurationOption;
  isSelected: boolean;
  onPress: () => void;
  index: number;
  isRecommended?: boolean;
}

/**
 * Duration option card
 */
export function DurationCard({
  option,
  isSelected,
  onPress,
  index,
  isRecommended,
}: DurationCardProps): JSX.Element {
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
      : isRecommended
      ? theme.colors.success[500]
      : theme.colors.border.light,
    borderWidth: isRecommended ? 3 : 2,
  }));

  return (
    <Animated.View
      entering={FadeInUp.duration(400).delay(200 + index * 100)}
      style={{ flex: 1, minWidth: '45%' }}
    >
      <Pressable onPress={onPress}
        accessibilityLabel="Interactive control"
        accessibilityRole="button"
        accessibilityHint="Activates this control">
        <Animated.View
          style={[
            {
              padding: theme.spacing[5],
              borderRadius: 16,
              alignItems: 'center',
              justifyContent: 'center',
              gap: theme.spacing[3],
              minHeight: 100,
              position: 'relative',
            },
            animatedStyle,
          ]}
        >
          {/* Recommended badge */}
          {isRecommended && (
            <Box
              position="absolute"
              top={-8}
              right={-8}
              px="sm"
              py="xs"
              borderRadius="full"
              bg="success.DEFAULT"
            >
              <Text variant="caption" color="text.inverse" fontWeight="600">
                Starter
              </Text>
            </Box>
          )}

          <Text fontSize={28}>{option.emoji}</Text>
          <Text
            variant="h3"
            color={isSelected ? 'text.inverse' : 'text.primary'}
            fontWeight="700"
          >
            {option.label}
          </Text>
        </Animated.View>
      </Pressable>
    </Animated.View>
  );
}

export default DurationCard;
