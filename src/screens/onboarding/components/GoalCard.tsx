import React from 'react';
import { Pressable, View } from 'react-native';
import { Box } from '../../../components/primitives/Box';
import { Text } from '../../../components/primitives/Text';
import { useTheme } from '../../../theme/ThemeContext';
import type { OnboardingGoal } from './OnboardingChooseGoal';

interface GoalCardProps {
  goal: OnboardingGoal;
  isSelected: boolean;
  onPress: () => void;
  index: number;
}

export function GoalCard({
  goal,
  isSelected,
  onPress,
  index: _index,
}: GoalCardProps): React.ReactNode {
  const { theme } = useTheme();

  return (
    <View style={{ flex: 1 }}>
      <Pressable
        onPress={onPress}
        accessibilityLabel={goal.title}
        accessibilityRole="button"
        accessibilityHint={`Select ${goal.title} as your goal`}
      >
        <Box
          p="lg"
          borderRadius={theme.borderRadius['2xl']}
          bg={
            isSelected
              ? `${theme.colors.primary[500]}15`
              : theme.colors.background.secondary
          }
          borderWidth={2}
          borderColor={
            isSelected ? theme.colors.primary[500] : theme.colors.border.DEFAULT
          }
          height={140}
          justifyContent="space-between"
        >
          <Text fontSize={32}>{goal.icon}</Text>

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

          <Box
            position="absolute"
            top={12}
            right={12}
            width={24}
            height={24}
            borderRadius={theme.borderRadius.full}
            bg={
              isSelected
                ? theme.colors.primary[500]
                : theme.colors.background.tertiary
            }
            borderWidth={2}
            borderColor={
              isSelected
                ? theme.colors.primary[500]
                : theme.colors.border.DEFAULT
            }
            justifyContent="center"
            alignItems="center"
          >
            {isSelected && (
              <Text fontSize={14} color={theme.colors.text.inverse}>
                {'\u2713'}
              </Text>
            )}
          </Box>
        </Box>
      </Pressable>
    </View>
  );
}
