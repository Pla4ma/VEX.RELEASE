import type { FeatureKey } from '../../../features/liveops-config';
import type { SessionHistoryEntry } from '../../../session/types';
import type { HomeReturnReason } from './useHomeReturnReason';

export function getFocusedMinutesForToday(entry: SessionHistoryEntry): number {
  const endedAt = entry.endedAt ?? 0;
  if (new Date(endedAt).toDateString() !== new Date().toDateString()) {
    return 0;
  }

  const duration = entry.summary?.effectiveDuration ?? entry.summary?.actualDuration ?? 0;
  return Math.max(0, Math.round(duration / 60000));
}

export function getNextUnlockFeature(
  features: Record<FeatureKey, { isUnlocked: boolean; isVisible: boolean; priority?: number }>,
): FeatureKey | null {
  const match = (Object.entries(features) as Array<[FeatureKey, (typeof features)[FeatureKey]]>)
    .sort((a, b) => (a[1].priority ?? 0) - (b[1].priority ?? 0))
    .find(([, value]) => !value.isUnlocked && value.isVisible);

  return match?.[0] ?? null;
}

export function buildDisplayedReturnReason(
  displayState: {
    body: string;
    eyebrow: string;
    source: HomeReturnReason['source'];
    title: string;
    tone: HomeReturnReason['tone'];
  },
  returnReason: HomeReturnReason,
): HomeReturnReason {
  return {
    ...returnReason,
    body: displayState.body,
    eyebrow: displayState.eyebrow,
    source: displayState.source,
    title: displayState.title,
    tone: displayState.tone,
  };
}

// ============================================================================
// Emotional Return Reason Builders (11/10 Engagement)
// ============================================================================

export interface EmotionalContext {
  totalSessions: number;
  currentStreak: number;
  hoursSinceLastSession: number | null;
  hasActiveStudyPlan: boolean;
  studyPlanTitle?: string;
  isStreakAtRisk: boolean;
  hasComebackEligible: boolean;
  todaysFocusMinutes: number;
}

export function buildEmotionalReturnReason(context: EmotionalContext): {
  headline: string;
  subtext: string;
  ctaText: string;
  tone: 'calm' | 'urgent' | 'celebratory' | 'supportive';
} {
  // New user: first session
  if (context.totalSessions === 0) {
    return {
      headline: 'Start with one small session.',
      subtext: 'Focus builds momentum. Momentum builds progress.',
      ctaText: 'Begin',
      tone: 'calm',
    };
  }

  // Comeback user: returning after absence
  if (context.hasComebackEligible && context.hoursSinceLastSession && context.hoursSinceLastSession > 48) {
    return {
      headline: 'Momentum comes back with one small session.',
      subtext: 'No need to catch up all at once. Start simple.',
      ctaText: 'Return to focus',
      tone: 'supportive',
    };
  }

  // Study user: active study plan
  if (context.hasActiveStudyPlan && context.studyPlanTitle) {
    return {
      headline: `Continue your ${context.studyPlanTitle} study plan.`,
      subtext: 'Your next step is ready when you are.',
      ctaText: 'Continue studying',
      tone: 'calm',
    };
  }

  // Streak at risk
  if (context.isStreakAtRisk && context.currentStreak > 0) {
    return {
      headline: 'One session keeps your momentum alive.',
      subtext: `Your ${context.currentStreak}-day streak is within reach.`,
      ctaText: 'Protect your streak',
      tone: 'urgent',
    };
  }

  // Daily goal complete
  if (context.todaysFocusMinutes >= 120) {
    return {
      headline: "Today's focus goal complete.",
      subtext: "You've built real progress. Rest or continue — your choice.",
      ctaText: 'Start another session',
      tone: 'celebratory',
    };
  }

  // Returning user: building streak
  if (context.currentStreak > 0) {
    return {
      headline: 'Keep building your focus habit.',
      subtext: `${context.currentStreak} days strong. Each session adds to your progress.`,
      ctaText: 'Continue',
      tone: 'calm',
    };
  }

  // Default: building momentum
  return {
    headline: 'Your next session is ready.',
    subtext: 'Small steps consistently beat perfect plans never started.',
    ctaText: 'Start session',
    tone: 'calm',
  };
}

export function buildSessionStakesReason(params: {
  mode: 'focus' | 'study' | 'sprint';
  duration: number;
  hasActiveStudyPlan?: boolean;
  streakDays?: number;
  isStreakAtRisk?: boolean;
  bossHealthRemaining?: number;
  challengeProgress?: number;
}): {
  durationText: string;
  reasonText: string;
  outcomeText: string;
} {
  const durationText = `${params.duration}-minute ${params.mode === 'study' ? 'study' : 'focus'} session`;

  // Study session stakes
  if (params.hasActiveStudyPlan) {
    return {
      durationText,
      reasonText: 'Work through your generated study plan.',
      outcomeText: 'Completion updates your study progress and builds understanding.',
    };
  }

  // Streak at risk stakes
  if (params.isStreakAtRisk && params.streakDays && params.streakDays > 0) {
    return {
      durationText,
      reasonText: 'Protect your momentum.',
      outcomeText: `This session keeps your ${params.streakDays}-day streak alive.`,
    };
  }

  // Boss battle stakes
  if (params.bossHealthRemaining !== undefined && params.bossHealthRemaining <= 30) {
    return {
      durationText,
      reasonText: "Push forward against today's challenge.",
      outcomeText: 'This session brings you closer to completing your current boss.',
    };
  }

  // Challenge close to completion
  if (params.challengeProgress !== undefined && params.challengeProgress >= 70) {
    return {
      durationText,
      reasonText: 'Finish what you started today.',
      outcomeText: "You're close to completing today's challenge.",
    };
  }

  // Default focus stakes
  return {
    durationText,
    reasonText: params.mode === 'sprint' ? 'Build momentum with a short burst.' : 'Good for getting back into motion.',
    outcomeText: "Finishing this adds to today's progress and builds your focus habit.",
  };
}

export function buildCompletionHeadline(params: {
  sessionDuration: number;
  wasStudySession: boolean;
  streakProtected: boolean;
  streakBroken: boolean;
  bossDamaged: boolean;
  challengeCompleted: boolean;
  dailyGoalComplete: boolean;
}): {
  headline: string;
  subheadline: string;
  tone: 'celebratory' | 'calm' | 'recovery';
} {
  // Study session completion
  if (params.wasStudySession) {
    return {
      headline: 'Study progress locked in.',
      subheadline: 'Your effort moved your understanding forward.',
      tone: 'calm',
    };
  }

  // Daily goal complete
  if (params.dailyGoalComplete) {
    return {
      headline: 'Daily goal complete.',
      subheadline: "You showed up and followed through. That's the core of progress.",
      tone: 'celebratory',
    };
  }

  // Challenge completed
  if (params.challengeCompleted) {
    return {
      headline: 'Challenge complete.',
      subheadline: 'You finished what you set out to do today.',
      tone: 'celebratory',
    };
  }

  // Boss damaged significantly
  if (params.bossDamaged) {
    return {
      headline: 'Progress made.',
      subheadline: 'You pushed your current challenge forward.',
      tone: 'calm',
    };
  }

  // Streak protected
  if (params.streakProtected) {
    return {
      headline: 'Streak protected.',
      subheadline: 'You kept your momentum alive today.',
      tone: 'calm',
    };
  }

  // Default completion
  return {
    headline: 'You showed up.',
    subheadline: 'One focused session is enough to build momentum.',
    tone: 'calm',
  };
}
