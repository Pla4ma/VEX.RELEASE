import * as Sentry from '@sentry/react-native';
import { getProgressionService } from '../../progression/ProgressionService';
import { getRewardService } from '../../rewards/RewardService';
import type { SessionSummary } from '../../session/types';
import { getStreakService } from '../../streaks/StreakService';
import { getCompanionService } from '../companion/service';
import { updateFocusScoreFromSessionCompletion } from '../focus-identity/update-focus-score.helper';
import { getAvailabilityFor } from '../liveops-config/feature-access-store';
import { trackCompletionAnalytics } from './completion-analytics';
import { CompletionLedgerSchema, type CompletionLedger } from './schemas';
import { SUBSYSTEM_META, type SubsystemMeta, type SubsystemKind } from './subsystem-meta';
import { enqueue } from '../../lib/offline/queue';
import { createDebugger } from '../../utils/debug';

const debug = createDebugger('session-completion:subsystems');

type CompletionSubsystemInput = {
  ledger: CompletionLedger;
  summary: SessionSummary;
};

type CompletionSubsystemResult = {
  degradedSystems: string[];
  ledger: CompletionLedger;
};

export { SUBSYSTEM_META };
export type { SubsystemKind, SubsystemMeta };

function subsystemShouldRun(meta: SubsystemMeta): boolean {
  if (meta.kind === 'CORE_REQUIRED' || meta.kind === 'REQUIRED' || meta.kind === 'ANALYTICS_ONLY') {
    return true;
  }
  if (meta.kind === 'FEATURE_DEPENDENT' && meta.featureKey) {
    return getAvailabilityFor(meta.featureKey).canSubscribeToEvents;
  }
  return false;
}

function rewardAmountFor(ledger: CompletionLedger): number {
  return Math.max(1, Math.floor(ledger.xpDelta / 10));
}

async function runSubsystem(
  degradedSystems: string[],
  label: string,
  fn: () => Promise<void>,
): Promise<void> {
  try {
    await fn();
  } catch (error) {
    degradedSystems.push(label);
    Sentry.captureException(error, {
      tags: { feature: 'session-completion', subsystem: label },
    });
  }
}

function withDegradedSystems(
  ledger: CompletionLedger,
  degradedSystems: string[],
): CompletionLedger {
  return CompletionLedgerSchema.parse({
    ...ledger,
    degradedSystems: Array.from(
      new Set([...ledger.degradedSystems, ...degradedSystems]),
    ),
  });
}

export async function applyCompletionSubsystems(
  input: CompletionSubsystemInput,
): Promise<CompletionSubsystemResult> {
  const degradedSystems: string[] = [];
  let ledger = input.ledger;

  await runSubsystem(degradedSystems, 'focus-identity', async () => {
    await updateFocusScoreFromSessionCompletion(input.ledger.userId, {
      grade: input.ledger.grade,
      streakDays: input.ledger.streakResult.newDays,
      quality: input.ledger.qualityScore,
      interruptions: input.summary.interruptions,
      sessionMode: input.summary.sessionMode,
      completedAt: new Date(input.ledger.completedAt).toISOString(),
    });
  });

  await runSubsystem(degradedSystems, 'streak', async () => {
    try {
      const result = await getStreakService(input.ledger.userId).recordSession();
      ledger = CompletionLedgerSchema.parse({
        ...ledger,
        streakResult: {
          action:
            result.currentStreak > input.ledger.streakResult.previousDays
              ? 'extended'
              : 'maintained',
          newDays: result.currentStreak,
          previousDays: input.ledger.streakResult.previousDays,
        },
      });
    } catch (error) {
      enqueue({
        feature: 'streaks',
        idempotencyKey: `streak-record:${input.ledger.sessionId}`,
        operation: 'STREAK_RECORD',
        payload: {
          userId: input.ledger.userId,
          sessionId: input.ledger.sessionId,
          completedAt: input.ledger.completedAt,
        },
        priority: 'high',
      });
      debug.warn('Streak record failed, enqueued for offline retry');
      throw error;
    }
  });

  // ProgressionService owns XP mutation — it directly increments user XP in the progression table.
  // RewardService.grantReward('XP', ...) is receipt-only — it creates a reward ledger entry for
  // display/analytics, NOT a second XP mutation. The two are complementary, not duplicative.
  await runSubsystem(degradedSystems, 'progression', async () => {
    try {
      await getProgressionService(input.ledger.userId).addXP(
        input.ledger.xpDelta,
        'SESSION_COMPLETE',
        { sessionId: input.ledger.sessionId },
      );
    } catch (error) {
      enqueue({
        feature: 'progression',
        idempotencyKey: `xp-add:${input.ledger.sessionId}`,
        operation: 'XP_ADD',
        payload: {
          userId: input.ledger.userId,
          amount: input.ledger.xpDelta,
          sessionId: input.ledger.sessionId,
        },
        priority: 'high',
      });
      debug.warn('XP grant failed, enqueued for offline retry');
      throw error;
    }
  });

  if (subsystemShouldRun(SUBSYSTEM_META.rewards!)) {
    await runSubsystem(degradedSystems, 'rewards', async () => {
      const rewardAmount = rewardAmountFor(input.ledger);
      await getRewardService(input.ledger.userId).grantReward(
        'XP',
        'SESSION_COMPLETE',
        { baseAmount: rewardAmount },
        { exactAmount: rewardAmount, sessionId: input.ledger.sessionId },
      );
      ledger = CompletionLedgerSchema.parse({
        ...ledger,
        rewardIds: [`session-xp:${input.ledger.sessionId}`],
      });
    });
  }

  if (subsystemShouldRun(SUBSYSTEM_META.companion!)) {
    await runSubsystem(degradedSystems, 'companion', async () => {
      const minutes = Math.max(
        1,
        Math.round(input.ledger.effectiveFocusedSeconds / 60),
      );
      const result = getCompanionService().completeSession(
        minutes,
        input.ledger.qualityScore,
      );
      ledger = CompletionLedgerSchema.parse({
        ...ledger,
        companionReactionId: result.evolved
          ? `companion-evolved:${result.newPhase ?? 'unknown'}`
          : 'companion-session-complete',
      });
    });
  }

  // V1 NOTE: Daily mission progress is calculated locally from session data.
  // The full mission service/repository integration is deferred until the challenges
  // feature graduates from progressive to included status.
  if (subsystemShouldRun(SUBSYSTEM_META['daily-mission']!)) {
    await runSubsystem(degradedSystems, 'daily-mission', async () => {
      const progressDelta = input.summary.actualDuration > 0 ? 1 : 0;
      ledger = CompletionLedgerSchema.parse({
        ...ledger,
        dailyMissionResult: {
          missionId: `daily-focus:${new Date(input.ledger.completedAt).toISOString().split('T')[0]}`,
          progressDelta,
          status: progressDelta > 0 ? 'progressed' : 'unchanged',
        },
      });
    });
  }

  await runSubsystem(degradedSystems, 'analytics', async () => {
    trackCompletionAnalytics(input.ledger, input.summary);
  });

  return {
    degradedSystems,
    ledger: withDegradedSystems(ledger, degradedSystems),
  };
}
