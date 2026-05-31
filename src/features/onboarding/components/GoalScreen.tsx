/**
 * GoalScreen Component
 *
 * "What do you mainly want to focus on?"
 * 4 large tap-to-select options. Auto-advances after 300ms delay.
 * No text input — taps only.
 *
 * @phase 2.3
 */

import React, { useState } from 'react';
import Animated, {
  FadeIn,
  FadeInUp,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';

import { Pressable } from 'react-native';

import { Box } from '../../../components/primitives/Box';
import { Text } from '../../../components/primitives/Text';
import { useTheme } from '../../../theme';
import type { FocusGoal, GoalOption } from '../schemas';
import { GOAL_OPTIONS } from '../service';

interface GoalScreenProps {
  onSelect: (goal: FocusGoal) => void;
  onSkip: () => void;
}

/**
 * Goal option card
 */
function GoalCard({
  option,
  isSelected,
  onPress,
  index,
}: {
  option: GoalOption;
  isSelected: boolean;
  onPress: () => void;
  index: number;
}): JSX.Element {
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
        accessibilityLabel="Goal selection"
        accessibilityRole="button"
        accessibilityHint="Double tap to select"
      >
        <Animated.View
          style={[
            {
              padding: theme.spacing[5],
              borderRadius: 16,
              borderWidth: 2,
              alignItems: 'center',
              gap: theme.spacing[2],
            },
            animatedStyle,
          ]}
        >
          <Text fontSize={40}>{option.emoji}</Text>
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
          >
            {option.description}
          </Text>
        </Animated.View>
      </Pressable>
    </Animated.View>
  );
}

/**
 * Goal selection screen
 */
export function GoalScreen({
  onSelect,
  onSkip,
  onBack,
}: GoalScreenProps & { onBack?: () => void }): JSX.Element {
  const [selectedGoal, setSelectedGoal] = useState<FocusGoal | null>(null);
  const [isAdvancing, setIsAdvancing] = useState(false);

  const handleSelect = (goal: FocusGoal) => {
    if (isAdvancing) {
      return;
    }

    setSelectedGoal(goal);
    setIsAdvancing(true);

    // Auto-advance after 300ms
    setTimeout(() => {
      onSelect(goal);
    }, 300);
  };

  return (
    <Box flex={1} bg="background.primary" px="lg" py="xl">
      {/* Header with Back Button */}
      <Box flexDirection="row" alignItems="center" mb="md">
        {onBack && (
          <Pressable onPress={onBack} style={{ marginRight: 12 }}>
            <Box p="xs">
              <Text variant="h3" color="text.secondary">
                ‹
              </Text>
            </Box>
          </Pressable>
        )}
      </Box>

      {/* Header Content */}
      <Animated.View entering={FadeIn.duration(400)}>
        <Box gap="sm" mb="xl">
          <Text variant="label" color="primary.500">
            Step 1 of 4
          </Text>
          <Text variant="h2" color="text.primary">
            What do you mainly want to focus on?
          </Text>
          <Text variant="body" color="text.secondary">
            Pick one — this sets your default session category.
          </Text>
        </Box>
      </Animated.View>

      {/* Goal Options Grid */}
      <Box flexDirection="row" flexWrap="wrap" gap="md" justifyContent="center">
        {GOAL_OPTIONS.map((option, index) => (
          <GoalCard
            key={option.key}
            option={option}
            isSelected={selectedGoal === option.key}
            onPress={() => handleSelect(option.key)}
            index={index}
          />
        ))}
      </Box>

      {/* Skip Option */}
      <Animated.View
        entering={FadeIn.duration(400).delay(600)}
        style={{ marginTop: 'auto' }}
      >
        <Pressable
          onPress={onSkip}
          accessibilityLabel="Skip for now"
          accessibilityRole="button"
          accessibilityHint="Double tap to select"
        >
          <Box alignItems="center" py="md">
            <Text variant="bodySmall" color="text.tertiary">
              Skip for now ›
            </Text>
          </Box>
        </Pressable>
      </Animated.View>
    </Box>
  );
}

export default GoalScreen;
