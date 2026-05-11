/**
 * NameAndGoalScreen Component
 *
 * Combined name and goal selection screen for five-screen maximum onboarding.
 * "What should we call you?" + "What do you mainly want to focus on?"
 * Name input first, then goal selection. Auto-advances after goal selection.
 *
 * @phase 4
 */

import React, { useState } from 'react';
import { Pressable, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import Animated, {
  FadeIn,
  FadeInUp,
} from 'react-native-reanimated';

import { Box } from '../../../components/primitives/Box';
import { Text } from '../../../components/primitives/Text';
import { useTheme } from '../../../theme';
import type { FocusGoal } from '../schemas';
import { GOAL_OPTIONS } from '../service';
import { GoalCard } from './GoalCard';
import { NameInputSection } from './NameInputSection';

interface NameAndGoalScreenProps {
  onContinue: (name: string, goal: FocusGoal) => void;
  onSkip: () => void;
  onBack?: () => void;
}

export function NameAndGoalScreen({ onContinue, onSkip, onBack }: NameAndGoalScreenProps): JSX.Element {
  const { theme } = useTheme();
  const [name, setName] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<FocusGoal | null>(null);
  const [isAdvancing, setIsAdvancing] = useState(false);

  const isValid = name.trim().length >= 2;
  const showGoals = isValid && !isFocused;

  const handleGoalSelect = (goal: FocusGoal) => {
    if (isAdvancing) {return;}

    setSelectedGoal(goal);
    setIsAdvancing(true);

    setTimeout(() => {
      onContinue(name.trim(), goal);
    }, 300);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1 }}
    >
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
        <Box flex={1} bg="background.primary" px="lg" py="xl">
          <Box flexDirection="row" alignItems="center" mb="md">
            {onBack && (
              <Pressable onPress={onBack} style={{ marginRight: 12 }}>
                <Box p="xs">
                  <Text variant="h3" color="text.secondary">‹</Text>
                </Box>
              </Pressable>
            )}
          </Box>

          <Animated.View entering={FadeIn.duration(400)}>
            <Box gap="sm" mb="xl">
              <Text variant="label" color="primary.500">
                Step 2 of 5
              </Text>
              <Text variant="h2" color="text.primary">
                {showGoals ? 'What do you mainly want to focus on?' : 'What should we call you?'}
              </Text>
              <Text variant="body" color="text.secondary">
                {showGoals ? 'Pick one — this sets your default session category.' : "This is how you'll appear to your squad."}
              </Text>
            </Box>
          </Animated.View>

          <NameInputSection
            name={name}
            setName={setName}
            isFocused={isFocused}
            setIsFocused={setIsFocused}
            showGoals={showGoals}
          />

          {showGoals && (
            <Animated.View
              entering={FadeInUp.duration(500)}
              style={{ marginTop: theme.spacing[6] }}
            >
              <Box
                flexDirection="row"
                flexWrap="wrap"
                gap="md"
                justifyContent="center"
              >
                {GOAL_OPTIONS.map((option, index) => (
                  <GoalCard
                    key={option.key}
                    option={option}
                    isSelected={selectedGoal === option.key}
                    onPress={() => handleGoalSelect(option.key)}
                    index={index}
                  />
                ))}
              </Box>
            </Animated.View>
          )}

          <Box flex={1} minHeight={40} />

          <Animated.View
            entering={FadeIn.duration(400).delay(500)}
            style={{ marginTop: 'auto' }}
          >
            <Pressable onPress={onSkip}
              accessibilityLabel="Skip for now › button"
              accessibilityRole="button"
              accessibilityHint="Activates this control">
              <Box alignItems="center" py="md">
                <Text variant="bodySmall" color="text.tertiary">
                  Skip for now ›
                </Text>
              </Box>
            </Pressable>
          </Animated.View>
        </Box>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

export default NameAndGoalScreen;
