import React from 'react';
import { View } from 'react-native';

import { getPremiumCardStyle } from '../../../components/premiumStyles';
import { Text } from '../../../components/primitives/Text';
import type { UserExperienceStage } from '../../../features/liveops-config';
import { useTheme } from '../../../theme';

const GOAL_COPY: Record<UserExperienceStage, { title: string; body: string }> =
  {
    NEW_USER: {
      title: 'Start with one clean finish',
      body: 'One completed session makes VEX feel real. The app stays intentionally quiet until then.',
    },
    ACTIVATING: {
      title: 'Protect the habit first',
      body: 'Build momentum before exploring extras. The social and boss layers unlock naturally.',
    },
    ENGAGED: {
      title: 'Deepen your momentum',
      body: 'Your next session should build on your streak, not just maintain it.',
    },
    POWER_USER: {
      title: 'Master your focus rhythm',
      body: 'Use the full VEX toolkit when it serves you. Keep the core habit strong.',
    },
  };

export function GoalCard({ stage }: { stage: UserExperienceStage }) {
  const { theme } = useTheme();
  const copy = GOAL_COPY[stage];

  return (
    <View
      style={{
        borderWidth: 1,
        borderColor: theme.colors.border.light,
        backgroundColor: theme.colors.background.secondary,
        padding: theme.spacing[4],
        gap: theme.spacing[2],
        ...getPremiumCardStyle('medium'),
      }}
    >
      <Text variant="label" color={theme.colors.text.secondary}>
        Today&apos;s Focus
      </Text>
      <Text variant="h4" color={theme.colors.text.primary}>
        {copy.title}
      </Text>
      <Text variant="bodySmall" color={theme.colors.text.secondary}>
        {copy.body}
      </Text>
    </View>
  );
}
