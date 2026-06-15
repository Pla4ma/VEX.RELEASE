import React from 'react';

import { Box } from '../../../components/primitives/Box';
import { Button } from '../../../components/primitives/Button';
import { Text } from '../../../components/primitives/Text';
import { useTheme } from '../../../theme';
import { SessionMode } from '../../../session/modes';
import type { FirstSessionPersonalization } from '../hooks/useFirstSessionPersonalization';

type FirstSessionSetupCardProps = {
  personalization: FirstSessionPersonalization;
  isStarting: boolean;
  onStart: (config: {
    mode: SessionMode;
    durationMinutes: number;
    goal?: string;
  }) => void;
};

const MODE_LABELS: Record<string, string> = {
  [SessionMode.STUDY]: 'Start one study block.',
  [SessionMode.LIGHT_FOCUS]: 'Start one focused session.',
  [SessionMode.DEEP_WORK]: 'Protect one project block.',
  [SessionMode.CREATIVE]: 'Start one clean session.',
};

export function FirstSessionSetupCard({
  personalization,
  isStarting,
  onStart,
}: FirstSessionSetupCardProps): React.ReactNode {
  const { theme } = useTheme();

  const handleStart = () => {
    onStart({
      mode: personalization.defaultMode,
      durationMinutes: personalization.suggestedDurationMinutes,
    });
  };

  const laneCopy =
    MODE_LABELS[personalization.defaultMode] ?? 'Start one focused session.';

  return (
    <Box px="lg" mt="md">
      <Box
        p="lg"
        bg="background.secondary"
        borderRadius="xl"
        borderWidth={1}
        borderColor={theme.colors.primary[500]}
        gap="lg"
      >
        <Box gap="xs">
          <Text variant="label" color="primary.500">
            Your first session
          </Text>
          <Text variant="h4" color="text.primary">
            {laneCopy}
          </Text>
          <Text variant="body" color="text.secondary">
            {personalization.coachLine}
          </Text>
        </Box>

        {/* Duration display */}
        <Box
          p="md"
          bg="background.primary"
          borderRadius="lg"
          borderWidth={1}
          borderColor="border.light"
          gap="xs"
        >
          <Text variant="caption" color="text.tertiary">
            Recommended
          </Text>
          <Box flexDirection="row" alignItems="baseline" gap="xs">
            <Text variant="h3" color="primary.500">
              {personalization.suggestedDurationMinutes}
            </Text>
            <Text variant="body" color="text.secondary">
              minutes
            </Text>
          </Box>
          <Text variant="caption" color="text.tertiary">
            {personalization.durationLabel}
          </Text>
        </Box>

        <Button
          <Text>variant="primary"</Text>
          size="lg"
          fullWidth
          onPress={handleStart}
          isLoading={isStarting}
          accessibilityLabel={`Start ${personalization.suggestedDurationMinutes}-min session`}
          accessibilityRole="button"
          accessibilityHint="Begins your first focus session"
        >
          Start
        </Button>
      </Box>
    </Box>
  );
}

export default FirstSessionSetupCard;
