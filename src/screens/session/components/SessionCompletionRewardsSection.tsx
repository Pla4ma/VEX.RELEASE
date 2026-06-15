import React from 'react';
import Animated, { FadeInUp } from 'react-native-reanimated';

import { Banner } from '../../../components/Banner';
import { Box } from '../../../components/primitives/Box';
import { MasteryCard } from '../../../features/mastery/components/MasteryCard';
import type { MasteryState } from '../../../features/mastery/types';
import type {
  CompletionExperiencePolicy,
  CompletionSurface,
} from '../../../features/session-completion/completion-experience-policy';
import type { SessionCompletionConsequences } from '../../../features/session-completion/story-consequence-service';
import type { SessionSummary } from '../../../session/types';
import type { StudyProgressCardData } from '../hooks/useSessionCompleteStudyProgress';
import { SessionAdaptivePayoffCard } from './SessionAdaptivePayoffCard';
import { SessionProgressionCard } from './SessionProgressionCard';

type SessionCompletionRewardsSectionProps = {
  consequences?: SessionCompletionConsequences;
  hiddenSurfaces: CompletionSurface[];
  levelMetric: {
    accent: string;
    id: string;
    label: string;
    progress: number;
    reward: string;
    value: string;
  } | null;
  progressionError: unknown;
  progressionLoading: boolean;
  rewards: {
    actions: {
      applyCompletionRewards: () => Promise<void>;
      applyChestRewards: (input: { sessionId: string; rewards: any[] }) => Promise<void>;
    };
    rewardCreditError: string | null;
    rewardCreditStatus:
      | 'crediting'
      | 'failed'
      | 'idle'
      | 'retrying'
      | 'success';
  };
  setMasteryState: React.Dispatch<React.SetStateAction<MasteryState | null>>;
  studyProgress: StudyProgressCardData | null;
  summary: SessionSummary;
  masteryState: MasteryState | null;
  nextActionLabel: string | null;
  policy: CompletionExperiencePolicy;
  userId: string;
  onStartNewSession: () => void;
};

export function SessionCompletionRewardsSection({
  consequences,
  hiddenSurfaces,
  levelMetric,
  masteryState,
  nextActionLabel,
  policy,
  progressionError,
  progressionLoading,
  rewards,
  setMasteryState,
  studyProgress,
  summary,
  userId,
  onStartNewSession,
}: SessionCompletionRewardsSectionProps) {
  return (
    <Animated.View entering={FadeInUp.duration(420)}>
      <Box px={6} pt={7}>
        {rewards.rewardCreditStatus === 'failed' ? (
          <Box mb={4}>
            <Banner
              title="Rewards couldn't save right now - we'll retry automatically"
              variant="warning"
              actionText="Retry"
              onAction={() => rewards.actions.applyCompletionRewards()}
            />
          </Box>
        ) : rewards.rewardCreditStatus === 'crediting' ||
          rewards.rewardCreditStatus === 'retrying' ? (
          <Box mb={4}>
            <Banner
              title="Saving rewards"
              description={
                rewards.rewardCreditStatus === 'retrying'
                  ? 'We are retrying the reward sync in the background.'
                  : 'Your XP and streak updates are being locked in.'
              }
              variant="info"
            />
          </Box>
        ) : null}

        <SessionProgressionCard
          isRewardSyncing={
            rewards.rewardCreditStatus === 'crediting' ||
            rewards.rewardCreditStatus === 'retrying' ||
            progressionLoading
          }
          levelMetric={progressionError ? null : levelMetric}
          rewardCreditStatus={rewards.rewardCreditStatus}
          rewardError={rewards.rewardCreditError}
          streakIncreased={summary.streakIncreased}
          streakLabel={`${summary.streakDays} Day Streak`}
          studyProgress={null}
          onRetryRewards={() => rewards.actions.applyCompletionRewards()}
          onStartNewSession={onStartNewSession}
        />

        <SessionAdaptivePayoffCard
          consequences={consequences}
          nextActionLabel={nextActionLabel}
          policy={policy}
          studyProgress={studyProgress}
          summary={summary}
        />

        {masteryState && !hiddenSurfaces.includes('mastery_card') ? (
          <Animated.View entering={FadeInUp.delay(500).duration(420)}>
            <Box pt={5}>
              <MasteryCard
                userId={userId}
                state={masteryState}
                onStateChange={setMasteryState}
              />
            </Box>
          </Animated.View>
        ) : null}
      </Box>
    </Animated.View>
  );
}
