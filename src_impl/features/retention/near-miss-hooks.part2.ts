import { eventBus } from "../../events";
import * as Sentry from "@sentry/react-native";
import { z } from "zod";


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