import { getStreakSummary } from "../../features/streaks/service";
import { eventBus } from "../../events";
import { createDebugger } from "../../utils/debug";
import type { SessionSummary } from "../types";
import type { RewardIntegrationConfig } from "./SessionRewardIntegration";
import {
  advanceRestoreQuest,
  handleAbandonment,
  handlePartialCompletion,
} from "./session-reward-recovery";
export {
  handleAbandonment,
  handlePartialCompletion,
} from "./session-reward-recovery";
import {
  calculateRewards,
  grantRewards,
  publishAchievements,
  publishAnalytics,
  publishChallengeProgress,
  publishMilestones,
  publishSocialActivity,
  publishXp,
  recordSquadWarDamageIfNeeded,
  type RewardCalculationResult,
  updateStreak,
} from "./session-reward-helpers";

const debug = createDebugger("session:reward-handlers");

export function isFullyDisabled(config: RewardIntegrationConfig): boolean {
  return (
    !config.autoGrantRewards &&
    !config.autoUpdateStreak &&
    !config.autoAddXP &&
    !config.autoCreateSocialActivity &&
    !config.enableSeasonChallengeProgress &&
    !config.autoUpdateAnalytics &&
    !config.enableAchievementChecks &&
    !config.enableMilestoneTracking &&
    !config.autoHandleRecoveryRewards &&
    !config.autoHandleAbandonmentPartialCredit
  );
}

export function hasCompletionSideEffects(
  config: RewardIntegrationConfig,
): boolean {
  return (
    config.autoGrantRewards ||
    config.autoUpdateStreak ||
    config.autoAddXP ||
    config.autoCreateSocialActivity ||
    config.enableSeasonChallengeProgress ||
    config.autoUpdateAnalytics ||
    config.enableAchievementChecks ||
    config.enableMilestoneTracking
  );
}

export async function handleSessionCompleted(
  config: RewardIntegrationConfig,
  sessionId: string,
  userId: string,
  sessionData: SessionSummary,
): Promise<void> {
  if (isFullyDisabled(config)) {
    debug.debug(
      "SessionRewardIntegration: all side effects delegated — skipping session %s",
      sessionId,
    );
    return;
  }

  debug.info("Processing rewards for completed session %s", sessionId);
  const summary: SessionSummary = { ...sessionData, sessionId, userId };

  const rewards = calculateRewards(await fetchUserStreak(userId), summary);

  if (config.autoGrantRewards) {
    grantRewards(userId, rewards);
  }
  if (config.autoCreateSocialActivity) {
    await tryRecordSquadDamage(sessionId, userId, summary, rewards);
  }
  const { streakIncreased } = config.autoUpdateStreak
    ? updateStreak(userId, summary, rewards)
    : { streakIncreased: false };
  if (config.autoAddXP) {
    await addSessionXpInternal(userId, rewards.totalXP);
  }
  if (config.autoUpdateStreak) {
    await advanceRestoreQuest(userId, sessionId);
  }
  if (config.autoUpdateAnalytics) {
    publishAnalytics(userId, summary, rewards);
  }
  if (config.autoCreateSocialActivity) {
    publishSocialActivity(userId, summary, rewards);
  }
  const { challengesProgressed } = config.enableSeasonChallengeProgress
    ? publishChallengeProgress(userId, summary, { ...rewards, streakIncreased })
    : { challengesProgressed: [] };
  const { achievementsUnlocked } = config.enableAchievementChecks
    ? publishAchievements(userId, summary, rewards)
    : { achievementsUnlocked: [] };
  const { milestoneReached } = config.enableMilestoneTracking
    ? publishMilestones(userId, summary, rewards)
    : { milestoneReached: null };

  const shouldPublishRewards =
    config.autoGrantRewards || config.autoUpdateStreak || config.autoAddXP;
  if (shouldPublishRewards) {
    eventBus.publish("session:rewards:calculated", {
      sessionId,
      userId,
      rewards: {
        xp: rewards.totalXP,
        coins: rewards.totalCoins,
        gems: rewards.totalGems,
        bonuses: achievementsUnlocked,
      },
      challengesProgressed,
      milestoneReached,
      timestamp: Date.now(),
    });
  }
}

async function addSessionXpInternal(
  userId: string,
  totalXp: number,
): Promise<void> {
  publishXp(userId, totalXp, "session_completion");
  await Promise.resolve();
}

async function tryRecordSquadDamage(
  sessionId: string,
  userId: string,
  summary: SessionSummary,
  rewards: RewardCalculationResult,
): Promise<void> {
  try {
    await recordSquadWarDamageIfNeeded(
      sessionId,
      userId,
      summary,
      rewards.streakMultiplier,
    );
  } catch (error) {
    debug.warn("Failed to record squad war damage for session %s", sessionId);
    debug.error(
      "Squad war damage error",
      error instanceof Error ? error : new Error(String(error)),
    );
  }
}

async function fetchUserStreak(userId: string): Promise<number> {
  const summary = await getStreakSummary(userId);
  return summary?.currentDays ?? 0;
}
