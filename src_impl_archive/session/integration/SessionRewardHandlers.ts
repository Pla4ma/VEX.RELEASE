import { addBattlePassXp } from '../../features/battle-pass/service';
import { fetchActiveSeason } from '../../features/seasons/repository';
import { clearStreakRestoreQuest, markStreakRestoreUsed, recordStreakRestoreSession } from '../../features/streaks/restore-quest';
import { getStreakSummary, restoreStreak } from '../../features/streaks/service';
import { eventBus } from '../../events';
import { createDebugger } from '../../utils/debug';
import type { SessionSummary } from '../types';
import type { RewardIntegrationConfig } from './SessionRewardIntegration';
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
} from './session-reward-helpers';

const debug = createDebugger('session:reward-handlers');

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

export function hasCompletionSideEffects(config: RewardIntegrationConfig): boolean {
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
  const allLegacySideEffectsDisabled =
    !config.autoGrantRewards &&
    !config.autoUpdateStreak &&
    !config.autoAddXP &&
    !config.autoCreateSocialActivity &&
    !config.enableSeasonChallengeProgress &&
    !config.autoUpdateAnalytics &&
    !config.enableAchievementChecks &&
    !config.enableMilestoneTracking;

  if (allLegacySideEffectsDisabled) {
    debug.debug('SessionRewardIntegration: all legacy side effects delegated — skipping session %s', sessionId);
    return;
  }

  debug.info('Processing rewards for completed session %s', sessionId);
  const summary: SessionSummary = {
    ...sessionData,
    sessionId,
    userId,
    sessionMode: sessionData.sessionMode,
    plannedDuration: sessionData.plannedDuration,
    actualDuration: sessionData.actualDuration,
    effectiveDuration: sessionData.effectiveDuration,
    completionPercentage: sessionData.completionPercentage,
    focusQuality: sessionData.focusQuality,
    focusPurityScore: sessionData.focusPurityScore,
    interruptions: sessionData.interruptions,
    pauses: sessionData.pauses,
    pausedTime: sessionData.pausedTime,
    streakMaintained: sessionData.streakMaintained,
    modeBonus: sessionData.modeBonus,
    baseScore: sessionData.baseScore,
    createdAt: sessionData.createdAt,
  };

  const rewards = calculateRewards(await fetchUserStreak(userId), summary);

  if (config.autoGrantRewards) { grantRewards(userId, rewards); }
  if (config.autoCreateSocialActivity) { await tryRecordSquadDamage(sessionId, userId, summary, rewards); }
  if (config.autoUpdateStreak) { updateStreak(userId, summary, rewards); }
  if (config.autoAddXP) { await addSessionXpInternal(userId, rewards.totalXP); }
  if (config.autoUpdateStreak) { await advanceRestoreQuestInternal(userId, sessionId); }
  if (config.autoUpdateAnalytics) { publishAnalytics(userId, summary, rewards); }
  if (config.autoCreateSocialActivity) { publishSocialActivity(userId, summary, rewards); }
  if (config.enableSeasonChallengeProgress) { publishChallengeProgress(userId, summary, rewards); }
  if (config.enableAchievementChecks) { publishAchievements(userId, summary, rewards); }
  if (config.enableMilestoneTracking) { publishMilestones(userId, summary, rewards); }

  const shouldPublishRewards = config.autoGrantRewards || config.autoUpdateStreak || config.autoAddXP;
  if (shouldPublishRewards) {
    eventBus.publish('session:rewards:calculated', {
      sessionId,
      userId,
      rewards: { xp: rewards.totalXP, coins: rewards.totalCoins, gems: rewards.totalGems, bonuses: rewards.achievementsUnlocked },
      timestamp: Date.now(),
    });
  }
}

export async function handlePartialCompletion(
  config: RewardIntegrationConfig,
  sessionId: string,
  userId: string,
  recoveredTime: number,
): Promise<void> {
  if (!config.autoHandleRecoveryRewards) {
    debug.debug('Recovery rewards disabled — skipping partial completion for session %s', sessionId);
    return;
  }
  debug.info('Processing partial completion for session %s', sessionId);
  const partialXp = Math.floor(recoveredTime / 60) * 5;
  publishXp(userId, partialXp, 'session_recovery');
  eventBus.publish('analytics:track', {
    event: 'session_partial_complete',
    properties: { userId, recoveredTime, xpEarned: partialXp },
  });
}

export async function handleAbandonment(
  config: RewardIntegrationConfig,
  sessionId: string,
  userId: string,
  elapsedTime: number,
): Promise<void> {
  if (!config.autoHandleAbandonmentPartialCredit) {
    debug.debug('Abandonment partial credit disabled — skipping for session %s', sessionId);
    return;
  }
  debug.info('Processing abandonment for session %s', sessionId);
  const partialXp = elapsedTime >= 300 ? Math.floor(elapsedTime / 60) * 3 : 0;
  if (partialXp > 0) {
    publishXp(userId, partialXp, 'session_partial_abandon');
    eventBus.publish('analytics:track', {
      event: 'session_abandon_partial_credit',
      properties: { userId, elapsedTime, xpEarned: partialXp },
    });
  }
  eventBus.publish('analytics:track', {
    event: 'session_abandoned',
    properties: { userId, elapsedTime, hadPartialCredit: partialXp > 0 },
  });
}

async function addSessionXpInternal(userId: string, totalXp: number): Promise<void> {
  publishXp(userId, totalXp, 'session_completion');
  const activeSeason = await fetchActiveSeason();
  const xpAmount = Math.floor(totalXp * 0.5);
  if (!activeSeason || xpAmount <= 0) { return; }
  await addBattlePassXp({ userId, seasonId: activeSeason.id, xpAmount, source: 'SESSION_COMPLETE' });
}

async function advanceRestoreQuestInternal(userId: string, sessionId: string): Promise<void> {
  const progress = await recordStreakRestoreSession(userId, sessionId);
  if (!progress.shouldRestore || !progress.streakBefore) { return; }
  const restored = await restoreStreak(userId, progress.streakBefore);
  if (!restored) { return; }
  await markStreakRestoreUsed(userId);
  await clearStreakRestoreQuest(userId);
}

async function tryRecordSquadDamage(
  sessionId: string,
  userId: string,
  summary: SessionSummary,
  rewards: RewardCalculationResult,
): Promise<void> {
  try {
    await recordSquadWarDamageIfNeeded(sessionId, userId, summary, rewards.streakMultiplier);
  } catch (error) {
    debug.warn('Failed to record squad war damage for session %s', sessionId);
    debug.error('Squad war damage error', error instanceof Error ? error : new Error(String(error)));
  }
}

async function fetchUserStreak(userId: string): Promise<number> {
  const summary = await getStreakSummary(userId);
  return summary?.currentDays ?? 0;
}
