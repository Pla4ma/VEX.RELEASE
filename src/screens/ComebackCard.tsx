import React from 'react';
import { Image } from 'react-native';

import { Box } from '../components/primitives/Box';
import { Button } from '../components/primitives/Button';
import { Text , Text as VexText } from '../components/primitives/Text';
import type { ExtendedRootStackParams } from '../navigation/types';
import { useTheme } from '../theme/ThemeContext';
import { vexFire } from '../theme/tokens/vex-fire';

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
        backgroundColor: vexFire.panel,
        borderRadius: theme.borderRadius['3xl'],
        borderWidth: 1,
        borderColor: vexFire.borderStrong,
        gap: theme.spacing[4],
      }}
    >
      <Image
        accessibilityIgnoresInvertColors
        source={require('../../assets/vex/recovery/comeback-phoenix.png')}
        resizeMode="contain"
        style={{ alignSelf: 'center', height: 156, marginTop: -theme.spacing[5], opacity: 0.92, width: 156 }}
      />
      <Text
        variant="label"
        color={vexFire.ember}
        textTransform="uppercase"
      >
        Comeback Mode
      </Text>
      <Text variant="h2" color={vexFire.cream}>
        {comebackState.message}
      </Text>
      <Text variant="body" color={vexFire.textSecondary}>
        You were away {comebackState.daysAbsent} days
      </Text>

      <Box
        p="md"
        style={{
          backgroundColor: vexFire.backgroundSoft,
          borderRadius: theme.borderRadius.xl,
          borderWidth: 1,
          borderColor: vexFire.border,
        }}
      >
        <Text variant="body" color={vexFire.cream}>
          {`⚡ ${comebackState.rewardMultiplier}x XP on your first session back`}
        </Text>
      </Box>

      {comebackState.streakRestoreEligible ? (
        <Box
          p="md"
          style={{
            backgroundColor: vexFire.backgroundSoft,
            borderRadius: theme.borderRadius.xl,
            borderWidth: 1,
            borderColor: vexFire.amber,
            gap: theme.spacing[2],
          }}
        >
          <Text variant="body" color={vexFire.cream}>
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
                      ? vexFire.amber
                      : vexFire.line,
                  borderRadius: theme.borderRadius.full,
                  opacity: step === 0 ? 0.35 : 1,
                }}
              />
            ))}
          </Box>
          <Text variant="caption" color={vexFire.textSecondary}>
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
