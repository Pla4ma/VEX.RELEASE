/**
 * OnboardingChooseGoal Component
 *
 * 2x2 grid of goal cards. User selects one.
 * Affects AI coach persona, challenges, and onboarding copy.
 *
 * @phase 2.4
 */

import React from 'react';
import { Pressable } from 'react-native';
import Animated, {
  FadeIn,
  FadeInUp,
  useAnimatedStyle,
  withSpring,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { Box } from '../../../components/primitives/Box';
import { Button } from '../../../components/primitives/Button';
import { Text } from '../../../components/primitives/Text';
import { useTheme } from '../../../theme';

interface OnboardingChooseGoalProps {
  selectedGoal: OnboardingGoalType | null;
  onSelectGoal: (goal: OnboardingGoalType) => void;
  onContinue: () => void;
}

const GOALS: OnboardingGoal[] = [
  {
    id: 'deep-work',
    icon: '🧠',
    title: 'Deep Work',
    description: 'Studying, coding, writing',
  },
  {
    id: 'build-habit',
    icon: '💪',
    title: 'Build a Habit',
    description: 'Daily discipline',
  },
  {
    id: 'get-done',
    icon: '📈',
    title: 'Get More Done',
    description: 'Tasks and productivity',
  },
  {
    id: 'beat-procrastination',
    icon: '🎮',
    title: 'Beat Procrastination',
    description: 'Focus gaming',
  },
];

/**
 * Individual goal card
 */
function GoalCard({
  goal,
  isSelected,
  onPress,
  index,
}: {
  goal: OnboardingGoal;
  isSelected: boolean;
  onPress: () => void;
  index: number;
}): JSX.Element {
  const { theme } = useTheme();
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePress = () => {
    scale.value = withSequence(
      withTiming(0.95, { duration: 100 }),
      withSpring(1, { damping: 15, stiffness: 200 })
    );
    onPress();
  };

  return (
    <Animated.View
      entering={FadeInUp.delay(index * 100).duration(400)}
      style={[{ flex: 1 }, animatedStyle]}
    >
      <Pressable onPress={handlePress}
  accessibilityLabel="Interactive control"
  accessibilityRole="button"
  accessibilityHint="Activates this control">
        <Box
          p="lg"
          borderRadius="2xl"
          bg={isSelected ? `${theme.colors.primary[500]}15` : theme.colors.background.secondary}
          borderWidth={2}
          borderColor={isSelected ? theme.colors.primary[500] : theme.colors.border.DEFAULT}
          height={140}
          justifyContent="space-between"
        >
          {/* Icon */}
          <Text fontSize={32}>{goal.icon}</Text>

          {/* Text */}
          <Box gap="xs">
            <Text
              variant="h4"
              color={isSelected ? 'primary.DEFAULT' : 'text.primary'}
              fontWeight={isSelected ? '700' : '600'}
            >
              {goal.title}
            </Text>
            <Text variant="caption" color="text.tertiary">
              {goal.description}
            </Text>
          </Box>

          {/* Selection Indicator */}
          <Box
            position="absolute"
            top={12}
            right={12}
            width={24}
            height={24}
            borderRadius="full"
            bg={isSelected ? theme.colors.primary[500] : theme.colors.background.tertiary}
            borderWidth={2}
            borderColor={isSelected ? theme.colors.primary[500] : theme.colors.border.DEFAULT}
            justifyContent="center"
            alignItems="center"
          >
            {isSelected && <Text fontSize={14} color={theme.colors.text.inverse}>✓</Text>}
          </Box>
        </Box>
      </Pressable>
    </Animated.View>
  );
}

// Helper for withSequence
function withSequence(
  ...animations: Array<ReturnType<typeof withTiming> | ReturnType<typeof withSpring>>
): number {
  return animations[0] as unknown as number;
}

/**
 * Main goal selection component
 */
export function OnboardingChooseGoal({
  selectedGoal,
  onSelectGoal,
  onContinue,
}: OnboardingChooseGoalProps): JSX.Element {
  const { theme } = useTheme();

  return (
    <Box flex={1} justifyContent="space-between" px="xl" py="2xl">
      {/* Header */}
      <Animated.View entering={FadeIn.duration(400)}>
        <Box gap="md" mt="xl">
          <Text fontSize={40}>🎯</Text>
          <Box gap="sm">
            <Text variant="h2" color="text.primary">
              What brings you here?
            </Text>
            <Text variant="body" color="text.secondary">
              This helps us personalize your experience.
            </Text>
          </Box>
        </Box>
      </Animated.View>

      {/* Goal Grid */}
      <Box gap="md" flex={1} justifyContent="center">
        <Box flexDirection="row" gap="md">
          <GoalCard
            goal={GOALS[0]}
            isSelected={selectedGoal === GOALS[0].id}
            onPress={() => onSelectGoal(GOALS[0].id)}
            index={0}
          />
          <GoalCard
            goal={GOALS[1]}
            isSelected={selectedGoal === GOALS[1].id}
            onPress={() => onSelectGoal(GOALS[1].id)}
            index={1}
          />
        </Box>
        <Box flexDirection="row" gap="md">
          <GoalCard
            goal={GOALS[2]}
            isSelected={selectedGoal === GOALS[2].id}
            onPress={() => onSelectGoal(GOALS[2].id)}
            index={2}
          />
          <GoalCard
            goal={GOALS[3]}
            isSelected={selectedGoal === GOALS[3].id}
            onPress={() => onSelectGoal(GOALS[3].id)}
            index={3}
          />
        </Box>
      </Box>

      {/* Continue Button */}
      <Animated.View entering={FadeInUp.delay(500).duration(400)}>
        <Box gap="md">
          <Button
            size="lg"
            variant="primary"
            fullWidth
            onPress={onContinue}
            disabled={!selectedGoal}

          accessibilityLabel="Action button"
          accessibilityRole="button"
          accessibilityHint="Activates this control">
            {selectedGoal ? 'Continue' : 'Select a goal'}
          </Button>
        </Box>
      </Animated.View>
    </Box>
  );
}

export default OnboardingChooseGoal;

export * from "./OnboardingChooseGoal.types";
