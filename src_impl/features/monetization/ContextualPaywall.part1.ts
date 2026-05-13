import { type SubscriptionTier, type PaywallContextType, shouldShowPaywall, getPaywallContext, isPremium, type PaywallContextData } from "./PremiumTierSystem";


export const PAYWALL_MOMENTS: Record<PaywallContextType, PaywallMoment> = {
  STUDY_PLAN_LIMIT: {
    context: 'STUDY_PLAN_LIMIT',
    triggerCondition: { type: 'STUDY_PLAN_CREATE_ATTEMPT', currentPlanCount: 1 },
    priority: 9,
    cooldownHours: 24,
    maxShowsPerDay: 1,
    respectDND: true,
  },
  BOSS_BOUNTY: {
    context: 'BOSS_BOUNTY',
    triggerCondition: { type: 'BOSS_BOUNTY_PLACE_ATTEMPT' },
    priority: 7,
    cooldownHours: 48,
    maxShowsPerDay: 1,
    respectDND: true,
  },
  STREAK_INSURANCE: {
    context: 'STREAK_INSURANCE',
    triggerCondition: { type: 'STREAK_BREAK_NO_INSURANCE', daysLost: 0 },
    priority: 10, // Highest - user just lost something
    cooldownHours: 168, // 1 week - only on actual streak break
    maxShowsPerDay: 1,
    respectDND: false, // Always show when streak breaks
  },
  PERSONALITY_SELECT: {
    context: 'PERSONALITY_SELECT',
    triggerCondition: { type: 'PERSONALITY_SWITCH_ATTEMPT' },
    priority: 5,
    cooldownHours: 72,
    maxShowsPerDay: 1,
    respectDND: true,
  },
  ANALYTICS_REQUEST: {
    context: 'ANALYTICS_REQUEST',
    triggerCondition: { type: 'ANALYTICS_VIEW_ATTEMPT' },
    priority: 4,
    cooldownHours: 24,
    maxShowsPerDay: 2,
    respectDND: true,
  },
  SQUAD_LIMIT: {
    context: 'SQUAD_LIMIT',
    triggerCondition: { type: 'SQUAD_JOIN_ATTEMPT', currentSquadCount: 3 },
    priority: 6,
    cooldownHours: 24,
    maxShowsPerDay: 1,
    respectDND: true,
  },
  EXCLUSIVE_COSMETIC: {
    context: 'EXCLUSIVE_COSMETIC',
    triggerCondition: { type: 'COSMETIC_PREVIEW_ATTEMPT', cosmeticId: '' },
    priority: 3,
    cooldownHours: 48,
    maxShowsPerDay: 2,
    respectDND: true,
  },
  ADVANCED_AI: {
    context: 'ADVANCED_AI',
    triggerCondition: { type: 'FEATURE_CLICK', feature: 'advanced_ai' },
    priority: 5,
    cooldownHours: 24,
    maxShowsPerDay: 1,
    respectDND: true,
  },
  BETA_FEATURE: {
    context: 'BETA_FEATURE',
    triggerCondition: { type: 'FEATURE_CLICK', feature: 'beta' },
    priority: 2,
    cooldownHours: 72,
    maxShowsPerDay: 1,
    respectDND: true,
  },
};

export function recordPaywallShow(userId: string, context: PaywallContextType, dismissed: boolean = false, converted: boolean = false): void {
  const history = paywallHistory.get(userId) || [];
  history.push({
    context,
    shownAt: Date.now(),
    dismissed,
    converted,
  });
  paywallHistory.set(userId, history);
}

export function getPaywallHistory(userId: string): PaywallShowRecord[] {
  return paywallHistory.get(userId) || [];
}

export function canShowPaywall(userId: string, context: PaywallContextType, isInSession: boolean = false): { canShow: boolean; reason: string | null } {
  const moment = PAYWALL_MOMENTS[context];
  const history = getPaywallHistory(userId);
  const now = Date.now();

  // Don't show if user is premium
  if (isPremium(userId)) {
    return { canShow: false, reason: 'User is already premium' };
  }

  // Don't show during sessions if respectDND is true
  if (isInSession && moment.respectDND) {
    return { canShow: false, reason: 'Respecting Do Not Disturb during session' };
  }

  // Check daily frequency
  const todayShows = history.filter((h) => h.context === context && h.shownAt > now - 24 * 60 * 60 * 1000);
  if (todayShows.length >= moment.maxShowsPerDay) {
    return { canShow: false, reason: 'Daily frequency limit reached' };
  }

  // Check cooldown
  const lastShow = history.filter((h) => h.context === context).pop();
  if (lastShow) {
    const hoursSinceLastShow = (now - lastShow.shownAt) / (1000 * 60 * 60);
    if (hoursSinceLastShow < moment.cooldownHours) {
      return { canShow: false, reason: 'Cooldown period active' };
    }
  }

  return { canShow: true, reason: null };
}

export function getPaywallCooldownRemaining(userId: string, context: PaywallContextType): number {
  const moment = PAYWALL_MOMENTS[context];
  const history = getPaywallHistory(userId);
  const lastShow = history.filter((h) => h.context === context).pop();

  if (!lastShow) {
    return 0;
  }

  const cooldownMs = moment.cooldownHours * 60 * 60 * 1000;
  const remainingMs = lastShow.shownAt + cooldownMs - Date.now();
  return Math.max(0, remainingMs);
}

export function evaluateTrigger(userId: string, condition: PaywallTriggerCondition, tier: SubscriptionTier = 'FREE'): { shouldShow: boolean; context: PaywallContextType | null } {
  switch (condition.type) {
    case 'STUDY_PLAN_CREATE_ATTEMPT': {
      const { show, context } = shouldShowPaywall(tier, 'maxActiveStudyPlans');
      if (show && context) {
        const canShow = canShowPaywall(userId, context);
        return { shouldShow: canShow.canShow, context };
      }
      return { shouldShow: false, context: null };
    }

    case 'BOSS_BOUNTY_PLACE_ATTEMPT': {
      const { show, context } = shouldShowPaywall(tier, 'bossBounties');
      if (show && context) {
        const canShow = canShowPaywall(userId, context);
        return { shouldShow: canShow.canShow, context };
      }
      return { shouldShow: false, context: null };
    }

    case 'STREAK_BREAK_NO_INSURANCE': {
      // Always show streak insurance paywall on break if no insurance
      const context: PaywallContextType = 'STREAK_INSURANCE';
      const canShow = canShowPaywall(userId, context);
      return { shouldShow: canShow.canShow, context };
    }

    case 'ANALYTICS_VIEW_ATTEMPT': {
      const { show, context } = shouldShowPaywall(tier, 'studyAnalytics');
      if (show && context) {
        const canShow = canShowPaywall(userId, context);
        return { shouldShow: canShow.canShow, context };
      }
      return { shouldShow: false, context: null };
    }

    case 'PERSONALITY_SWITCH_ATTEMPT': {
      const { show, context } = shouldShowPaywall(tier, 'personalitySelection');
      if (show && context) {
        const canShow = canShowPaywall(userId, context);
        return { shouldShow: canShow.canShow, context };
      }
      return { shouldShow: false, context: null };
    }

    case 'SQUAD_JOIN_ATTEMPT': {
      const { show, context } = shouldShowPaywall(tier, 'maxSquads');
      if (show && context) {
        const canShow = canShowPaywall(userId, context);
        return { shouldShow: canShow.canShow, context };
      }
      return { shouldShow: false, context: null };
    }

    case 'COSMETIC_PREVIEW_ATTEMPT': {
      const context: PaywallContextType = 'EXCLUSIVE_COSMETIC';
      const canShow = canShowPaywall(userId, context);
      return { shouldShow: canShow.canShow, context };
    }

    case 'FEATURE_CLICK': {
      // Map feature clicks to appropriate contexts
      const featureMap: Record<string, PaywallContextType> = {
        advanced_ai: 'ADVANCED_AI',
        beta: 'BETA_FEATURE',
      };
      const context = featureMap[condition.feature];
      if (context) {
        const canShow = canShowPaywall(userId, context);
        return { shouldShow: canShow.canShow, context };
      }
      return { shouldShow: false, context: null };
    }

    default:
      return { shouldShow: false, context: null };
  }
}