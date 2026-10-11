import React from 'react';
import { Image } from 'react-native';
import { Box } from '../../../components/primitives/Box';
import { Text } from '../../../components/primitives/Text';
import { VexProofRing } from './VexProofRing';
import { PerfectSessionBanner } from '../../../features/session-completion/components/PerfectSessionBanner';
import type { useSessionCompleteController } from '../../../features/session-completion/hooks';
import type { SessionSummary } from '../../../session/types';
import { spacing } from '../../../theme/tokens/spacing';
import { vexFire } from '../../../theme/tokens/vex-fire';

const COMPLETION_RELIC = require('../../../../assets/vex/session/completion-relic.png');

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
  return (
    <>
      <Box px={6}>
        <Text variant="label" color={vexFire.ember}>
          {controller.hero.eyebrow}
        </Text>
        <Text variant="h2" color={vexFire.cream} mt={2}>
          {controller.hero.title}
        </Text>
        <Text
          variant="body"
          color={vexFire.textSecondary}
          mt={2}
        >
          {controller.hero.body}
        </Text>
      </Box>

      <Box alignItems="center" mt={6} mb={4} style={{ minHeight: spacing[24] + spacing[16], position: 'relative' }}>
        <Image
          accessibilityIgnoresInvertColors
          accessibilityLabel="Completion ember relic"
          source={COMPLETION_RELIC}
          resizeMode="contain"
          style={{ height: spacing[24] + spacing[16], opacity: 0.22, position: 'absolute', width: spacing[24] + spacing[16] }}
        />
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
