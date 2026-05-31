import React from 'react';
import { View } from 'react-native';

import { getPremiumCardStyle } from '../../../components/premiumStyles';
import { Button } from '../../../components/primitives/Button';
import { Text } from '../../../components/primitives/Text';
import type { NextBestAction } from '../../../features/progression';
import { useTheme } from '../../../theme';

export function NextBestActionCard({
  action,
  onPress,
}: {
  action: NextBestAction;
  onPress: () => void;
}) {
  const { theme } = useTheme();
  return (
    <View
      style={{
        borderWidth: 1,
        borderColor: theme.colors.primary[100],
        backgroundColor: theme.colors.background.secondary,
        padding: theme.spacing[4],
        gap: theme.spacing[3],
        ...getPremiumCardStyle('large'),
      }}
    >
      <Text variant="label" color={theme.colors.primary[500]}>
        Next Best Action
      </Text>
      <Text variant="h4" color={theme.colors.text.primary}>
        {action.title}
      </Text>
      <Text variant="bodySmall" color={theme.colors.text.secondary}>
        {action.description}
      </Text>
      <Text variant="caption" color={theme.colors.text.tertiary}>
        {action.rewardLabel}
      </Text>
      <Button
        onPress={onPress}
        accessibilityLabel="Perform action"
        accessibilityRole="button"
        accessibilityHint="Double tap to activate"
      >
        {action.ctaLabel}
      </Button>
    </View>
  );
}
