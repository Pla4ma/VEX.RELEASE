import * as Sentry from '@sentry/react-native';

import type { SessionSummary } from '../../session/types';
import { updateFocusScoreFromSessionCompletion } from '../../features/focus-identity/update-focus-score.helper';
import { getProgressionService } from '../../progression/ProgressionService';
import { getRewardService } from '../../rewards/RewardService';
import { getStreakService } from '../../streaks/StreakService';
import { getCompanionService } from '../../features/companion/service';
import { trackCompletionAnalytics } from './completion-analytics';
import type { CompletionLedger } from './schemas';

export type CompletionSubsystemResult = {
  degradedSystems: string[];
  ledger: CompletionLedger;
};

export async function applyCompletionSubsystems(input: {
  ledger: CompletionLedger;
  summary: SessionSummary;
}): Promise<CompletionSubsystemResult> {
  const degradedSystems: string[] = [];

  // 1. Focus Identity — update focus score
  await runSubsystem('focus-identity', degradedSystems, () =>
    updateFocusScoreFromSessionCompletion(input.ledger.userId, {
      grade: input.ledger.grade,
      quality: input.ledger.qualityScore,
      sessionId: input.ledger.sessionId,
    }),
  );

  // 2. Streak — record session
  let streakResult = input.ledger.streakResult;
  try {
    const streakService = getStreakService();
    const result = await streakService.recordSession({
      completedAt: input.ledger.completedAt,
      duration: input.ledger.completedDurationSeconds,
      idempotencyKey: input.ledger.idempotencyKey,
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

  // 3. Progression — award XP (ProgressionService owns XP mutation)
  await runSubsystem('progression', degradedSystems, () =>
    getProgressionService().addXP(
      input.ledger.xpDelta,
      'SESSION_COMPLETE',
      { sessionId: input.ledger.sessionId },
    ),
  );

  // 4. Rewards — receipt-only (not a second XP mutation)
  const rewardIds: string[] = [];
  try {
    const rewardService = getRewardService();
    await rewardService.grantReward(
      'XP',
      'SESSION_COMPLETE',
      { baseAmount: input.ledger.xpDelta },
      { sessionId: input.ledger.sessionId },
    );
    rewardIds.push(`session-xp:${input.ledger.sessionId}`);
  } catch (error: unknown) {
    degradedSystems.push('rewards');
    Sentry.captureException(error, {
      tags: { feature: 'session-completion', subsystem: 'rewards' },
    });
  }

  // 5. Companion — react to session completion
  let companionReactionId = input.ledger.companionReactionId;
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
  } catch (error: unknown) {
    degradedSystems.push('companion');
    Sentry.captureException(error, {
      tags: { feature: 'session-completion', subsystem: 'companion' },
    });
  }

  Sentry.addBreadcrumb({
    category: 'session-completion',
    message: 'vex_session_completed',
    data: { sessionId: input.ledger.sessionId },
  });

  trackCompletionAnalytics({
    grade: input.ledger.grade,
    sessionId: input.ledger.sessionId,
    xpDelta: input.ledger.xpDelta,
  });

  return {
    degradedSystems,
    ledger: {
      ...input.ledger,
      companionReactionId,
      dailyMissionResult: {
        ...input.ledger.dailyMissionResult,
        status: 'progressed',
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
