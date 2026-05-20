import React from 'react';
import { View } from 'react-native';

import { Button } from '../../../components/primitives/Button';
import { Text } from '../../../components/primitives/Text';
import { useTheme } from '../../../theme';
import type { StreakShieldMoment } from '../types';

type Props = {
  moment: StreakShieldMoment;
  onAccept: () => void;
  onDismiss: () => void;
};

export function StreakShieldMomentCard({
  moment,
  onAccept,
  onDismiss,
}: Props): JSX.Element {
  const { theme } = useTheme();

  return (
    <View
      style={{
        backgroundColor: theme.colors.background.secondary,
        borderColor: theme.colors.border.light,
        borderRadius: theme.borderRadius.xl,
        borderWidth: 1,
        gap: theme.spacing[3],
        padding: theme.spacing[4],
      }}
    >
      <View style={{ gap: theme.spacing[2] }}>
        <Text variant="h4" color={theme.colors.text.primary}>
          {moment.copy.headline}
        </Text>
        <Text variant="body" color={theme.colors.text.secondary}>
          {moment.copy.body}
        </Text>
      </View>
      <View style={{ gap: theme.spacing[2] }}>
        <Button
          accessibilityHint="Opens VEX Premium so you can add Streak Shield."
          accessibilityLabel={moment.copy.cta}
          accessibilityRole="button"
          onPress={onAccept}
          variant="primary"
        >
          {moment.copy.cta}
        </Button>
        <Button
          accessibilityHint="Dismisses this Streak Shield offer and keeps your session story visible."
          accessibilityLabel={moment.copy.secondary}
          accessibilityRole="button"
          onPress={onDismiss}
          variant="ghost"
        >
          {moment.copy.secondary}
        </Button>
      </View>
    </View>
  );
}
