import { eventBus } from '../../../events';
import type { RewardCalculationResult } from './session-reward-types';
export type { RewardCalculationResult } from './session-reward-types';
export { calculateRewards } from './session-reward-calculation';
import type { SessionSummary } from '../../../session/types';
export function grantRewards(
  userId: string,
  rewards: RewardCalculationResult,
): void {
  eventBus.publish('session:rewards:granted', {
    sessionId: '',
    userId,
    rewards,
    timestamp: Date.now(),
  });
}
export async function recordSquadWarDamageIfNeeded(
  sessionId: string,
  userId: string,
  summary: SessionSummary,
  streakMultiplier: number,
): Promise<void> {
  sessionId;
  userId;
  summary;
  streakMultiplier;
  await Promise.resolve();
}
export function updateStreak(
  userId: string,
  summary: SessionSummary,
  rewards: Pick<RewardCalculationResult, 'streakDays'>,
): { streakIncreased: boolean } {
  if (!summary.streakMaintained) {
    eventBus.publish('streak:broken', {
      userId,
      previousStreak: rewards.streakDays,
      wasComeback: false,
    });
    return { streakIncreased: false };
  }
  const newStreak = rewards.streakDays + 1;
  eventBus.publish('streak:updated', {
    userId,
    state: { currentStreak: newStreak },
  });
  if (newStreak === 7 || newStreak === 30 || newStreak === 100) {
    eventBus.publish('social:streak_milestone', {
      userId,
      streak: newStreak,
      milestone: newStreak,
    });
  }
  return { streakIncreased: true };
}
export function publishXp(
  userId: string,
  amount: number,
  source: string,
): void {
  eventBus.publish('progression:add_xp', { userId, amount, source });
  eventBus.publish('progression:xp_added', {
    userId,
    amount,
    source,
    totalXP: 0,
    currentLevel: 0,
    progressPercent: 0,
    streakBonus: 0,
    boostBonus: 0,
  });
}
export function publishAnalytics(
  userId: string,
  summary: SessionSummary,
  rewards: RewardCalculationResult,
): void {
  eventBus.publish('analytics:track', {
    event: 'session_completed',
    properties: {
      userId,
      duration: summary.actualDuration,
      completion: summary.completionPercentage,
      xpEarned: rewards.totalXP,
      streakDays: rewards.streakDays,
      interruptions: summary.interruptions,
      pauses: summary.pauses,
    },
  });
  eventBus.publish('session:analytics:engagement', {
    sessionId: summary.sessionId,
    userId,
    metric: 'focus_time',
    value: summary.effectiveDuration,
    timestamp: Date.now(),
  });
}
export function publishSocialActivity(
  userId: string,
  summary: SessionSummary,
  rewards: RewardCalculationResult,
): void {
  userId;
  summary;
  rewards;
}
export function publishChallengeProgress(
  userId: string,
  summary: SessionSummary,
  rewards: Pick<RewardCalculationResult, 'streakDays' | 'streakIncreased'>,
): { challengesProgressed: Array<{ challengeId: string; progress: number }> } {
  const progressed: Array<{ challengeId: string; progress: number }> = [];
  eventBus.publish('challenge:progress', {
    userId,
    challengeId: 'daily_focus_time',
    progress: summary.effectiveDuration,
    target: 3600000,
    percent: (summary.effectiveDuration / 3600000) * 100,
  });
  progressed.push({
    challengeId: 'daily_focus_time',
    progress: summary.effectiveDuration,
  });
  if (rewards.streakIncreased) {
    eventBus.publish('challenge:progress', {
      userId,
      challengeId: 'maintain_streak',
      progress: rewards.streakDays + 1,
      target: 7,
      percent: ((rewards.streakDays + 1) / 7) * 100,
    });
  }
  if (summary.interruptions === 0 && summary.pauses === 0) {
    eventBus.publish('challenge:progress', {
      userId,
      challengeId: 'perfect_sessions',
      progress: 1,
      target: 10,
      percent: 10,
    });
  }
  return { challengesProgressed: progressed };
}
export function publishAchievements(
  userId: string,
  summary: SessionSummary,
  rewards: Pick<RewardCalculationResult, 'streakDays'>,
): { achievementsUnlocked: string[] } {
  const unlocked: string[] = [];
  if (summary.completionPercentage >= 100) {
    unlocked.push('first_complete_session');
    eventBus.publish('achievement:unlock', {
      achievementId: 'first_complete_session',
      userId,
    });
  }
  if (rewards.streakDays >= 7) {
    unlocked.push('week_warrior');
    eventBus.publish('achievements:unlock_badge', {
      userId,
      badgeId: 'week_warrior',
      rarity: 'silver',
    });
  }
  if (summary.interruptions === 0 && summary.pauses === 0) {
    unlocked.push('laser_focus');
  }
  return { achievementsUnlocked: unlocked };
}
export function publishMilestones(
  userId: string,
  summary: SessionSummary,
  _rewards: RewardCalculationResult,
): { milestoneReached: string | null } {
  const totalFocusHours = Math.floor(summary.effectiveDuration / 3600000);
  if (totalFocusHours >= 100) {
    eventBus.publish('session:analytics:milestone', {
      sessionId: '',
      userId,
      milestone: '100_hours_focused',
      value: totalFocusHours,
      timestamp: Date.now(),
    });
    return { milestoneReached: '100_hours_focused' };
  }
  return { milestoneReached: null };
}
