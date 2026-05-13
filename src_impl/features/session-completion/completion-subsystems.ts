import * as Sentry from '@sentry/react-native';
import { getProgressionService } from '../../progression/ProgressionService';
import { getRewardService } from '../../rewards/RewardService';
import type { SessionSummary } from '../../session/types';
import { getStreakService } from '../../streaks/StreakService';
import { getCompanionService } from '../companion/service';
import { FocusIdentityService } from '../focus-identity/FocusIdentityEngine';
import { fetchProgressionEnhanced } from '../progression/repository/enhanced';
import { trackCompletionAnalytics } from './completion-analytics-subsystem';
import {
  getJourneyCrossingReward,
  getJourneyReturnHook,
  getJourneyState,
} from './journey-ladder';
import { CompletionLedgerSchema, type CompletionLedger } from './schemas';
import { rollSessionVariableReward } from './variable-reward-integration';

type CompletionSubsystemInput = {
  ledger: CompletionLedger;
  summary: SessionSummary;
};

type CompletionSubsystemResult = {
  degradedSystems: string[];
  ledger: CompletionLedger;
};

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

function withDegradedSystems(ledger: CompletionLedger, degradedSystems: string[]): CompletionLedger {
  return CompletionLedgerSchema.parse({
    ...ledger,
    degradedSystems: Array.from(new Set([...ledger.degradedSystems, ...degradedSystems])),
  });
}

export async function applyCompletionSubsystems(
  input: CompletionSubsystemInput,
): Promise<CompletionSubsystemResult> {
  const degradedSystems: string[] = [];
  let ledger = input.ledger;
  const previousProgression = await fetchProgressionEnhanced(input.ledger.userId);

  await runSubsystem(degradedSystems, 'focus-identity', async () => {
    const service = new FocusIdentityService(input.ledger.userId);
    await service.updateScore('SESSION_COMPLETE', {
      grade: input.ledger.grade,
      streakLength: input.ledger.streakResult.newDays,
    });
  });

  await runSubsystem(degradedSystems, 'streak', async () => {
    const result = await getStreakService(input.ledger.userId).recordSession();
    ledger = CompletionLedgerSchema.parse({
      ...ledger,
      streakResult: {
        action:
          result.currentStreak > input.ledger.streakResult.previousDays ? 'extended' : 'maintained',
        newDays: result.currentStreak,
        previousDays: input.ledger.streakResult.previousDays,
      },
    });
  });

  await runSubsystem(degradedSystems, 'progression', async () => {
    const variableReward = rollSessionVariableReward({
      baseCoins: rewardAmountFor(ledger),
      grade: ledger.grade,
      isPremium: false,
      sessionId: ledger.sessionId,
      streakDays: ledger.streakResult.newDays,
      userId: ledger.userId,
    });
    const totalXpDelta = input.ledger.xpDelta + variableReward.xpBonus;

    await getProgressionService(input.ledger.userId).addXP(totalXpDelta, 'SESSION_COMPLETE', {
      sessionId: input.ledger.sessionId,
    });
    ledger = CompletionLedgerSchema.parse({
      ...ledger,
      variableRewardNearMiss: variableReward.isNearMiss,
      variableRewardTier: variableReward.tier,
      xpDelta: totalXpDelta,
    });
  });

  await runSubsystem(degradedSystems, 'rewards', async () => {
    const rewardAmount = rewardAmountFor(input.ledger);
    const variableReward = rollSessionVariableReward({
      baseCoins: rewardAmount,
      grade: ledger.grade,
      isPremium: false,
      sessionId: ledger.sessionId,
      streakDays: ledger.streakResult.newDays,
      userId: ledger.userId,
    });
    const totalCoins = rewardAmount + variableReward.coinBonus;
    await getRewardService(input.ledger.userId).grantReward(
      'CURRENCY',
      'SESSION_COMPLETE',
      { baseAmount: totalCoins },
      { exactAmount: totalCoins, sessionId: input.ledger.sessionId },
    );

    const nextProgression = await fetchProgressionEnhanced(input.ledger.userId);
    const previousTotalXp = previousProgression.data?.totalXp ?? 0;
    const nextTotalXp = nextProgression.data?.totalXp ?? previousTotalXp;
    const journeyState = getJourneyState(nextTotalXp);
    const journeyRewardId = getJourneyCrossingReward(previousTotalXp, nextTotalXp);

    ledger = CompletionLedgerSchema.parse({
      ...ledger,
      journeyChapter: journeyState.chapter,
      journeyNearMiss: journeyState.isNearMilestone,
      journeyProgressPercent: journeyState.progressPercent,
      journeyRung: journeyState.rung,
      journeyRungLabel: journeyState.rungLabel,
      rewardIds: [
        `session-currency:${input.ledger.sessionId}`,
        ...(variableReward.rewardId ? [variableReward.rewardId] : []),
        ...(journeyRewardId ? [journeyRewardId] : []),
      ],
    });

    if (journeyRewardId) {
      Sentry.addBreadcrumb({
        category: 'journey-ladder',
        level: 'info',
        message: getJourneyReturnHook(journeyState),
      });
    }
  });

  await runSubsystem(degradedSystems, 'companion', async () => {
    const minutes = Math.max(1, Math.round(input.ledger.effectiveFocusedSeconds / 60));
    const result = getCompanionService().completeSession(minutes, input.ledger.qualityScore);
    ledger = CompletionLedgerSchema.parse({
      ...ledger,
      companionReactionId: result.evolved
        ? `companion-evolved:${result.newPhase ?? 'unknown'}`
        : 'companion-session-complete',
    });
  });

  await runSubsystem(degradedSystems, 'daily-mission', async () => {
    ledger = CompletionLedgerSchema.parse({
      ...ledger,
      dailyMissionResult: {
        missionId: 'daily-focus-session',
        progressDelta: input.summary.actualDuration > 0 ? 1 : 0,
        status: input.summary.actualDuration > 0 ? 'progressed' : 'unchanged',
      },
    });
  });

  await runSubsystem(degradedSystems, 'analytics', async () => {
    trackCompletionAnalytics({ ledger: input.ledger, summary: input.summary });
  });

  return {
    degradedSystems,
    ledger: withDegradedSystems(ledger, degradedSystems),
  };
}
