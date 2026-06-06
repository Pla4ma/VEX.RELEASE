import React from 'react';
import { Box } from '../../../components/primitives/Box';
import { Button } from '../../../components/primitives/Button';
import { Text } from '../../../components/primitives/Text';
import { GoalCard } from './GoalCard';

export type OnboardingGoalType =
  | 'deep-work'
  | 'build-habit'
  | 'get-done'
  | 'beat-procrastination';

export interface OnboardingGoal {
  id: OnboardingGoalType;
  icon: string;
  title: string;
  description: string;
}

interface OnboardingChooseGoalProps {
  selectedGoal: OnboardingGoalType | null;
  onSelectGoal: (goal: OnboardingGoalType) => void;
  onContinue: () => void;
}

const GOALS: readonly [
  OnboardingGoal,
  OnboardingGoal,
  OnboardingGoal,
  OnboardingGoal,
] = [
  {
    id: 'deep-work',
    icon: '\uD83E\uDDE0',
    title: 'Deep Work',
    description: 'Studying, coding, writing — VEX finds your best focus window',
  },
  {
    id: 'build-habit',
    icon: '\u2B55',
    title: 'Find My Rhythm',
    description: 'Let VEX learn what kind of sessions you actually finish',
  },
  {
    id: 'get-done',
    icon: '\uD83D\uDE80',
    title: 'Start Any Project',
    description: 'One clean block, then VEX recommends the next move',
  },
  {
    id: 'beat-procrastination',
    icon: '\uD83D\uDD04',
    title: 'Recover Momentum',
    description: 'VEX adapts to real sessions instead of tracking streaks',
  },
];

export function OnboardingChooseGoal({
  selectedGoal,
  onSelectGoal,
  onContinue,
}: OnboardingChooseGoalProps): JSX.Element {
  return (
    <Box flex={1} justifyContent="space-between" px="xl" py="2xl">
      <View>
        <Box gap="md" mt="xl">
          <Text fontSize={40}>{'\uD83C\uDFAF'}</Text>
          <Box gap="sm">
            <Text variant="h2" color="text.primary">
              What brings you here?
            </Text>
            <Text variant="body" color="text.secondary">
              This helps us personalize your experience.
            </Text>
          </Box>
        </Box>
      </View>

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

      <View>
        <Box gap="md">
          <Button
            size="lg"
            variant="primary"
            fullWidth
            onPress={onContinue}
            disabled={!selectedGoal}
            accessibilityLabel={selectedGoal ? 'Continue' : 'Select a goal'}
            accessibilityRole="button"
            accessibilityHint={
              selectedGoal
                ? 'Proceeds to the next step'
                : 'Select a goal first to continue'
            }
          >
            {selectedGoal ? 'Continue' : 'Select a goal'}
          </Button>
        </Box>
      </View>
    </Box>
  );
}

import { View } from 'react-native';

export default OnboardingChooseGoal;
