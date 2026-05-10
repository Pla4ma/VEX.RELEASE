/**
 * Near Miss Psychology Hooks
 * Interventions at critical abandonment moments
 * Uses psychological triggers to retain users
 */

import { eventBus } from '../../events';
import * as Sentry from '@sentry/react-native';
import { z } from 'zod';

// ============================================================================
// Schemas
// ============================================================================

export const NearMissTriggerSchema = z.any();
export const NearMissInterventionSchema = z.any();

// ============================================================================
// Intervention Templates
// ============================================================================

const INTERVENTION_TEMPLATES: Record<
  string,
  Array<{
    headline: string;
    body: string;
    primaryAction: string;
    incentive?: { type: string; amount: number };
    urgency: string;
  }>
> = {
  SESSION_ABANDON_80_PERCENT: [
    {
      headline: 'So close! 🎯',
      body: "You're at 80% completion. Finish now for a 2x XP Comeback Bonus!",
      primaryAction: 'Complete Session',
      incentive: { type: 'XP_BONUS', amount: 2.0 },
      urgency: 'HIGH',
    },
    {
      headline: "Don't let it slip! 💪",
      body: 'Only a few minutes left. Your streak thanks you for finishing!',
      primaryAction: 'Push Through',
      urgency: 'MEDIUM',
    },
  ],
  STREAK_ABOUT_TO_BREAK: [
    {
      headline: '🚨 STREAK EMERGENCY!',
      body: 'Your streak expires in 30 minutes! Start a 5-minute Sprint Save now!',
      primaryAction: 'Sprint Save (5 min)',
      incentive: { type: 'STREAK_SAVE', amount: 1 },
      urgency: 'CRITICAL',
    },
    {
      headline: 'Your streak needs you! 🔥',
      body: 'Hours left to save your streak. One quick session is all it takes!',
      primaryAction: 'Quick Session',
      urgency: 'HIGH',
    },
  ],
  APP_BACKGROUND_LONG: [
    {
      headline: 'Missed you! 👋',
      body: "You left mid-session. Come back and we'll add +50% XP as a welcome back bonus!",
      primaryAction: 'Resume Session',
      incentive: { type: 'XP_BONUS', amount: 1.5 },
      urgency: 'MEDIUM',
    },
  ],
  CHALLENGE_ABANDON: [
    {
      headline: 'Challenge slipping away! 🏃',
      body: "You're so close to completing your challenge. Finish it now for bonus gems!",
      primaryAction: 'Complete Challenge',
      incentive: { type: 'GEM_BONUS', amount: 10 },
      urgency: 'HIGH',
    },
  ],
  BOSS_FLEE_WARNING: [
    {
      headline: 'Boss is escaping! 👹',
      body: 'The boss flees in 2 hours! One more hit defeats it. +25 gems if you win!',
      primaryAction: 'Defeat Boss',
      incentive: { type: 'GEM_BONUS', amount: 25 },
      urgency: 'CRITICAL',
    },
  ],
  DAILY_REWARD_MISSED: [
    {
      headline: 'Comeback Bonus! 🎁',
      body: "You missed a day, but we're giving you 2x rewards today to catch up!",
      primaryAction: 'Claim 2x Reward',
      incentive: { type: 'COMEBACK_BOOST', amount: 2.0 },
      urgency: 'MEDIUM',
    },
  ],
};

// ============================================================================
// Types
// ============================================================================

export type NearMissTrigger = any;
export type NearMissIntervention = any;

// ============================================================================
// Trigger Detection
// ============================================================================

export function shouldTriggerIntervention(
  trigger: DynamicValue,
  context: {
    sessionProgress?: number;
    streakHoursRemaining?: number;
    minutesBackgrounded?: number;
    challengeProgress?: number;
    bossFleeHours?: number;
    daysSinceLastLogin?: number;
  },
): boolean {
  switch (trigger) {
    case 'SESSION_ABANDON_80_PERCENT':
      return (context.sessionProgress || 0) >= 80 && (context.sessionProgress || 0) < 100;

    case 'STREAK_ABOUT_TO_BREAK':
      return (context.streakHoursRemaining || 999) <= 0.5; // 30 minutes or less

    case 'APP_BACKGROUND_LONG':
      return (context.minutesBackgrounded || 0) > 5 && (context.minutesBackgrounded || 0) < 60;

    case 'CHALLENGE_ABANDON':
      return (context.challengeProgress || 0) >= 80 && (context.challengeProgress || 0) < 100;

    case 'BOSS_FLEE_WARNING':
      return (context.bossFleeHours || 999) <= 2;

    case 'DAILY_REWARD_MISSED':
      return (context.daysSinceLastLogin || 0) === 1;

    default:
      return false;
  }
}

// ============================================================================
// Intervention Generation
// ============================================================================

export function generateIntervention(
  userId: string,
  trigger: DynamicValue,
  personalization: {
    userName?: string;
    streakDays?: number;
    sessionCount?: number;
    lastInterventionTime?: number;
  } = {},
): DynamicValue | null {
  // Rate limiting: max 1 intervention per hour per user
  const hoursSinceLastIntervention = personalization.lastInterventionTime ? (Date.now() - personalization.lastInterventionTime) / (1000 * 60 * 60) : 999;

  if (hoursSinceLastIntervention < 1) {
    return null; // Too soon
  }

  const templates = INTERVENTION_TEMPLATES[trigger];
  if (!templates || templates.length === 0) {
    return null;
  }

  // Select template (could use ML to optimize, random for now)
  const template = templates[Math.floor(Math.random() * templates.length)];

  // Personalize content
  const personalizedContent = {
    headline: template.headline,
    body: personalizeMessage(template.body, personalization),
    primaryAction: template.primaryAction,
    incentive: template.incentive as any,
  };

  return (NearMissInterventionSchema as any).parse({
    id: crypto.randomUUID(),
    userId,
    trigger,
    triggeredAt: Date.now(),
    shown: false,
    actedUpon: false,
    dismissed: false,
    content: personalizedContent,
    urgency: template.urgency as any,
  });
}

function personalizeMessage(
  template: string,
  personalization: {
    userName?: string;
    streakDays?: number;
    sessionCount?: number;
  },
): string {
  let message = template;

  if (personalization.userName) {
    message = message.replace('{{name}}', personalization.userName);
  }

  if (personalization.streakDays) {
    message = message.replace('{{streak}}', personalization.streakDays.toString());
  }

  if (personalization.sessionCount) {
    message = message.replace('{{sessions}}', personalization.sessionCount.toString());
  }

  return message;
}

// ============================================================================
// Intervention Actions
// ============================================================================

export function showIntervention(intervention: DynamicValue): DynamicValue {
  const shown = { ...intervention, shown: true };

  (eventBus as any).publish('near_miss:shown', {
    userId: intervention.userId,
    trigger: intervention.trigger,
    interventionId: intervention.id,
    urgency: intervention.urgency,
  });

  Sentry.addBreadcrumb({
    category: 'near_miss',
    message: `Intervention shown: ${intervention.trigger}`,
    data: { userId: intervention.userId, trigger: intervention.trigger },
  });

  return shown;
}

export function resolveIntervention(
  intervention: DynamicValue,
  action: 'PRIMARY' | 'SECONDARY' | 'DISMISS',
): {
  updatedIntervention: DynamicValue;
  rewardGranted?: { type: string; amount: number };
} {
  const updated: DynamicValue = {
    ...intervention,
    actedUpon: action === 'PRIMARY' || action === 'SECONDARY',
    dismissed: action === 'DISMISS',
  };

  // Grant incentive if primary action taken
  let rewardGranted: { type: string; amount: number } | undefined;
  if (action === 'PRIMARY' && intervention.content.incentive) {
    rewardGranted = intervention.content.incentive;

    (eventBus as any).publish('near_miss:incentive_claimed', {
      userId: intervention.userId,
      interventionId: intervention.id,
      incentive: intervention.content.incentive,
    });
  }

  // Track effectiveness
  (eventBus as any).publish('near_miss:resolved', {
    userId: intervention.userId,
    interventionId: intervention.id,
    action,
    success: action === 'PRIMARY',
  });

  return { updatedIntervention: updated, rewardGranted };
}

// ============================================================================
// Session Abandonment Prevention (80% Rule)
// ============================================================================

export function checkSessionAbandonment(
  sessionId: string,
  userId: string,
  elapsedSeconds: number,
  totalSeconds: number,
  isAbandoning: boolean,
): {
  shouldIntervene: boolean;
  intervention: NearMissIntervention | null;
  progressPercent: number;
} {
  const progressPercent = Math.floor((elapsedSeconds / totalSeconds) * 100);

  if (!isAbandoning || progressPercent < 80) {
    return { shouldIntervene: false, intervention: null, progressPercent };
  }

  // User is abandoning at 80%+ - this is a near miss!
  const intervention = generateIntervention(userId, 'SESSION_ABANDON_80_PERCENT', {
    sessionCount: 1, // Could be fetched from user stats
  });

  return {
    shouldIntervene: true,
    intervention,
    progressPercent,
  };
}

// ============================================================================
// Streak Emergency (Last 30 Minutes)
// ============================================================================

export function checkStreakEmergency(
  userId: string,
  streakHoursRemaining: number,
  currentStreakDays: number,
): {
  isEmergency: boolean;
  intervention: NearMissIntervention | null;
  minutesRemaining: number;
} {
  const minutesRemaining = Math.floor(streakHoursRemaining * 60);

  if (streakHoursRemaining > 0.5) {
    // More than 30 minutes
    return { isEmergency: false, intervention: null, minutesRemaining };
  }

  // CRITICAL: Streak expires in 30 minutes or less
  const intervention = generateIntervention(userId, 'STREAK_ABOUT_TO_BREAK', {
    streakDays: currentStreakDays,
  });

  return {
    isEmergency: true,
    intervention,
    minutesRemaining,
  };
}

// ============================================================================
// Background Return Bonus
// ============================================================================

export function checkBackgroundReturn(
  userId: string,
  minutesBackgrounded: number,
  wasInSession: boolean,
): {
  shouldReward: boolean;
  xpBonusMultiplier: number;
  message: string;
} {
  if (!wasInSession || minutesBackgrounded < 5 || minutesBackgrounded > 60) {
    return { shouldReward: false, xpBonusMultiplier: 1, message: '' };
  }

  // User returned after briefly leaving
  return {
    shouldReward: true,
    xpBonusMultiplier: 1.5, // 50% bonus for returning
    message: 'Welcome back! +50% XP for completing your session!',
  };
}

// ============================================================================
// Analytics & Effectiveness
// ============================================================================

export function trackInterventionEffectiveness(intervention: DynamicValue, outcome: 'SUCCESS' | 'DISMISSED' | 'IGNORED'): void {
  Sentry.addBreadcrumb({
    category: 'near_miss_analytics',
    message: `Intervention ${outcome}`,
    data: {
      trigger: intervention.trigger,
      urgency: intervention.urgency,
      outcome,
      timeToAction: Date.now() - intervention.triggeredAt,
    },
  });

  // Could send to analytics service for ML optimization
  (eventBus as any).publish('near_miss:analytics', {
    interventionId: intervention.id,
    trigger: intervention.trigger,
    outcome,
  });
}

// ============================================================================
// Batch Processing (for cron jobs)
// ============================================================================

export async function processNearMissOpportunities(repository: { fetchUsersWithAtRiskStreaks: () => Promise<Array<{ userId: string; hoursRemaining: number; streakDays: number }>>; fetchUsersWithAbandonedSessions: () => Promise<Array<{ userId: string; sessionId: string; progress: number }>> }): Promise<{ streakInterventions: number; sessionInterventions: number }> {
  let streakInterventions = 0;
  let sessionInterventions = 0;

  // Process at-risk streaks
  const atRiskStreaks = await repository.fetchUsersWithAtRiskStreaks();
  for (const user of atRiskStreaks) {
    if (user.hoursRemaining <= 0.5) {
      const intervention = generateIntervention(user.userId, 'STREAK_ABOUT_TO_BREAK', {
        streakDays: user.streakDays,
      });
      if (intervention) {
        // Queue notification
        streakInterventions++;
        (eventBus as any).publish('notification:send', {
          userId: user.userId,
          type: 'STREAK_EMERGENCY',
          title: intervention.content.headline,
          body: intervention.content.body,
          priority: 'high',
        });
      }
    }
  }

  // Process abandoned sessions
  const abandonedSessions = await repository.fetchUsersWithAbandonedSessions();
  for (const session of abandonedSessions) {
    if (session.progress >= 80) {
      const intervention = generateIntervention(session.userId, 'SESSION_ABANDON_80_PERCENT', {
        sessionCount: 1,
      });
      if (intervention) {
        sessionInterventions++;
        (eventBus as any).publish('notification:send', {
          userId: session.userId,
          type: 'SESSION_ABANDON',
          title: intervention.content.headline,
          body: intervention.content.body,
          priority: 'medium',
        });
      }
    }
  }

  return { streakInterventions, sessionInterventions };
}
