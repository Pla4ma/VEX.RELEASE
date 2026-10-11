import * as Sentry from '@sentry/react-native';

import type { SessionSummary } from '../../session/types';
import { updateFocusScoreFromSessionCompletion } from '../../features/focus-identity/update-focus-score.helper';
import { getProgressionService } from '../../progression/ProgressionService';
import { getRewardService } from '../../rewards/RewardService';
import { getStreakService } from '../../streaks/StreakService';
import { getCompanionService } from '../companion/service';
import { trackCompletionAnalytics } from './completion-analytics';
import { getAvailabilityFor } from '../liveops-config/feature-access-store';
import type { CompletionLedger } from './schemas';

export type CompletionSubsystemResult = {
  degradedSystems: string[];
  ledger: CompletionLedger;
};

export async function applyCompletionSubsystems(input: {
  ledger: CompletionLedger;
  summary: SessionSummary;
  repair?: boolean;
}): Promise<CompletionSubsystemResult> {
  const degradedSystems = [...input.ledger.degradedSystems];
  const shouldRun = (name: string): boolean => {
    if (input.repair && !input.ledger.degradedSystems.includes(name)) { return false; }
    const index = degradedSystems.indexOf(name);
    if (index >= 0) { degradedSystems.splice(index, 1); }
    return true;
  };

  // 1. Focus Identity — update focus score
  if (shouldRun('focus-identity')) { await runSubsystem('focus-identity', degradedSystems, () =>
    updateFocusScoreFromSessionCompletion(input.ledger.userId, {
      grade: input.ledger.grade,
      quality: input.ledger.qualityScore,
      sessionId: input.ledger.sessionId,
    }),
  );

  }

  // 2. Streak — record session
  let streakResult = input.ledger.streakResult;
  if (shouldRun('streak')) { try {
    const streakService = getStreakService(input.ledger.userId);
    const result = await streakService.recordSession({
      completedAt: input.ledger.completedAt,
      duration: input.ledger.completedDurationSeconds,
      idempotencyKey: `${input.ledger.idempotencyKey}:streak`,
      qualityScore: input.ledger.qualityScore,
      sessionId: input.ledger.sessionId,
    });
    streakResult = {
      ...streakResult,
      newDays: result.currentStreak,
    };
  } catch (error: unknown) {
    degradedSystems.push('streak');
    Sentry.captureException(error, {
      tags: { feature: 'session-completion', subsystem: 'streak' },
    });
  }

  }

  // 3. Progression — award XP (ProgressionService owns XP mutation)
  if (shouldRun('progression')) { await runSubsystem('progression', degradedSystems, () =>
    getProgressionService(input.ledger.userId).addXP(
      input.ledger.xpDelta,
      'SESSION_COMPLETE',
      {
        idempotencyKey: `${input.ledger.idempotencyKey}:xp`,
        sessionId: input.ledger.sessionId,
      },
    ),
  );

  }

  // 4. Rewards — receipt-only (not a second XP mutation)
  const rewardIds = [...input.ledger.rewardIds];
  if (shouldRun('rewards')) { try {
    const rewardService = getRewardService(input.ledger.userId);
    await rewardService.grantReward(
      'XP',
      'SESSION_COMPLETE',
      { baseAmount: input.ledger.xpDelta },
      {
        idempotencyKey: `${input.ledger.idempotencyKey}:reward`,
        sessionId: input.ledger.sessionId,
      },
    );
    const receiptId = `session-xp:${input.ledger.sessionId}`;
    if (!rewardIds.includes(receiptId)) { rewardIds.push(receiptId); }
  } catch (error: unknown) {
    degradedSystems.push('rewards');
    Sentry.captureException(error, {
      tags: { feature: 'session-completion', subsystem: 'rewards' },
    });
  }

  }

  // 5. Companion — react to session completion
  let companionReactionId = input.ledger.companionReactionId;
  let dailyMissionStatus = input.ledger.dailyMissionResult.status;
  const companionAvailability = getAvailabilityFor('companion_detail');
  if (!input.repair && companionAvailability.canUseBackend) {
    try {
      const companionResult = getCompanionService().completeSession(
        Math.round(input.ledger.completedDurationSeconds / 60),
        input.ledger.qualityScore,
        input.ledger.userId,
        input.ledger.sessionId,
      );
      if (companionResult.evolved || companionResult.leveledUp) {
        companionReactionId = 'companion-session-complete';
      }
      dailyMissionStatus = 'progressed';
    } catch (error: unknown) {
      degradedSystems.push('companion');
      Sentry.captureException(error, {
        tags: { feature: 'session-completion', subsystem: 'companion' },
      });
    }
  }

  if (!input.repair) { Sentry.addBreadcrumb({
    category: 'session-completion',
    message: 'vex_session_completed',
    data: { sessionId: input.ledger.sessionId },
  });

  trackCompletionAnalytics({
    grade: input.ledger.grade,
    sessionId: input.ledger.sessionId,
    xpDelta: input.ledger.xpDelta,
  });

  }

  return {
    degradedSystems,
    ledger: {
      ...input.ledger,
      companionReactionId,
      dailyMissionResult: {
        ...input.ledger.dailyMissionResult,
        status: dailyMissionStatus,
      },
      degradedSystems,
      rewardIds,
      streakResult,
    },
  };
}

async function runSubsystem(
  name: string,
  degradedSystems: string[],
  operation: () => Promise<unknown>,
): Promise<void> {
  try {
    await operation();
  } catch (error: unknown) {
    degradedSystems.push(name);
    Sentry.captureException(error, {
      tags: { feature: 'session-completion', subsystem: name },
    });
  }
}
