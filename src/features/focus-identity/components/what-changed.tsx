import React from 'react';
import { View } from 'react-native';
import { Button } from '@/components/primitives/Button';
import { Text } from '@/components/primitives/Text';
import { useTheme } from '@/theme';
import { MAX_FOCUS_SCORE } from '../schemas';
import type { FocusScoreDashboardModel } from '../types';

interface WhatChangedProps {
  model: FocusScoreDashboardModel;
  onOpenMonthlyReport: () => void;
}

export function WhatChanged({
  model,
  onOpenMonthlyReport,
}: WhatChangedProps): JSX.Element | null {
  const { theme } = useTheme();
  if (!model.current) {return null;}

  const nextTarget = Math.min(MAX_FOCUS_SCORE, model.current.currentScore + 20);

  return (
    <View
      style={{
        borderWidth: 1,
        borderColor: theme.colors.border.light,
        borderRadius: theme.borderRadius.lg,
        padding: theme.spacing[4],
        gap: theme.spacing[2],
        backgroundColor: theme.colors.background.secondary,
      }}
    >
      <Text variant="h4" color={theme.colors.text.primary}>
        What changed
      </Text>
      <Text variant="bodySmall" color={theme.colors.text.secondary}>
        {model.current.lastChangeReason}
      </Text>
      <Text variant="bodySmall" color={theme.colors.text.secondary}>
        Next target: {nextTarget}
      </Text>
      <Button
        variant="outline"
        onPress={onOpenMonthlyReport}
        accessibilityLabel="Open monthly focus report"
        accessibilityRole="button"
        accessibilityHint="Opens your monthly focus report details"
      >
        Open monthly report
      </Button>
    </View>
  );
}
