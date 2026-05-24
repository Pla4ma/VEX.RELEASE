/**
 * Sessions Cross-System Integration
 * Wires completed sessions to rewards, progression, streaks, analytics, social, and challenges
 */

import { eventBus } from '../../events/EventBus';
import { addXpEnhanced } from '../progression/service-enhanced';
import { createReward } from '../rewards/service';
import { recordSession } from '../streaks/service';
import * as Sentry from '@sentry/react-native';

/**
 * Initialize sessions cross-system integration
 * This is the central hub that distributes session completion events
 */
export function initializeSessionsFeedIntegration(): () => void {
  const unsubscribeSessionComplete = eventBus.subscribe('sessions:completed', async (event) => {
    if (!event || !event.userId || !event.sessionId) {return;}

    const startTime = Date.now();
    const { userId, sessionId, duration, qualityScore = 0, streakDays = 0, squadMultiplier = 1, bossActive = false, perfectSession = false } = event;

    try {
      // 1. Update Streaks
      const streakResult = await recordSession({
        userId,
        sessionId,
        duration,
        qualityScore,
        completedAt: Date.now(),
      });

      // 2. Award XP via Progression
      const xpResult = await addXpEnhanced(
        userId,
        {
          userId,
          amount: calculateSessionXp(duration, qualityScore),
          source: 'SESSION_COMPLETE',
          sessionId,
          metadata: {
            streakDays,
            squadMultiplier,
            bossActive,
            perfectSession,
          },
        },
        { skipEvents: false }
      );

      // 3. Create Rewards for milestones
      const rewards = await createSessionRewards(userId, {
        duration,
        qualityScore,
        streakDays,
        perfectSession,
        streakResult,
      });

      // 4. Track Analytics
      Sentry.addBreadcrumb({
        category: 'sessions:integration',
        message: 'Session completed cross-system processing',
        data: {
          userId,
          sessionId,
          duration,
          xpGained: xpResult.xpAdded,
          streakAction: streakResult.action,
          rewardsCreated: rewards.length,
          processingTime: Date.now() - startTime,
        },
        level: 'info',
      });

      // 5. Publish Social Activity
      if (streakResult.milestoneReached || xpResult.levelUpOccurred) {
        eventBus.publish('social:activity', {
          userId,
          activityType: streakResult.milestoneReached ? 'STREAK_MILESTONE' : 'LEVEL_UP',
          visibility: 'FRIENDS',
          data: {
            streakDays: streakResult.newStreak,
            level: xpResult.newLevel,
            milestone: streakResult.milestoneReached,
          },
        });
      }

      // 6. Check Season Challenges
      eventBus.publish('seasons:challenge_progress', {
        userId,
        challengeId: 'session_complete',
        progress: 1,
        completed: false,
      });

      // 7. Update Leaderboards (if competitive session)
      if (event.competitiveMode && event.leaderboardId) {
        eventBus.publish('leaderboards:score_update', {
          userId,
          leaderboardId: event.leaderboardId,
          newScore: calculateLeaderboardScore(duration, qualityScore),
        });
      }

    } catch (error) {
      Sentry.captureException(error, {
        tags: { operation: 'sessions:integration', sessionId },
        extra: { userId, duration, qualityScore },
      });
    }
  });

  return () => {
    unsubscribeSessionComplete();
  };
}

// ============================================================================
// Helper Functions
// ============================================================================

function calculateSessionXp(duration: number, qualityScore: number): number {
  const baseRate = 2; // XP per minute
  const durationMinutes = duration / 60;
  const baseXp = Math.floor(durationMinutes * baseRate);
  const qualityMultiplier = 0.5 + (qualityScore / 200); // 0.5 to 1.0
  return Math.floor(baseXp * qualityMultiplier);
}

interface SessionRewardsContext {
  duration: number;
  qualityScore: number;
  streakDays: number;
  perfectSession: boolean;
  streakResult: { action: string; milestoneReached: { days: number; rewardType: string } | null };
}

async function createSessionRewards(
  userId: string,
  context: SessionRewardsContext
): Promise<string[]> {
  const rewardIds: string[] = [];

  // Duration-based rewards
  const durationMinutes = context.duration / 60;
  if (durationMinutes >= 30) {
    const reward = await createReward({
      userId,
      type: 'XP',
      amount: Math.floor(durationMinutes * 0.5),
      triggerType: 'SESSION_COMPLETE',
      triggerId: userId,
    }).catch(() => null);
    if (reward) {rewardIds.push(reward.id);}
  }

  // Quality-based rewards
  if (context.qualityScore >= 90) {
    const reward = await createReward({
      userId,
      type: 'COINS',
      amount: 50,
      triggerType: 'SESSION_COMPLETE',
      triggerId: userId,
    }).catch(() => null);
    if (reward) {rewardIds.push(reward.id);}
  }

  // Perfect session bonus
  if (context.perfectSession) {
    const reward = await createReward({
      userId,
      type: 'GEMS',
      amount: 1,
      triggerType: 'SESSION_COMPLETE',
      triggerId: userId,
      expiresAt: Date.now() + 24 * 60 * 60 * 1000,
    }).catch(() => null);
    if (reward) {rewardIds.push(reward.id);}
  }

  // Streak milestone rewards are handled by streaks-rewards integration

  return rewardIds;
}

function calculateLeaderboardScore(duration: number, qualityScore: number): number {
  const durationMinutes = duration / 60;
  return Math.floor(durationMinutes * qualityScore / 100);
}
