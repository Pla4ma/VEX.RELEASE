import React from 'react';
import { Box } from '../../../components/primitives/Box';
import { ChestRevealAnimationEnhanced, mapVariableRewardTier } from './ChestRevealAnimationEnhanced';
import { XPEarnAnimation } from '../../../features/session-completion/components/XPEarnAnimation';
import { SessionCompletionRewardsSection } from './SessionCompletionRewardsSection';
import { CompanionGrowthSection } from './CompanionGrowthSection';
import { SessionCompletionFollowThrough } from './SessionCompletionFollowThrough';
import { useSessionCompleteController } from '../../../features/session-completion/hooks';
import type { SessionSummary } from '../../../session/types';

type SessionCompleteController = ReturnType<typeof useSessionCompleteController>;

// Neuroplasticity micro intervention - stubbed
const NeuroplasticityMicroInterventionCard = (_props: {
  userId: string;
  sessionDurationSeconds: number;
  onComplete: () => void;
  onSkip: () => void;
}) => null;

interface SessionCompleteRewardsPhaseProps {
  controller: SessionCompleteController;
  summary: SessionSummary;
  sessionId: string;
  nptDone: boolean;
  onNptDone: () => void;
}

export function SessionCompleteRewardsPhase({
  controller,
  summary,
  sessionId,
  nptDone,
  onNptDone,
}: SessionCompleteRewardsPhaseProps): JSX.Element | null {
  if (controller.rewards.revealStage < 1) {
    return null;
  }

  return (
    <>
      <Box px={6}>
        <ChestRevealAnimationEnhanced
          tier={mapVariableRewardTier(
            (controller.rewards.chestResult?.tier?.toUpperCase() as import('../../../features/rewards/VariableRewardEngine').VariableRewardTier) ?? 'COMMON'
          )}
          rewards={{
            xp: controller.rewards.chestResult?.xpReward ?? summary.xpEarned ?? 0,
            coins: controller.rewards.chestResult?.coinReward ?? 0,
            gems: controller.rewards.chestResult?.gemReward ?? 0,
          }}
          onComplete={() => void controller.rewards.actions.handleRevealComplete()}
          onOpenEarly={controller.rewards.actions.handleChestOpen}
        />
      </Box>

      {controller.rewards.revealStage >= 2 ? (
        <>
          <Box px={6} pt={7}>
            <XPEarnAnimation
              levelProgress={controller.levelMetric?.progress ?? null}
              summary={summary}
              totalXp={controller.rewards.chestResult?.xpReward ?? summary.xpEarned ?? 0}
            />
          </Box>
          <SessionCompletionRewardsSection
            levelMetric={controller.levelMetric}
            masteryState={controller.masteryState}
            progressionError={controller.progressionError}
            progressionLoading={controller.progressionLoading}
            rewards={controller.rewards}
            setMasteryState={controller.setMasteryState}
            studyProgress={controller.studyProgress}
            summary={summary}
            userId={controller.userId}
            onStartNewSession={() =>
              controller.navigation.navigate({ name: 'SessionSetup', params: {} })
            }
          />
          <Box px={6}>
            <CompanionGrowthSection
              sessionId={sessionId}
              summary={summary}
              theme={controller.theme}
              userId={controller.userId}
            />
          </Box>

          {!nptDone && controller.userId && (
            <NeuroplasticityMicroInterventionCard
              userId={controller.userId}
              sessionDurationSeconds={summary.effectiveDuration}
              onComplete={onNptDone}
              onSkip={onNptDone}
            />
          )}

          <SessionCompletionFollowThrough summary={summary} />
        </>
      ) : null}
    </>
  );
}
