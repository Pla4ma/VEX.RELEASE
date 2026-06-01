import React, { useEffect, useRef } from 'react';
import { Box } from '../../../components/primitives/Box';
import { XPEarnAnimation } from '../../../features/session-completion/components/XPEarnAnimation';
import { SessionCompletionRewardsSection } from './SessionCompletionRewardsSection';
import { CompanionGrowthSection } from './CompanionGrowthSection';
import { SessionCompletionFollowThrough } from './SessionCompletionFollowThrough';
import { useSessionCompleteController } from '../../../features/session-completion/hooks';
import type { CompletionExperiencePolicy } from '../../../features/session-completion/completion-experience-policy';
import type { SessionCompletionConsequences } from '../../../features/session-completion/story-consequence-service';
import type { SessionSummary } from '../../../session/types';

type SessionCompleteController = ReturnType<
  typeof useSessionCompleteController
>;

interface SessionCompleteRewardsPhaseProps {
  controller: SessionCompleteController;
  consequences?: SessionCompletionConsequences;
  summary: SessionSummary;
  sessionId: string;
  policy: CompletionExperiencePolicy;
}

export function SessionCompleteRewardsPhase({
  controller,
  consequences,
  summary,
  sessionId,
  policy,
}: SessionCompleteRewardsPhaseProps): JSX.Element | null {
  const hidden = policy.hiddenCompletionSurfaces;
  const advancedRef = useRef(false);

  useEffect(() => {
    if (controller.rewards.completionStage === 1 && !advancedRef.current) {
      advancedRef.current = true;
      controller.rewards.actions.handleRevealComplete();
    }
  }, [controller.rewards.completionStage, controller.rewards.actions]);

  if (controller.rewards.completionStage < 1) {
    return null;
  }

  const showXpAnimation = controller.rewards.completionStage >= 1;
  const showRewards = controller.rewards.completionStage >= 2;

  return (
    <>
      {showXpAnimation ? (
        <Box px={6} pt={7}>
          <XPEarnAnimation
            levelProgress={controller.levelMetric?.progress ?? null}
            summary={summary}
            totalXp={summary.xpEarned ?? 0}
          />
        </Box>
      ) : null}

      {showRewards ? (
        <>
          <SessionCompletionRewardsSection
            levelMetric={controller.levelMetric}
            masteryState={controller.masteryState}
            consequences={consequences}
            nextActionLabel={controller.nextAction?.ctaLabel ?? null}
            policy={policy}
            progressionError={controller.progressionError}
            progressionLoading={controller.progressionLoading}
            rewards={controller.rewards}
            hiddenSurfaces={hidden}
            setMasteryState={controller.setMasteryState}
            studyProgress={
              hidden.includes('study_progress_card')
                ? null
                : controller.studyProgress
            }
            summary={summary}
            userId={controller.userId}
            onStartNewSession={() =>
              controller.navigation.navigate({
                name: 'SessionSetup',
                params: {},
              })
            }
          />
          {!hidden.includes('companion_growth_card') ? (
            <Box px={6}>
              <CompanionGrowthSection
                sessionId={sessionId}
                summary={summary}
                theme={controller.theme}
                userId={controller.userId}
              />
            </Box>
          ) : null}

          {!hidden.includes('follow_through_cards') ? (
            <SessionCompletionFollowThrough summary={summary} />
          ) : null}
        </>
      ) : null}
    </>
  );
}
