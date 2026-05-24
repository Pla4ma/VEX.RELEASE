import React, { useEffect, useRef } from 'react';
import { Box } from '../../../components/primitives/Box';
import { XPEarnAnimation } from '../../../features/session-completion/components/XPEarnAnimation';
import { SessionCompletionRewardsSection } from './SessionCompletionRewardsSection';
import { CompanionGrowthSection } from './CompanionGrowthSection';
import { SessionCompletionFollowThrough } from './SessionCompletionFollowThrough';
import { useSessionCompleteController } from '../../../features/session-completion/hooks';
import type { CompletionExperiencePolicy } from '../../../features/session-completion/completion-experience-policy';
import type { SessionSummary } from '../../../session/types';
import { SessionPremiumChestCard } from './SessionPremiumChestCard';

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
  policy: CompletionExperiencePolicy;
  nptDone: boolean;
  onOpenInventory?: () => void;
  onOpenShop?: () => void;
  onNptDone: () => void;
}

export function SessionCompleteRewardsPhase({
  controller,
  summary,
  sessionId,
  policy,
  nptDone,
  onOpenInventory,
  onOpenShop,
  onNptDone,
}: SessionCompleteRewardsPhaseProps): JSX.Element | null {
  const creditedHiddenChestRef = useRef(false);
  const hidden = policy.hiddenCompletionSurfaces;

  useEffect(() => {
    if (
      hidden.includes('chest_reward_animation') &&
      controller.rewards.revealStage >= 1 &&
      !creditedHiddenChestRef.current
    ) {
      creditedHiddenChestRef.current = true;
      void controller.rewards.actions.handleRevealComplete();
    }
  }, [controller.rewards.actions, controller.rewards.revealStage, hidden]);

  if (controller.rewards.revealStage < 1) {
    return null;
  }

  return (
    <>
      {!hidden.includes('chest_reward_animation') ? (
        <SessionPremiumChestCard
          chestResult={controller.rewards.chestResult}
          isOpened={controller.rewards.revealStage >= 2}
          summary={summary}
          onOpen={() => {
            controller.rewards.actions.handleChestOpen();
            void controller.rewards.actions.handleRevealComplete();
          }}
          onOpenInventory={
            hidden.includes('shop_inventory_prompts') ? undefined : onOpenInventory
          }
          onOpenShop={
            hidden.includes('shop_inventory_prompts') ? undefined : onOpenShop
          }
        />
      ) : null}

      {controller.rewards.revealStage >= 2 ||
      hidden.includes('chest_reward_animation') ? (
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
            hiddenSurfaces={hidden}
            setMasteryState={controller.setMasteryState}
            studyProgress={
              hidden.includes('study_progress_card') ? null : controller.studyProgress
            }
            summary={summary}
            userId={controller.userId}
            onStartNewSession={() =>
              controller.navigation.navigate({ name: 'SessionSetup', params: {} })
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

          {!nptDone && controller.userId && (
            <NeuroplasticityMicroInterventionCard
              userId={controller.userId}
              sessionDurationSeconds={summary.effectiveDuration}
              onComplete={onNptDone}
              onSkip={onNptDone}
            />
          )}

          {!hidden.includes('follow_through_cards') ? (
            <SessionCompletionFollowThrough summary={summary} />
          ) : null}
        </>
      ) : null}
    </>
  );
}
