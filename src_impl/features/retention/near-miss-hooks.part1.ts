import { eventBus } from "../../events";
import * as Sentry from "@sentry/react-native";
import { z } from "zod";


export const NearMissTriggerSchema = z.any();

export const NearMissInterventionSchema = z.any();

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