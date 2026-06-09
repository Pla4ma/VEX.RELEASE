import React from 'react';
import { View } from 'react-native';

import { Text } from '../../../components/primitives/Text';
import { useTheme } from '../../../theme';
import { CARD_WIDTH } from './session-consequence-types';

interface StreakConsequenceCardProps {
  previousDays: number;
  currentDays: number;
  nextMilestone: number;
  daysUntilMilestone: number;
  streakSaved: boolean;
}

export function StreakConsequenceCard({
  currentDays,
  nextMilestone,
  daysUntilMilestone,
  streakSaved,
}: StreakConsequenceCardProps): JSX.Element {
  const { theme } = useTheme();

  return (
    <View
      style={{
        width: CARD_WIDTH,
        padding: theme.spacing[4],
        backgroundColor: streakSaved
          ? `${theme.colors.error[500]}15`
          : `${theme.colors.accent.orange}15`,
        borderRadius: theme.borderRadius.xl,
        borderWidth: 2,
        borderColor: streakSaved
          ? theme.colors.error[500]
          : theme.colors.accent.orange,
        marginRight: theme.spacing[3],
      }}
    >
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: theme.spacing[2],
          marginBottom: theme.spacing[2],
        }}
      >
        <Text fontSize={24} />
        <Text variant="body" fontWeight="700" color="text.primary">
          {streakSaved ? 'Streak Saved!' : `Day ${currentDays} Complete`}
        </Text>
      </View>

      <Text
        variant="body"
        color="text.secondary"
        style={{ marginBottom: theme.spacing[2] }}
      >
        {streakSaved
          ? 'You were at risk, but this session saved your streak!'
          : `Your ${currentDays}-day streak is alive and burning.`}
      </Text>

      <View
        style={{
          padding: theme.spacing[3],
          backgroundColor: theme.colors.background.primary,
          borderRadius: theme.borderRadius.lg,
        }}
      >
        <Text variant="caption" color="text.tertiary">
          NEXT MILESTONE
        </Text>
        <Text variant="body" fontWeight="600" color="text.primary">
          Day {nextMilestone} in {daysUntilMilestone} days
        </Text>
      </View>
    </View>
  );
}
