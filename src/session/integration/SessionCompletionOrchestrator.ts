import { z } from 'zod';

import { eventBus } from '../../events';
import { getProgressionService } from '../../progression/ProgressionService';
import { getRewardService } from '../../rewards/RewardService';
import { getSessionRepository } from '../repository/SessionRepository';
import { SessionSummarySchema } from '../types';
import { getStreakService } from '../../streaks/StreakService';
import { createDebugger } from '../../utils/debug';
import {
  fetchUserActiveChallenges,
  fetchChallengeById,
} from '../../features/challenges/repository';
import { updateChallengeProgress } from '../../features/challenges/service';
import { addSeasonXP } from '../../features/seasons/service';
import { getUserSquads } from '../../features/squads/service';
import { calculateBossDamage } from './SessionBossIntegration';
import { evaluateInterventions } from '../../features/ai-coach/service';
import { getCompanionBonus } from '../../features/companion/service';
import { FocusIdentityService } from '../../features/focus-identity/FocusIdentityEngine';
import { scheduleStreakProtectionNotification } from '../../features/notifications/retention-strategy';
// Note: Social feed integration removed for simplified launch
import { buildSessionProgressAward } from './session-progression-award';

const debug = createDebugger('session:completion-orchestrator');

function toError(error: unknown): Error {
  return error instanceof Error ? error : new Error(String(error));
}

const SessionCompletedEventSchema = z.object({
  sessionId: z.string(),
  userId: z.string(),
  summary: SessionSummarySchema.extend({
    metadata: z
      .object({
        duelId: z.string().uuid().optional(),
      })
      .passthrough()
      .optional(),
  }).passthrough(),
});

let initialized = false;

async function checkChallengeProgress(
  userId: string,
  duration: number,
  score: number,
  streak: number,
  hasSquad: boolean,
): Promise<void> {
  const userChallenges = await fetchUserActiveChallenges(userId);

  for (const userChallenge of userChallenges) {
    const challenge = await fetchChallengeById(userChallenge.challengeId);
    if (!challenge || userChallenge.status !== 'ACTIVE') {
      continue;
    }

    let delta = 0;
    if (challenge.category === 'SESSIONS') {delta = 1;}
    if (challenge.category === 'MINUTES')
      {delta = Math.max(1, Math.floor(duration / 60000));}
    if (challenge.category === 'STREAK') {delta = streak > 0 ? 1 : 0;}
    if (challenge.category === 'SQUAD_ACTIVITY') {delta = hasSquad ? 1 : 0;}

    if (delta <= 0) {
      continue;
    }

    await updateChallengeProgress({
      userId,
      challengeId: challenge.id,
      delta,
      source: 'SESSION_COMPLETE',
      metadata: { duration, score, streak },
    });
  }
}

async function awardSeasonXP(userId: string, amount: number): Promise<void> {
  if (amount <= 0) {
    return;
  }

  await addSeasonXP(userId, amount, 'SESSION_COMPLETE');
}

export function initializeSessionCompletionOrchestrator(): void {
  if (initialized) {
    return;
  }

  initialized = true;

  eventBus.subscribe('session:completed', async (rawEvent) => {
    const parsed = SessionCompletedEventSchema.safeParse(rawEvent);
    if (!parsed.success) {
      debug.warn(
        'Skipping session completion orchestration because the payload was invalid',
      );
      return;
    }

    const { sessionId, userId, summary } = parsed.data;
    const companionBonus = await getCompanionBonus(userId).catch(() => ({
      xpMultiplier: 1,
      coinMultiplier: 1,
      streakProtection: false,
      mood: 'neutral' as const,
    }));
    const seasonXP = Math.min(
      90,
      Math.floor(summary.effectiveDuration / 1000 / 60),
    );
    await getSessionRepository(userId).getSessionById(sessionId);
    const squadId: string | null = null;
    const bossDamage = calculateBossDamage(summary);
    let newStreak = summary.streakDays ?? 0;
    const finalScore = summary.finalScore ?? 0;
    let sessionXpEarned = Math.max(
      1,
      Math.floor(summary.effectiveDuration / 60000) * 25 + finalScore,
    );

    try {
      const streakState = await getStreakService(userId).recordSession();
      newStreak = streakState.currentStreak;
      await scheduleStreakProtectionNotification(
        userId,
        newStreak,
        Date.now(),
      );
    } catch (error) {
      debug.error(
        'Failed to record streak or streak protection for session completion',
        toError(error),
      );
    }

    try {
      const sessionProgress = buildSessionProgressAward({
        companionXpMultiplier: companionBonus.xpMultiplier,
        newStreakDays: newStreak,
        sessionId,
        summary,
        userId,
      });
      sessionXpEarned = sessionProgress.amount;
      await getProgressionService(userId).addXP(
        sessionProgress.amount,
        'SESSION_COMPLETE',
        {
          metadata: sessionProgress.metadata,
          sessionId: sessionProgress.sessionId,
        },
      );
    } catch (error) {
      debug.error(
        'Failed to add progression XP for session completion',
        toError(error),
      );
    }

    try {
      await getRewardService(userId).grantReward(
        'CURRENCY',
        'SESSION_COMPLETE',
        { baseAmount: 1, streakMultiplier: newStreak > 7 ? 1.5 : 1 },
        {
          exactAmount: newStreak > 7 ? 2 : 1,
          streakMultiplier: newStreak > 7 ? 1.5 : 1,
        },
      );
    } catch (error) {
      debug.error('Failed to grant completion currency reward', toError(error));
    }

    // Note: Duel integration removed for simplified launch
    debug.info('Duel integration skipped - feature removed for launch');

    try {
      await checkChallengeProgress(
        userId,
        summary.effectiveDuration,
        finalScore,
        newStreak,
        Boolean(squadId),
      );
    } catch (error) {
      debug.error(
        'Failed to check challenge progress for session completion',
        toError(error),
      );
    }

    try {
      const { recordSessionMasteryProgress } = await import(
        '../../features/mastery/service'
      );
      await recordSessionMasteryProgress(userId, {
        effectiveDuration: summary.effectiveDuration,
        focusQuality: summary.focusQuality ?? 0,
        purityScore: summary.focusPurityScore ?? summary.focusQuality ?? 0,
        streak: newStreak,
        hasBossActive: bossDamage > 0,
      });
    } catch (error) {
      debug.error(
        'Failed to record mastery progress for session completion',
        toError(error),
      );
    }

    try {
      await awardSeasonXP(userId, seasonXP);
    } catch (error) {
      debug.error(
        'Failed to add season XP for session completion',
        toError(error),
      );
    }

    try {
      // Only record war damage if boss damage was calculated (implies session was valid)
      if (bossDamage > 0) {
        // Get squads where user is an active member
        const userSquads = await getUserSquads(userId);
        const activeMemberSquadIds = userSquads
          .filter((squad) => squad.isMember)
          .map((squad) => squad.id);

        const candidateSquadIds = squadId
          ? [squadId].filter((id) => activeMemberSquadIds.includes(id))
          : activeMemberSquadIds;

        // Note: Squad Wars integration removed for simplified launch
        for (const _candidateSquadId of candidateSquadIds) {
          // Squad wars feature removed - boss damage applies to personal boss only
          debug.info('Squad war damage skipped - feature removed for launch');
          break;
        }
      }
    } catch (error) {
      debug.error(
        'Failed to record squad war damage for session completion',
        toError(error),
      );
    }

    try {
      if (squadId) {
        eventBus.publish('squad:activity', {
          squadId,
          userId,
          activityType: 'focus_session',
          data: {
            duration: summary.effectiveDuration,
            xpEarned: sessionXpEarned,
          },
        });
      } else if ((await getUserSquads(userId)).length > 0) {
        debug.debug(
          'User has squads but no squad context on session %s',
          sessionId,
        );
      }
    } catch (error) {
      debug.error(
        'Failed to record squad member activity for session completion',
        toError(error),
      );
    }

    try {
      eventBus.publish('social:activity-created', {
        userId,
        activityType: 'session_complete',
        data: {
          duration: summary.effectiveDuration,
          score: finalScore,
          streak: newStreak,
          visibility: 'FRIENDS',
        },
      });
    } catch (error) {
      debug.error(
        'Failed to emit social activity for session completion',
        toError(error),
      );
    }

    // Note: Social feed integration removed for simplified launch
    debug.info('Social feed post skipped - feature removed for launch');

    try {
      await evaluateInterventions(userId, 'SESSION_COMPLETE', {
        score: finalScore,
        streak: newStreak,
        isFirstToday: (summary.streakDays ?? 0) <= 1 || summary.streakMaintained,
      });
    } catch (error) {
      debug.error(
        'Failed to evaluate AI coach interventions after session completion',
        toError(error),
      );
    }

    // Update Focus Identity Score
    try {
      const identityService = new FocusIdentityService(userId);
      const wasPerfect = summary.pauses === 0 && summary.interruptions === 0;
      const eventType = wasPerfect ? 'PERFECT_SESSION' : 'SESSION_COMPLETE';
      await identityService.updateScore(eventType, {
        grade: finalScore >= 90 ? 'S' : finalScore >= 75 ? 'A' : finalScore >= 60 ? 'B' : finalScore >= 40 ? 'C' : 'D',
        streakLength: newStreak,
      });
      debug.info('Focus Identity Score updated for user %s', userId);
    } catch (error) {
      debug.error(
        'Failed to update Focus Identity Score after session completion',
        toError(error),
      );
    }
  });
}
