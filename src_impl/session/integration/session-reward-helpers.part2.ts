import { BonusCalculator } from "../engines/scoring/BonusCalculator";
import { getSessionModeConfig, getRecoveryChainMultiplier, resolveSessionMode, SessionMode } from "../modes";
import { eventBus } from "../../events";
import { buildDailyModifierSummary, getDailyCoinMultiplier } from "../../features/live-ops/daily-modifiers";
import type { RewardCalculationResult } from "./session-reward-types";
import type { SessionSummary } from "../../session/types";


export function publishSocialActivity(userId: string, summary: SessionSummary, rewards: RewardCalculationResult): void {
  const activityId = `activity_${Date.now()}_${userId}`;
  eventBus.publish('social:activity-created', {
    userId,
    activityType: 'SESSION_COMPLETE',
    data: {
      id: activityId,
      content: `Completed a ${Math.floor(summary.actualDuration / 60000)} minute focus session and earned ${rewards.totalXP} XP!`,
      timestamp: Date.now(),
      totalXp: rewards.totalXP,
      durationMinutes: Math.floor(summary.actualDuration / 60000),
    },
  });
  rewards.socialActivityId = activityId;
}

export function publishChallengeProgress(userId: string, summary: SessionSummary, rewards: RewardCalculationResult): void {
  eventBus.publish('challenge:progress', { userId, challengeId: 'daily_focus_time', progress: summary.effectiveDuration, target: 3600000, percent: (summary.effectiveDuration / 3600000) * 100 });
  rewards.challengesProgressed = [{ challengeId: 'daily_focus_time', progress: summary.effectiveDuration }];
  if (rewards.streakIncreased) {
    eventBus.publish('challenge:progress', { userId, challengeId: 'maintain_streak', progress: rewards.streakDays + 1, target: 7, percent: ((rewards.streakDays + 1) / 7) * 100 });
  }
  if (summary.interruptions === 0 && summary.pauses === 0) {
    eventBus.publish('challenge:progress', { userId, challengeId: 'perfect_sessions', progress: 1, target: 10, percent: 10 });
  }
}

export function publishAchievements(userId: string, summary: SessionSummary, rewards: RewardCalculationResult): void {
  if (summary.completionPercentage >= 100) {
    rewards.achievementsUnlocked.push('first_complete_session');
    eventBus.publish('achievement:unlock', { achievementId: 'first_complete_session', userId });
  }
  if (rewards.streakDays >= 7) {
    rewards.achievementsUnlocked.push('week_warrior');
    eventBus.publish('achievements:unlock_badge', { userId, badgeId: 'week_warrior', rarity: 'silver' });
  }
  if (summary.interruptions === 0 && summary.pauses === 0) {
    rewards.achievementsUnlocked.push('laser_focus');
  }
}

export function publishMilestones(userId: string, summary: SessionSummary, rewards: RewardCalculationResult): void {
  const totalFocusHours = Math.floor(summary.effectiveDuration / 3600000);
  if (totalFocusHours >= 100) {
    rewards.milestoneReached = '100_hours_focused';
    eventBus.publish('session:analytics:milestone', { sessionId: '', userId, milestone: '100_hours_focused', value: totalFocusHours, timestamp: Date.now() });
  }
}