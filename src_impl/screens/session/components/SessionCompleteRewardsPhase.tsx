import React from 'react';
import { Box } from '../../../components/primitives/Box';
import { Text } from '../../../components/primitives/Text';
import { useSessionCompleteController } from '../../../features/session-completion/hooks';
import type { SessionSummary } from '../../../session/types';

type SessionCompleteController = ReturnType<typeof useSessionCompleteController>;

type Props = {
  controller: SessionCompleteController;
  nptDone: boolean;
  onNptDone: () => void;
  sessionId: string;
  summary: SessionSummary;
};

export function SessionCompleteRewardsPhase({ controller, summary }: Props): JSX.Element {
  return (
    <Box px={6} mt={6}>
      <Text variant="h4" color={controller.theme.colors.text.primary}>Rewards secured</Text>
      <Text variant="body" color={controller.theme.colors.text.secondary} mt={2}>
        +{summary.xpEarned} XP and +{summary.coinsEarned} coins added to your journey ladder.
      </Text>
    </Box>
  );
}
