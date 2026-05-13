import { type SubscriptionTier, type PaywallContextType, shouldShowPaywall, getPaywallContext, isPremium, type PaywallContextData } from "./PremiumTierSystem";


export function selectBestPaywall(userId: string, availableContexts: PaywallContextType[]): { context: PaywallContextType; data: PaywallContextData } | null {
  // Filter to only contexts that can be shown
  const validContexts = availableContexts.filter((context) => {
    const canShow = canShowPaywall(userId, context);
    return canShow.canShow;
  });

  if (validContexts.length === 0) {
    return null;
  }

  // Sort by priority (highest first)
  const sorted = validContexts.sort((a, b) => {
    const priorityA = PAYWALL_MOMENTS[a].priority;
    const priorityB = PAYWALL_MOMENTS[b].priority;
    return priorityB - priorityA;
  });

  const selected = sorted[0];
  return {
    context: selected,
    data: getPaywallContext(selected),
  };
}

export function recordConversion(userId: string, context: PaywallContextType, converted: boolean, timeToDecide: number): void {
  conversionMetrics.push({
    userId,
    context,
    shownAt: Date.now(),
    converted,
    convertedAt: converted ? Date.now() : undefined,
    dismissed: !converted,
    timeToDecide,
  });

  // Update paywall history
  const history = paywallHistory.get(userId) || [];
  const lastShow = history.filter((h) => h.context === context).pop();
  if (lastShow) {
    lastShow.converted = converted;
    lastShow.dismissed = !converted;
  }
}

export function getConversionRate(context: PaywallContextType): number {
  const metrics = conversionMetrics.filter((m) => m.context === context);
  if (metrics.length === 0) {
    return 0;
  }

  const conversions = metrics.filter((m) => m.converted).length;
  return conversions / metrics.length;
}

export function getBestConvertingContext(): PaywallContextType | null {
  const contexts: PaywallContextType[] = ['STUDY_PLAN_LIMIT', 'BOSS_BOUNTY', 'STREAK_INSURANCE', 'PERSONALITY_SELECT', 'ANALYTICS_REQUEST'];

  let bestContext: PaywallContextType | null = null;
  let bestRate = 0;

  for (const context of contexts) {
    const rate = getConversionRate(context);
    if (rate > bestRate) {
      bestRate = rate;
      bestContext = context;
    }
  }

  return bestContext;
}

export function shouldPreventPaywall(userId: string, sessionsCompleted: number, isOnboarding: boolean, isFirstSession: boolean): { prevent: boolean; reason: string | null } {
  // Never show during onboarding
  if (isOnboarding) {
    return { prevent: true, reason: 'Onboarding in progress' };
  }

  // Never show during very first session
  if (isFirstSession) {
    return { prevent: true, reason: 'First session' };
  }

  // Wait until user has completed at least 1 session
  if (sessionsCompleted < 1) {
    return { prevent: true, reason: 'Not enough sessions completed' };
  }

  // Don't show if user dismissed 3+ paywalls in last 24h (fatigue)
  const history = getPaywallHistory(userId);
  const last24h = history.filter((h) => h.shownAt > Date.now() - 24 * 60 * 60 * 1000 && h.dismissed);
  if (last24h.length >= 3) {
    return { prevent: true, reason: 'Paywall fatigue detected' };
  }

  return { prevent: false, reason: null };
}