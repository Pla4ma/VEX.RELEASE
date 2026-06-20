import React from 'react';

import { Box } from '../components/primitives/Box';
import { Button } from '../components/primitives/Button';
import { Text } from '../components/primitives/Text';
import type { ExtendedRootStackParams } from '../navigation/types';
import { useTheme } from '../theme/ThemeContext';
import { Text as VexText } from '../components/primitives/Text';

type ComebackState = ExtendedRootStackParams['Comeback']['comebackState'];

interface ComebackCardProps {
  comebackState: ComebackState;
  onStart: () => void;
  onClose: () => void;
}

export function ComebackCard({
  comebackState,
  onStart,
  onClose,
}: ComebackCardProps): React.ReactNode {
  const { theme } = useTheme();

  return (
    <Box
      p="xl"
      style={{
        backgroundColor: theme.colors.background.secondary,
        borderRadius: theme.borderRadius['3xl'],
        borderWidth: 1,
        borderColor: theme.colors.border.light,
        gap: theme.spacing[4],
      }}
    >
      <Text
        variant="label"
        color={theme.colors.primary[500]}
        textTransform="uppercase"
      >
        Comeback Mode
      </Text>
      <Text variant="h2" color={theme.colors.text.primary}>
        {comebackState.message}
      </Text>
      <Text variant="body" color={theme.colors.text.secondary}>
        You were away {comebackState.daysAbsent} days
      </Text>

      <Box
        p="md"
        style={{
          backgroundColor: theme.colors.surface.selected,
          borderRadius: theme.borderRadius.xl,
          borderWidth: 1,
          borderColor: theme.colors.primary[200],
        }}
      >
        <Text variant="body" color={theme.colors.text.primary}>
          {`⚡ ${comebackState.rewardMultiplier}x XP on your first session back`}
        </Text>
      </Box>

      {comebackState.streakRestoreEligible ? (
        <Box
          p="md"
          style={{
            backgroundColor: theme.colors.warning[50],
            borderRadius: theme.borderRadius.xl,
            borderWidth: 1,
            borderColor: theme.colors.warning[500],
            gap: theme.spacing[2],
          }}
        >
          <Text variant="body" color={theme.colors.text.primary}>
            {`🔥 Your ${comebackState.streakBefore}-day streak can be restored! Complete 3 sessions this week.`}
          </Text>
          <Box flexDirection="row" gap="sm">
            {[0, 1, 2].map((step) => (
              <Box
                key={step}
                flex={1}
                height={10}
                style={{
                  backgroundColor:
                    step === 0
                      ? theme.colors.warning[500]
                      : theme.colors.background.tertiary,
                  borderRadius: theme.borderRadius.full,
                  opacity: step === 0 ? 0.35 : 1,
                }}
              />
            ))}
          </Box>
          <Text variant="caption" color={theme.colors.text.secondary}>
            0 / 3 sessions completed
          </Text>
        </Box>
      ) : null}

      <Button
        size="lg"
        onPress={onStart}
        accessibilityLabel="Start comeback session"
        accessibilityRole="button"
        accessibilityHint="Double tap to activate"
      >
        <VexText>Start My Comeback Session</VexText>
      </Button>
      <Button variant="ghost"
        size="lg"
        onPress={onClose}
        accessibilityLabel="Remind me later"
        accessibilityRole="button"
        accessibilityHint="Double tap to activate"
      >
        <VexText>Remind Me Later</VexText>
      </Button>
    </Box>
  );
}
