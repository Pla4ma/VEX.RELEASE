import React from 'react';

import { Box } from '../../../components/primitives/Box';
import { Button } from '../../../components/primitives/Button';
import { Text } from '../../../components/primitives/Text';
import { SessionMode } from '../../../session/modes';
import { useTheme } from '../../../theme/ThemeContext';
import { glassEdge } from '../../../theme/tokens/elevation';
import { Text as VexText } from '../../../components/primitives/Text';

type SessionSetupFooterProps = {
  breakDurationSeconds: number;
  durationMinutes: number;
  intervalCount: number;
  isStarting: boolean;
  onStart: () => void;
  selectedSessionMode: SessionMode;
  selectedThemeLabel: string | null;
};

export function SessionSetupFooter({
  breakDurationSeconds,
  durationMinutes,
  intervalCount,
  isStarting,
  onStart,
  selectedSessionMode,
  selectedThemeLabel,
}: SessionSetupFooterProps) {
  const { theme } = useTheme();

  return (
    <Box
      position="absolute"
      bottom={0}
      left={0}
      right={0}
      px="lg"
      py="md"
      pb="xl"
      bg="background.primary"
      style={[
        {
          borderTopWidth: 1,
          borderTopColor: theme.colors.border.light,
        },
        glassEdge,
      ]}
    >
      <Text variant="caption" color="text.secondary" textAlign="center" mb="sm">
        {`${durationMinutes} min focus`}
        {breakDurationSeconds > 0
          ? ` · ${Math.round(breakDurationSeconds / 60)} min break`
          : ''}
        {intervalCount > 1 ? ` · ${intervalCount} intervals` : ''}
        {selectedSessionMode === SessionMode.SPRINT
          ? ' · Sprint chain active'
          : ''}
        {selectedThemeLabel ? ` · ${selectedThemeLabel}` : ''}
      </Text>

      <Button variant="primary"
        size="lg"
        onPress={onStart}
        isLoading={isStarting}
        fullWidth
        accessibilityLabel={`Start ${durationMinutes} minute session`}
        accessibilityRole="button"
        accessibilityHint="Starts this customized focus session"
      >
        <VexText>Start Session</VexText>
      </Button>
    </Box>
  );
}

export default SessionSetupFooter;
