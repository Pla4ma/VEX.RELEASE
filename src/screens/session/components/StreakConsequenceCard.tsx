import { vexFire } from "@/theme/tokens/vex-fire";
import React from 'react';
import { View, useWindowDimensions } from 'react-native';

import { Text } from '../../../components/primitives/Text';
import { useTheme } from '../../../theme/ThemeContext';
import { getCardWidth } from './session-consequence-types';

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
}: StreakConsequenceCardProps): React.ReactNode {
  const { theme } = useTheme();
  const { width: screenWidth } = useWindowDimensions();
  const cardWidth = getCardWidth(screenWidth);

  return (
    <View
      style={{
        width: cardWidth,
        padding: theme.spacing[4],
        backgroundColor: streakSaved
          ? `${vexFire.danger}15`
          : `${vexFire.ember}15`,
        borderRadius: theme.borderRadius.xl,
        borderWidth: 2,
        borderColor: streakSaved
          ? vexFire.danger
          : vexFire.ember,
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
        <Text variant="body" fontWeight="700" color={vexFire.cream}>
          {streakSaved ? 'Streak Saved!' : `Day ${currentDays} Complete`}
        </Text>
      </View>

      <Text
        variant="body"
        color={vexFire.textSecondary}
        style={{ marginBottom: theme.spacing[2] }}
      >
        {streakSaved
          ? 'You were at risk, but this session saved your streak!'
          : `Your ${currentDays}-day streak is alive and burning.`}
      </Text>

      <View
        style={{
          padding: theme.spacing[3],
          backgroundColor: vexFire.background,
          borderRadius: theme.borderRadius.lg,
        }}
      >
        <Text variant="caption" color={vexFire.textMuted}>
          NEXT MILESTONE
        </Text>
        <Text variant="body" fontWeight="600" color={vexFire.cream}>
          Day {nextMilestone} in {daysUntilMilestone} days
        </Text>
      </View>
    </View>
  );
}
