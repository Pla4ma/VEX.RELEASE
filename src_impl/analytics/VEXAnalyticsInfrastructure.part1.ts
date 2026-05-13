import { eventBus } from "../events";


export const TARGET_METRICS: VEXTargetMetrics = {
  day1Retention: { target: 0.8 }, // 80% (from 60%)
  day7Retention: { target: 0.45 }, // 45% (from 25%)
  day30Retention: { target: 0.25 }, // 25% (from 10%)
  sessionsPerWeek: { target: 6 }, // 6 sessions (from 3)
  studyPlanCompletionRate: { target: 0.7 }, // 70% (from 30%)
  appStoreRating: { target: 4.8 }, // 4.8 stars (from 4.2)
  supportTicketsPerWeek: { target: 10 }, // 10 tickets (from 50)
  crashFreeRate: { target: 0.999 }, // 99.9% (from 98%)
  premiumConversionRate: { target: 0.08 }, // 8% (from 2%)
  ltv: { target: 45 }, // $45 (from $12)
  paywallConversionRate: { target: 0.15 }, // 15% (from 5%)
  npsScore: { target: 50 }, // 50 (from 20)
  clarityScore: { target: 0.9 }, // 90% (from 40%)
  helpfulnessScore: { target: 0.85 }, // 85% (from 50%)
  returnIntentScore: { target: 0.8 }, // 80% (from 45%)
};

export function trackRetentionEvent(userId: string, event: 'first_open' | 'session' | 'return'): void {
  const today = new Date().toISOString().split('T')[0];
  const userFirstOpen = getUserFirstOpen(userId);

  if (event === 'first_open') {
    // New cohort
    const cohort = retentionCohorts.get(today) || {
      cohortDate: today,
      cohortSize: 0,
      day1: 0,
      day7: 0,
      day30: 0,
    };
    cohort.cohortSize++;
    retentionCohorts.set(today, cohort);
    storeUserFirstOpen(userId, today);
    return;
  }

  if (!userFirstOpen) {
    return;
  }

  // Calculate days since first open
  const daysSince = daysBetween(userFirstOpen, today);
  const cohort = retentionCohorts.get(userFirstOpen);
  if (!cohort) {
    return;
  }

  // Update retention for appropriate day
  if (daysSince === 1) {
    cohort.day1++;
  }
  if (daysSince === 7) {
    cohort.day7++;
  }
  if (daysSince === 30) {
    cohort.day30++;
  }
}

export function calculateRetentionRates(): {
  day1: number;
  day7: number;
  day30: number;
} {
  const cohorts = Array.from(retentionCohorts.values());
  if (cohorts.length === 0) {
    return { day1: 0, day7: 0, day30: 0 };
  }

  // Use cohorts old enough to have day30 data
  const matureCohorts = cohorts.filter((c) => {
    const cohortDate = new Date(c.cohortDate);
    const daysSince = (Date.now() - cohortDate.getTime()) / (1000 * 60 * 60 * 24);
    return daysSince >= 30;
  });

  if (matureCohorts.length === 0) {
    return { day1: 0, day7: 0, day30: 0 };
  }

  const totalSize = matureCohorts.reduce((sum, c) => sum + c.cohortSize, 0);
  if (totalSize === 0) {
    return { day1: 0, day7: 0, day30: 0 };
  }

  return {
    day1: matureCohorts.reduce((sum, c) => sum + c.day1, 0) / totalSize,
    day7: matureCohorts.reduce((sum, c) => sum + c.day7, 0) / totalSize,
    day30: matureCohorts.reduce((sum, c) => sum + c.day30, 0) / totalSize,
  };
}

export function recordEngagementEvent(
  userId: string,
  event: {
    type: 'session_complete' | 'plan_start' | 'plan_complete' | 'boss_defeat' | 'streak_milestone';
    value?: number;
  },
): void {
  let metrics = engagementData.get(userId);
  if (!metrics) {
    metrics = {
      userId,
      sessionsLast7Days: 0,
      sessionsLast30Days: 0,
      totalFocusMinutes: 0,
      avgSessionDuration: 0,
      studyPlansCompleted: 0,
      studyPlansStarted: 0,
      bossBattlesCompleted: 0,
      streakDays: 0,
      weeklyActive: false,
      powerUser: false,
    };
  }

  switch (event.type) {
    case 'session_complete':
      metrics.sessionsLast7Days++;
      metrics.sessionsLast30Days++;
      if (event.value) {
        metrics.totalFocusMinutes += event.value;
        metrics.avgSessionDuration = metrics.totalFocusMinutes / metrics.sessionsLast30Days;
      }
      break;
    case 'plan_start':
      metrics.studyPlansStarted++;
      break;
    case 'plan_complete':
      metrics.studyPlansCompleted++;
      break;
    case 'boss_defeat':
      metrics.bossBattlesCompleted++;
      break;
    case 'streak_milestone':
      if (event.value) {
        metrics.streakDays = event.value;
      }
      break;
  }

  // Recalculate segments
  metrics.weeklyActive = metrics.sessionsLast7Days > 0;
  metrics.powerUser = metrics.sessionsLast7Days >= 5;

  engagementData.set(userId, metrics);

  eventBus.publish('analytics:engagement', {
    userId,
    event: event.type,
    metrics,
  });
}