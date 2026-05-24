import React from 'react';
import Animated, { FadeInUp } from 'react-native-reanimated';

import { Banner } from '../../../components/Banner';
import { Box } from '../../../components/primitives';
import { MasteryCard } from '../../../features/mastery/components/MasteryCard';
import type { MasteryState } from '../../../features/mastery/types';
import type { SessionSummary } from '../../../session/types';
import type { StudyProgressCardData } from '../hooks/useSessionCompleteStudyProgress';
import { getSessionBattlePassXp } from '../utils/session-complete-display';
import { SessionProgressionCard } from './SessionProgressionCard';

type SessionCompletionRewardsSectionProps = {
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
      applyChestRewards: () => Promise<void>;
    };
    chestResult: {
      coinReward: number;
      xpReward: number;
    } | null;
    rewardCreditError: string | null;
    rewardCreditStatus: 'crediting' | 'failed' | 'idle' | 'retrying' | 'success';
  };
  setMasteryState: React.Dispatch<React.SetStateAction<MasteryState | null>>;
  studyProgress: StudyProgressCardData | null;
  summary: SessionSummary;
  masteryState: MasteryState | null;
  userId: string;
  onStartNewSession: () => void;
};

export function SessionCompletionRewardsSection({
  levelMetric,
  masteryState,
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
              onAction={() => void rewards.actions.applyChestRewards()}
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
                  : 'Your XP, coins, and streak updates are being locked in.'
              }
              variant="info"
            />
          </Box>
        ) : null}

        <SessionProgressionCard
          coinsEarned={rewards.chestResult?.coinReward ?? summary.coinsEarned}
          isRewardSyncing={
            rewards.rewardCreditStatus === 'crediting' ||
            rewards.rewardCreditStatus === 'retrying' ||
            progressionLoading
          }
          levelMetric={progressionError ? null : levelMetric}
          rewardCreditStatus={rewards.rewardCreditStatus}
          rewardError={rewards.rewardCreditError}
          sessionBattlePassXp={getSessionBattlePassXp(summary)}
          streakIncreased={summary.streakIncreased}
          streakLabel={`${summary.streakDays} Day Streak`}
          studyProgress={studyProgress}
          userId={userId}
          onRetryRewards={() => void rewards.actions.applyChestRewards()}
          onStartNewSession={onStartNewSession}
        />

        {masteryState ? (
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
