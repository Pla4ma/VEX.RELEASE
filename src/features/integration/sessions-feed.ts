/**
 * Sessions Cross-System Integration
 * Wires completed sessions to rewards, progression, streaks, analytics, social, and challenges
 */

import { eventBus } from '../../events/EventBus';
import { captureSilentFailure } from '../../utils/silent-failure';
import { addXpEnhanced } from '../progression/service-xp-core';
import { createReward } from '../rewards/service';
import { recordSession } from '../streaks/service';
import * as Sentry from '@sentry/react-native';

/**
 * Initialize sessions cross-system integration
 * This is the central hub that distributes session completion events
 */
export function initializeSessionsFeedIntegration(): () => void {
  const unsubscribeSessionComplete = eventBus.subscribe(
    'sessions:completed',
    async (event) => {
      if (!event || !event.userId || !event.sessionId) {
        return;
      }

      const startTime = Date.now();
      const {
        userId,
        sessionId,
        duration,
        qualityScore = 0,
        streakDays = 0,
        bossActive = false,
        perfectSession = false,
      } = event;

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
              bossActive,
              perfectSession,
            },
          },
          { skipEvents: false },
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
      } catch (error) {
        Sentry.captureException(error, {
          tags: { operation: 'sessions:integration', sessionId },
          extra: { userId, duration, qualityScore },
        });
      }
    },
  );

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
  const qualityMultiplier = 0.5 + qualityScore / 200; // 0.5 to 1.0
  return Math.floor(baseXp * qualityMultiplier);
}

interface SessionRewardsContext {
  duration: number;
  qualityScore: number;
  streakDays: number;
  perfectSession: boolean;
  streakResult: {
    action: string;
    milestoneReached: { days: number; rewardType: string } | null;
  };
}

async function createSessionRewards(
  userId: string,
  context: SessionRewardsContext,
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
    }).catch((error: unknown) => {
      captureSilentFailure(error, { feature: 'integration', operation: 'createDurationReward', type: 'data' });
      return null;
    });
    if (reward) {
      rewardIds.push(reward.id);
    }
  }

  // Streak milestone rewards are handled by streaks-rewards integration

  return rewardIds;
}
