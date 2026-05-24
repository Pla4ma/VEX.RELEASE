import React from 'react';
import { useWindowDimensions } from 'react-native';
import { Box } from '../../../components/primitives/Box';
import { Text } from '../../../components/primitives/Text';
import { SessionGradeCard } from './SessionGradeCard';
import { PerfectSessionBanner } from '../../../features/session-completion/components/PerfectSessionBanner';
import { SessionConsequenceCards, type SessionConsequenceCardsProps } from './SessionConsequenceCards';
import type { useSessionCompleteController } from '../../../features/session-completion/hooks';
import type { CompletionExperiencePolicy } from '../../../features/session-completion/completion-experience-policy';
import type { SessionSummary } from '../../../session/types';

type SessionCompleteController = ReturnType<typeof useSessionCompleteController>;

interface SessionCompleteHeroSectionProps {
  controller: SessionCompleteController;
  policy: CompletionExperiencePolicy;
  summary: SessionSummary;
  consequences?: {
    boss?: SessionConsequenceCardsProps['bossConsequence'];
    streak?: SessionConsequenceCardsProps['streakConsequence'];
    challenge?: SessionConsequenceCardsProps['challengeConsequence'];
    rival?: SessionConsequenceCardsProps['rivalConsequence'];
  };
}

export function SessionCompleteHeroSection({
  controller,
  policy,
  summary,
  consequences,
}: SessionCompleteHeroSectionProps): JSX.Element {
  const { width } = useWindowDimensions();
  const hidden = policy.hiddenCompletionSurfaces;

  return (
    <>
      <Box px={6}>
        <Text variant="label" color={controller.theme.colors.primary[400]}>
          {controller.hero.eyebrow}
        </Text>
        <Text variant="h2" color={controller.theme.colors.text.primary} mt={2}>
          {controller.hero.title}
        </Text>
        <Text variant="body" color={controller.theme.colors.text.secondary} mt={2}>
          {controller.hero.body}
        </Text>
      </Box>

      <SessionGradeCard
        durationLabel={`${summary.interruptions} interruptions | ${controller.formatDuration(
          controller.focusedDuration,
        )}`}
        gradeColor={controller.grade.color}
        gradeLabel={controller.grade.label}
        gradeLetter={controller.grade.letter}
        purityColor={controller.purity.color}
        purityLabel={controller.purity.label}
        purityScore={controller.focusPurityScore}
        width={width}
        xpEarned={controller.rewards.chestResult?.xpReward ?? summary.xpEarned ?? 0}
      />

      <PerfectSessionBanner isPerfect={summary.isPerfect ?? false} />

      <SessionConsequenceCards
        bossConsequence={
          hidden.includes('boss_consequence_card') ? undefined : consequences?.boss
        }
        streakConsequence={undefined}
        challengeConsequence={
          hidden.includes('challenge_consequence_card') ? undefined : consequences?.challenge
        }
        rivalConsequence={undefined}
      />
    </>
  );
}
