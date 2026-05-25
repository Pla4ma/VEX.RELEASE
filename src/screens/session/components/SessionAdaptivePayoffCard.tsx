import React, { useMemo } from 'react';
import Animated, { FadeInUp } from 'react-native-reanimated';

import { Box, Text } from '../../../components/primitives';
import { getPremiumCardStyle } from '../../../components/premiumStyles';
import { buildCompletionAdaptivePayoff } from '../../../features/session-completion/adaptive-payoff-service';
import type { CompletionExperiencePolicy } from '../../../features/session-completion/completion-experience-policy';
import type { SessionCompletionConsequences } from '../../../features/session-completion/story-consequence-service';
import type { SessionSummary } from '../../../session/types';
import { useTheme } from '../../../theme';
import type { StudyProgressCardData } from '../hooks/useSessionCompleteStudyProgress';

type SessionAdaptivePayoffCardProps = {
  consequences?: SessionCompletionConsequences;
  nextActionLabel: string | null;
  policy: CompletionExperiencePolicy;
  studyProgress: StudyProgressCardData | null;
  summary: SessionSummary;
};

export function SessionAdaptivePayoffCard({
  consequences,
  nextActionLabel,
  policy,
  studyProgress,
  summary,
}: SessionAdaptivePayoffCardProps): JSX.Element {
  const { theme } = useTheme();
  const payoff = useMemo(
    () =>
      buildCompletionAdaptivePayoff({
        adaptivePayoff: policy.adaptivePayoff,
        bossDamage: consequences?.boss?.damageDealt ?? summary.damage?.totalDamage ?? null,
        coachActionLabel: nextActionLabel,
        study: studyProgress
          ? {
              nextTopic: studyProgress.nextSessionGoal?.topic ?? null,
              progressLabel: studyProgress.progressLabel,
              title: studyProgress.planTitle,
            }
          : null,
        summary,
      }),
    [consequences?.boss?.damageDealt, nextActionLabel, policy.adaptivePayoff, studyProgress, summary],
  );

  return (
    <Animated.View entering={FadeInUp.delay(220).duration(360)}>
      <Box
        mt={5}
        p={18}
        style={{
          backgroundColor: theme.colors.background.secondary,
          borderColor: theme.colors.primary[500],
          borderWidth: 1,
          ...getPremiumCardStyle('medium'),
        }}
      >
        <Text variant="label" color={theme.colors.primary[400]}>
          {payoff.label}
        </Text>
        <Text variant="h3" color={theme.colors.text.primary} mt={2}>
          {payoff.title}
        </Text>
        <Text variant="h4" color={theme.colors.primary[500]} mt={3}>
          {payoff.value}
        </Text>
        <Text variant="body" color={theme.colors.text.secondary} mt={2}>
          {payoff.body}
        </Text>
      </Box>
    </Animated.View>
  );
}
