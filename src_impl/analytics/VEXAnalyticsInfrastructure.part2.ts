import { eventBus } from "../events";


export function getAverageSessionsPerWeek(): number {
  const users = Array.from(engagementData.values());
  if (users.length === 0) {
    return 0;
  }
  return users.reduce((sum, u) => sum + u.sessionsLast7Days, 0) / users.length;
}

export function getStudyPlanCompletionRate(): number {
  const users = Array.from(engagementData.values());
  if (users.length === 0) {
    return 0;
  }

  const totalStarted = users.reduce((sum, u) => sum + u.studyPlansStarted, 0);
  const totalCompleted = users.reduce((sum, u) => sum + u.studyPlansCompleted, 0);

  if (totalStarted === 0) {
    return 0;
  }
  return totalCompleted / totalStarted;
}

export function trackMonetizationEvent(event: { type: 'subscription_start' | 'trial_start' | 'trial_convert' | 'cancellation' | 'renewal'; userId: string; value?: number; tier?: 'FREE' | 'PREMIUM' }): void {
  switch (event.type) {
    case 'trial_start':
      monetizationMetrics.trialUsers++;
      break;
    case 'trial_convert':
      monetizationMetrics.trialUsers--;
      monetizationMetrics.premiumUsers++;
      monetizationMetrics.freeUsers--;
      break;
    case 'subscription_start':
      monetizationMetrics.premiumUsers++;
      if (event.value) {
        monetizationMetrics.totalRevenue += event.value;
        monetizationMetrics.mrr += event.value / 12; // Assume annual
      }
      break;
    case 'cancellation':
      monetizationMetrics.premiumUsers--;
      monetizationMetrics.freeUsers++;
      if (event.value) {
        monetizationMetrics.mrr -= event.value / 12;
      }
      break;
  }

  // Recalculate rates
  monetizationMetrics.totalUsers = monetizationMetrics.freeUsers + monetizationMetrics.premiumUsers;
  monetizationMetrics.conversionRate = monetizationMetrics.totalUsers > 0 ? monetizationMetrics.premiumUsers / monetizationMetrics.totalUsers : 0;
  monetizationMetrics.trialConversionRate = monetizationMetrics.trialUsers > 0 ? monetizationMetrics.premiumUsers / (monetizationMetrics.premiumUsers + monetizationMetrics.trialUsers) : 0;
  monetizationMetrics.arpu = monetizationMetrics.totalUsers > 0 ? monetizationMetrics.totalRevenue / monetizationMetrics.totalUsers : 0;

  eventBus.publish('analytics:monetization', {
    event: event.type,
    userId: event.userId,
    metrics: { ...monetizationMetrics },
  });
}

export function getMonetizationMetrics(): MonetizationMetrics {
  return { ...monetizationMetrics };
}

export function trackPaywallEvent(event: 'show' | 'dismiss' | 'convert', context: string): void {
  if (!paywallAnalytics.byContext[context]) {
    paywallAnalytics.byContext[context] = { shows: 0, conversions: 0, rate: 0 };
  }

  switch (event) {
    case 'show':
      paywallAnalytics.totalShows++;
      paywallAnalytics.byContext[context].shows++;
      break;
    case 'dismiss':
      paywallAnalytics.totalDismisses++;
      break;
    case 'convert':
      paywallAnalytics.totalConversions++;
      paywallAnalytics.byContext[context].conversions++;
      break;
  }

  // Recalculate rates
  paywallAnalytics.conversionRate = paywallAnalytics.totalShows > 0 ? paywallAnalytics.totalConversions / paywallAnalytics.totalShows : 0;

  for (const ctx of Object.keys(paywallAnalytics.byContext)) {
    const data = paywallAnalytics.byContext[ctx];
    data.rate = data.shows > 0 ? data.conversions / data.shows : 0;
  }
}

export function getPaywallAnalytics(): PaywallAnalytics {
  return { ...paywallAnalytics };
}

export function getBestPaywallContext(): string | null {
  let bestContext: string | null = null;
  let bestRate = 0;

  for (const [context, data] of Object.entries(paywallAnalytics.byContext)) {
    if (data.rate > bestRate && data.shows > 10) {
      bestRate = data.rate;
      bestContext = context;
    }
  }

  return bestContext;
}

export function trackStreakEvent(event: 'start' | 'break' | 'protect' | 'milestone', data?: { length?: number; insuranceUsed?: boolean }): void {
  switch (event) {
    case 'start':
      streakMetrics.totalStreaksStarted++;
      break;
    case 'break':
      streakMetrics.streaksBroken++;
      break;
    case 'protect':
      streakMetrics.streaksProtected++;
      break;
    case 'milestone':
      if (data?.length) {
        // Update average
        const totalLength = streakMetrics.avgStreakLength * (streakMetrics.totalStreaksStarted - 1) + data.length;
        streakMetrics.avgStreakLength = totalLength / streakMetrics.totalStreaksStarted;
      }
      break;
  }

  // Recalculate rates
  const completedStreaks = streakMetrics.streaksBroken + streakMetrics.streaksProtected;
  streakMetrics.survivalRate = completedStreaks > 0 ? streakMetrics.streaksProtected / completedStreaks : 1;
  streakMetrics.insuranceUsageRate = streakMetrics.streaksProtected > 0 ? streakMetrics.streaksProtected / (streakMetrics.streaksProtected + streakMetrics.streaksBroken) : 0;
}

export function getStreakSurvivalMetrics(): StreakSurvivalMetrics {
  return { ...streakMetrics };
}

export function generateDashboardReport(): VEXDashboard {
  const retention = calculateRetentionRates();
  const engagement = {
    avgSessionsPerWeek: getAverageSessionsPerWeek(),
    studyPlanCompletionRate: getStudyPlanCompletionRate(),
    powerUserPercentage: calculatePowerUserPercentage(),
  };

  // Build success metrics with current values
  const successMetrics: VEXSuccessMetrics = {
    day1Retention: {
      current: retention.day1,
      target: TARGET_METRICS.day1Retention.target,
      trend: 'flat',
    },
    day7Retention: {
      current: retention.day7,
      target: TARGET_METRICS.day7Retention.target,
      trend: 'flat',
    },
    day30Retention: {
      current: retention.day30,
      target: TARGET_METRICS.day30Retention.target,
      trend: 'flat',
    },
    sessionsPerWeek: {
      current: engagement.avgSessionsPerWeek,
      target: TARGET_METRICS.sessionsPerWeek.target,
      trend: 'flat',
    },
    studyPlanCompletionRate: {
      current: engagement.studyPlanCompletionRate,
      target: TARGET_METRICS.studyPlanCompletionRate.target,
      trend: 'flat',
    },
    appStoreRating: { current: 0, target: TARGET_METRICS.appStoreRating.target, trend: 'flat' },
    supportTicketsPerWeek: {
      current: 0,
      target: TARGET_METRICS.supportTicketsPerWeek.target,
      trend: 'flat',
    },
    crashFreeRate: { current: 0.98, target: TARGET_METRICS.crashFreeRate.target, trend: 'flat' },
    premiumConversionRate: {
      current: monetizationMetrics.conversionRate,
      target: TARGET_METRICS.premiumConversionRate.target,
      trend: 'flat',
    },
    ltv: { current: monetizationMetrics.averageLTV, target: TARGET_METRICS.ltv.target, trend: 'flat' },
    paywallConversionRate: {
      current: paywallAnalytics.conversionRate,
      target: TARGET_METRICS.paywallConversionRate.target,
      trend: 'flat',
    },
    npsScore: { current: 0, target: TARGET_METRICS.npsScore.target, trend: 'flat' },
    clarityScore: { current: 0, target: TARGET_METRICS.clarityScore.target, trend: 'flat' },
    helpfulnessScore: { current: 0, target: TARGET_METRICS.helpfulnessScore.target, trend: 'flat' },
    returnIntentScore: {
      current: 0,
      target: TARGET_METRICS.returnIntentScore.target,
      trend: 'flat',
    },
  };

  return {
    generatedAt: Date.now(),
    successMetrics,
    retention,
    engagement,
    monetization: getMonetizationMetrics(),
    paywall: getPaywallAnalytics(),
    streaks: getStreakSurvivalMetrics(),
    trends: {
      dayOverDay: {},
      weekOverWeek: {},
    },
  };
}