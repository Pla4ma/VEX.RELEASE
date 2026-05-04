import {
  SessionCompletionHeroSchema,
  SessionCompletionNavigationParamsSchema,
  SessionCompletionReturnPlanSchema,
  CompletionLedgerSchema,
  type SessionCompletionHero,
  type SessionCompletionNavigationParams,
  type SessionCompletionReturnPlan,
  type CompletionLedger,
} from './schemas';
import type { SessionSummary } from '../../types/consolidated';
import type { BossEncounter } from '../boss/schemas';
import type { StreakSummary } from '../streaks/schemas';
import type { ChallengeDetail } from '../challenges/schemas';
// TODO: Rivals feature not implemented yet
// import type { CurrentRival } from '../rivals/schemas';

/*
Dependencies: session completion route params, session summary, home highlight store
Consumers: SessionComplete screen, completion controller, follow-up UI
*/

export function parseSessionCompletionParams(input: unknown): {
  params: SessionCompletionNavigationParams | null;
  warningMessage: string | null;
} {
  const result = SessionCompletionNavigationParamsSchema.safeParse(input);

  if (result.success) {
    return {
      params: result.data,
      warningMessage: null,
    };
  }

  return {
    params: null,
    warningMessage:
      'We could not restore the finished session summary, so we sent you back to a safe exit.',
  };
}

export function buildSessionCompletionHero(input: {
  focusedDurationLabel: string;
  interruptions: number;
  streakIncreased: boolean;
}): SessionCompletionHero {
  const { focusedDurationLabel, interruptions, streakIncreased } = input;
  const title =
    interruptions === 0
      ? 'Clean finish. Rewards are landing now.'
      : streakIncreased
        ? 'Streak protected. Rewards are landing now.'
        : 'Session complete. Rewards are landing now.';

  return SessionCompletionHeroSchema.parse({
    body: focusedDurationLabel,
    eyebrow: 'Session Complete',
    title,
  });
}

export function buildSessionCompletionReturnPlan(input: {
  completionPercentage: number;
  hasStudyFollowUp: boolean;
  streakDays: number;
  streakIncreased: boolean;
}): SessionCompletionReturnPlan {
  const { completionPercentage, hasStudyFollowUp, streakDays, streakIncreased } =
    input;

  if (streakIncreased) {
    return SessionCompletionReturnPlanSchema.parse({
      highlightMessage:
        'Home is primed with tomorrow\'s anchor so this win turns into a return plan.',
      highlightTitle: `${streakDays}-day streak secured`,
      highlightTone: 'celebration',
      homeCtaLabel: 'See tomorrow plan',
      nextSessionLabel: 'Bank another block',
      returnReasonBody:
        'Go home to see what this session unlocked and the simplest reason to return tomorrow.',
      returnReasonTitle: 'Tomorrow already has a clear anchor',
    });
  }

  if (hasStudyFollowUp) {
    return SessionCompletionReturnPlanSchema.parse({
      highlightMessage:
        'Home will bring your active study plan back to the front so this session keeps compounding.',
      highlightTitle: 'Study momentum saved',
      highlightTone: 'info',
      homeCtaLabel: 'Continue on home',
      nextSessionLabel: 'Start another session',
      returnReasonBody:
        'Return home and keep moving through the plan while the material is still fresh.',
      returnReasonTitle: 'Your study follow-up is already queued',
    });
  }

  if (completionPercentage >= 100) {
    return SessionCompletionReturnPlanSchema.parse({
      highlightMessage:
        'Home will show how this win changed today and what the next useful move is.',
      highlightTitle: 'Session banked cleanly',
      highlightTone: 'celebration',
      homeCtaLabel: 'See next move',
      nextSessionLabel: 'Bank another block',
      returnReasonBody:
        'Return home for the next best action and the progress signal from this finish.',
      returnReasonTitle: 'This finish now points to the next one',
    });
  }

  return SessionCompletionReturnPlanSchema.parse({
    highlightMessage:
      'Home will help you turn this partial win into a cleaner follow-up session.',
    highlightTitle: 'Progress locked in',
    highlightTone: 'info',
    homeCtaLabel: 'Plan the next move',
    nextSessionLabel: 'Start a recovery session',
    returnReasonBody:
      'Go home and take the next easiest session while the context is still warm.',
    returnReasonTitle: 'The loop stays alive with one more clean rep',
  });
}

// ============================================================================
// Session Completion Ledger Service (Phase 2)
// ============================================================================

export interface BuildCompletionLedgerInput {
  sessionId: string;
  userId: string;
  summary: SessionSummary;
  bossEncounter: BossEncounter | null;
  streakSummary: StreakSummary | null;
  challenges: ChallengeDetail[];
  // TODO: Rivals feature not implemented yet
  // rivals: CurrentRival[];
}

export function buildCompletionLedger(input: BuildCompletionLedgerInput): CompletionLedger {
  const { sessionId, userId, summary, bossEncounter, streakSummary, challenges } = input;

  // Calculate boss effects
  const bossEffect = (() => {
    if (!bossEncounter || bossEncounter.status !== 'ACTIVE') {return undefined;}

    const sessionMinutes = Math.floor((summary.effectiveDuration || summary.actualDuration || 0) / 60);
    const purityMultiplier = (summary.focusPurityScore || summary.focusQuality || 100) / 100;
    const damageDealt = Math.floor(sessionMinutes * purityMultiplier);
    const healthBefore = (bossEncounter.healthRemaining / bossEncounter.maxHealth) * 100;
    const healthAfter = Math.max(0, healthBefore - (damageDealt / bossEncounter.maxHealth) * 100);
    const defeated = healthAfter <= 0 && healthBefore > 0;

    return {
      damageDealt,
      defeated,
      rewards: defeated ? [{ type: 'BOSS_DEFEAT', bossId: bossEncounter.bossId }] : [],
    };
  })();

  // Calculate streak effects
  const streakEffect = (() => {
    if (!streakSummary) {
      return {
        action: 'EXTENDED' as const,
        previousDays: 0,
        newDays: 0,
      };
    }

    const currentDays = streakSummary.currentDays;
    const streakIncreased = summary.streakIncreased ?? false;

    return {
      action: streakIncreased
        ? 'EXTENDED'
        : streakSummary.isAtRisk
          ? 'SAVED_BY_INSURANCE'
          : 'EXTENDED',
      previousDays: streakIncreased ? currentDays - 1 : currentDays,
      newDays: currentDays,
    };
  })();

  // Calculate economy effects
  const economyEffect = (() => {
    const baseXp = Math.floor((summary.effectiveDuration || summary.actualDuration || 0) / 60) * 10;
    const baseCoins = 10 + Math.floor((summary.effectiveDuration || summary.actualDuration || 0) / 60);

    return {
      xpEarned: baseXp,
      coinsEarned: baseCoins,
    };
  })();

  // Determine reward status
  const rewardStatus = (() => {
    if (bossEffect?.defeated) {return 'COMPLETE';}
    if (challenges.some(c => c.userChallenge.status === 'COMPLETED')) {return 'COMPLETE';}
    return 'PENDING';
  })();

  // Determine next action
  const nextAction = (() => {
    if (streakEffect.newDays >= 3 && streakEffect.newDays < 7) {
      return {
        type: 'VIEW_PROGRESS' as const,
        reason: 'You are building momentum. Check your streak progress.',
      };
    }
    if (bossEffect?.defeated) {
      return {
        type: 'SHARE' as const,
        reason: 'Share your boss defeat with your squad.',
      };
    }
    return {
      type: 'NEW_SESSION' as const,
      reason: 'Continue your momentum with another focused session.',
    };
  })();

  const ledger = {
    ledgerId: crypto.randomUUID(),
    sessionId,
    userId,
    idempotencyKey: `${sessionId}-${Date.now()}`,
    completedAt: Date.now(),

    session: {
      durationSeconds: summary.effectiveDuration || summary.actualDuration || 0,
      qualityScore: summary.focusQuality || summary.focusPurityScore || 100,
      pauseCount: 0, // Default to 0 as pause count not available in summary
    },

    effects: {
      boss: bossEffect,
      streak: streakEffect,
      economy: economyEffect,
    },

    rewardStatus,
    nextAction,
  };

  return CompletionLedgerSchema.parse(ledger);
}
