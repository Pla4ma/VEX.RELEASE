import React from 'react';
import { useWindowDimensions } from 'react-native';
import { Box } from '../../../components/primitives/Box';
import { Text } from '../../../components/primitives/Text';
import { VexProofRing } from './VexProofRing';
import { PerfectSessionBanner } from '../../../features/session-completion/components/PerfectSessionBanner';
import type { useSessionCompleteController } from '../../../features/session-completion/hooks';
import type { SessionSummary } from '../../../session/types';

type SessionCompleteController = ReturnType<
  typeof useSessionCompleteController
>;

interface SessionCompleteHeroSectionProps {
  controller: SessionCompleteController;
  summary: SessionSummary;
}

export function SessionCompleteHeroSection({
  controller,
  summary,
}: SessionCompleteHeroSectionProps): React.ReactNode {
  const { width: _width } = useWindowDimensions();

  return (
    <>
      <Box px={6}>
        <Text variant="label" color="vexCyan">
          {controller.hero.eyebrow}
        </Text>
        <Text variant="h2" color={controller.theme.colors.text.primary} mt={2}>
          {controller.hero.title}
        </Text>
        <Text
          variant="body"
          color={controller.theme.colors.text.secondary}
          mt={2}
        >
          {controller.hero.body}
        </Text>
      </Box>

      <Box alignItems="center" mt={6} mb={4}>
        <VexProofRing
          grade={controller.grade.letter === 'F' ? 'D' : controller.grade.letter}
          size={180}
          delay={400}
        />
      </Box>

      <PerfectSessionBanner isPerfect={summary.isPerfect ?? false} />
    </>
  );
}
