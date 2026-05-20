import { eventBus } from "../../events";
import * as Sentry from "@sentry/react-native";
import {
  INTERVENTION_TEMPLATES,
  type NearMissContext,
  type NearMissPersonalization,
  type AbandonmentCheck,
  type StreakEmergencyCheck,
  type BackgroundReturnCheck,
} from "./near-miss-templates";
import {
  NearMissInterventionSchema,
  type NearMissIntervention,
} from "./near-miss-schemas";
export { processNearMissOpportunities } from "./near-miss-processing";
export { trackInterventionEffectiveness } from "./near-miss-analytics";
export {
  NearMissInterventionSchema,
  NearMissTriggerSchema,
  type NearMissIntervention,
} from "./near-miss-schemas";
export function shouldTriggerIntervention(
  trigger: string,
  context: NearMissContext,
): boolean {
  switch (trigger) {
    case "SESSION_ABANDON_80_PERCENT":
      return (
        (context.sessionProgress ?? 0) >= 80 &&
        (context.sessionProgress ?? 0) < 100
      );
    case "STREAK_ABOUT_TO_BREAK":
      return (context.streakHoursRemaining ?? 999) <= 0.5;
    case "APP_BACKGROUND_LONG":
      return (
        (context.minutesBackgrounded ?? 0) > 5 &&
        (context.minutesBackgrounded ?? 0) < 60
      );
    case "CHALLENGE_ABANDON":
      return (
        (context.challengeProgress ?? 0) >= 80 &&
        (context.challengeProgress ?? 0) < 100
      );
    case "BOSS_FLEE_WARNING":
      return (context.bossFleeHours ?? 999) <= 2;
    case "DAILY_REWARD_MISSED":
      return (context.daysSinceLastLogin ?? 0) === 1;
    default:
      return false;
  }
}
export function generateIntervention(
  userId: string,
  trigger: string,
  personalization: NearMissPersonalization = {},
): NearMissIntervention | null {
  const hoursSinceLastIntervention = personalization.lastInterventionTime
    ? (Date.now() - personalization.lastInterventionTime) / (1000 * 60 * 60)
    : 999;
  if (hoursSinceLastIntervention < 1) return null;
  const templates = INTERVENTION_TEMPLATES[trigger];
  if (!templates || templates.length === 0) return null;
  const template = templates[Math.floor(Math.random() * templates.length)]!;
  const result = NearMissInterventionSchema.safeParse({
    id: crypto.randomUUID(),
    userId,
    trigger,
    triggeredAt: Date.now(),
    shown: false,
    actedUpon: false,
    dismissed: false,
    content: {
      headline: template.headline,
      body: personalizeMessage(template.body, personalization),
      primaryAction: template.primaryAction,
      incentive: template.incentive,
    },
    urgency: template.urgency,
  });
  if (!result.success) return null;
  return result.data;
}
function personalizeMessage(
  template: string,
  personalization: NearMissPersonalization,
): string {
  let message = template;
  if (personalization.userName)
    message = message.replace("{{name}}", personalization.userName);
  if (personalization.streakDays)
    message = message.replace("{{streak}}", String(personalization.streakDays));
  if (personalization.sessionCount)
    message = message.replace(
      "{{sessions}}",
      String(personalization.sessionCount),
    );
  return message;
}
export function showIntervention(
  intervention: NearMissIntervention,
): NearMissIntervention {
  const shown = { ...intervention, shown: true };
  eventBus.publish("near_miss:shown", {
    userId: intervention.userId,
    trigger: intervention.trigger,
    interventionId: intervention.id,
    urgency: intervention.urgency,
  });
  Sentry.addBreadcrumb({
    category: "near_miss",
    message: `Intervention shown: ${intervention.trigger}`,
    data: { userId: intervention.userId, trigger: intervention.trigger },
  });
  return shown;
}
export function resolveIntervention(
  intervention: NearMissIntervention,
  action: "PRIMARY" | "SECONDARY" | "DISMISS",
): {
  updatedIntervention: NearMissIntervention;
  rewardGranted?: { type: string; amount: number };
} {
  const updated: NearMissIntervention = {
    ...intervention,
    actedUpon: action === "PRIMARY" || action === "SECONDARY",
    dismissed: action === "DISMISS",
  };
  if (action === "PRIMARY" && intervention.content.incentive) {
    eventBus.publish("near_miss:incentive_claimed", {
      userId: intervention.userId,
      interventionId: intervention.id,
      incentive: intervention.content.incentive,
    });
    return {
      updatedIntervention: updated,
      rewardGranted: intervention.content.incentive,
    };
  }
  eventBus.publish("near_miss:resolved", {
    userId: intervention.userId,
    interventionId: intervention.id,
    action,
  });
  return { updatedIntervention: updated };
}
export function checkSessionAbandonment(
  sessionId: string,
  userId: string,
  elapsedSeconds: number,
  totalSeconds: number,
  isAbandoning: boolean,
): AbandonmentCheck {
  const progressPercent = Math.floor((elapsedSeconds / totalSeconds) * 100);
  if (!isAbandoning || progressPercent < 80) {
    return { shouldIntervene: false, intervention: null, progressPercent };
  }
  const intervention = generateIntervention(
    userId,
    "SESSION_ABANDON_80_PERCENT",
    { sessionCount: 1 },
  );
  return { shouldIntervene: true, intervention, progressPercent };
}
export function checkStreakEmergency(
  userId: string,
  streakHoursRemaining: number,
  currentStreakDays: number,
): StreakEmergencyCheck {
  const minutesRemaining = Math.floor(streakHoursRemaining * 60);
  if (streakHoursRemaining > 0.5) {
    return { isEmergency: false, intervention: null, minutesRemaining };
  }
  const intervention = generateIntervention(userId, "STREAK_ABOUT_TO_BREAK", {
    streakDays: currentStreakDays,
  });
  return { isEmergency: true, intervention, minutesRemaining };
}
export function checkBackgroundReturn(
  _userId: string,
  minutesBackgrounded: number,
  wasInSession: boolean,
): BackgroundReturnCheck {
  if (!wasInSession || minutesBackgrounded < 5 || minutesBackgrounded > 60) {
    return { shouldReward: false, xpBonusMultiplier: 1, message: "" };
  }
  return {
    shouldReward: true,
    xpBonusMultiplier: 1.5,
    message: "Welcome back! +50% XP for completing your session!",
  };
}
