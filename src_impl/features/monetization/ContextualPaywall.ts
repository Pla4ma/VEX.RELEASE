/**
 * Contextual Paywall System
 *
 * Phase 4.1 - Paywall Strategy Redesign
 * Contextual paywall moments that appear at the right time
 * (not randomly, not during onboarding, not during first session)
 *
 * Contextual Moments:
 * - When trying to create 2nd study plan
 * - When boss bounty requires premium
 * - When streak breaks and no insurance (offer subscription)
 * - When study analytics requested
 *
 * Dependencies:
 * - PremiumTierSystem (feature gating)
 * - PaywallStateMachine (presentation)
 * - Content Study (plan creation)
 * - Boss (bounty system)
 * - Streaks (insurance)
 */

import { type SubscriptionTier, type PaywallContextType, shouldShowPaywall, getPaywallContext, isPremium, type PaywallContextData } from "./PremiumTierSystem";

// ============================================================================
// Contextual Paywall Rules
// ============================================================================

export interface PaywallMoment {
  context: PaywallContextType;
  triggerCondition: PaywallTriggerCondition;
  priority: number; // 1-10, higher = more likely to show
  cooldownHours: number; // Hours before this paywall can show again
  maxShowsPerDay: number;
  respectDND: boolean; // Don't show during "Do Not Disturb" sessions
}

export type PaywallTriggerCondition = { type: "STUDY_PLAN_CREATE_ATTEMPT"; currentPlanCount: number } | { type: "BOSS_BOUNTY_PLACE_ATTEMPT" } | { type: "STREAK_BREAK_NO_INSURANCE"; daysLost: number } | { type: "ANALYTICS_VIEW_ATTEMPT" } | { type: "PERSONALITY_SWITCH_ATTEMPT" } | { type: "SQUAD_JOIN_ATTEMPT"; currentSquadCount: number } | { type: "COSMETIC_PREVIEW_ATTEMPT"; cosmeticId: string } | { type: "FEATURE_CLICK"; feature: string };

// Define when each paywall context can trigger
export const PAYWALL_MOMENTS: Record<PaywallContextType, PaywallMoment> = {
  STUDY_PLAN_LIMIT: {
    context: "STUDY_PLAN_LIMIT",
    triggerCondition: { type: "STUDY_PLAN_CREATE_ATTEMPT", currentPlanCount: 1 },
    priority: 9,
    cooldownHours: 24,
    maxShowsPerDay: 1,
    respectDND: true,
  },
  BOSS_BOUNTY: {
    context: "BOSS_BOUNTY",
    triggerCondition: { type: "BOSS_BOUNTY_PLACE_ATTEMPT" },
    priority: 7,
    cooldownHours: 48,
    maxShowsPerDay: 1,
    respectDND: true,
  },
  STREAK_INSURANCE: {
    context: "STREAK_INSURANCE",
    triggerCondition: { type: "STREAK_BREAK_NO_INSURANCE", daysLost: 0 },
    priority: 10, // Highest - user just lost something
    cooldownHours: 168, // 1 week - only on actual streak break
    maxShowsPerDay: 1,
    respectDND: false, // Always show when streak breaks
  },
  PERSONALITY_SELECT: {
    context: "PERSONALITY_SELECT",
    triggerCondition: { type: "PERSONALITY_SWITCH_ATTEMPT" },
    priority: 5,
    cooldownHours: 72,
    maxShowsPerDay: 1,
    respectDND: true,
  },
  ANALYTICS_REQUEST: {
    context: "ANALYTICS_REQUEST",
    triggerCondition: { type: "ANALYTICS_VIEW_ATTEMPT" },
    priority: 4,
    cooldownHours: 24,
    maxShowsPerDay: 2,
    respectDND: true,
  },
  SQUAD_LIMIT: {
    context: "SQUAD_LIMIT",
    triggerCondition: { type: "SQUAD_JOIN_ATTEMPT", currentSquadCount: 3 },
    priority: 6,
    cooldownHours: 24,
    maxShowsPerDay: 1,
    respectDND: true,
  },
  EXCLUSIVE_COSMETIC: {
    context: "EXCLUSIVE_COSMETIC",
    triggerCondition: { type: "COSMETIC_PREVIEW_ATTEMPT", cosmeticId: "" },
    priority: 3,
    cooldownHours: 48,
    maxShowsPerDay: 2,
    respectDND: true,
  },
  ADVANCED_AI: {
    context: "ADVANCED_AI",
    triggerCondition: { type: "FEATURE_CLICK", feature: "advanced_ai" },
    priority: 5,
    cooldownHours: 24,
    maxShowsPerDay: 1,
    respectDND: true,
  },
  BETA_FEATURE: {
    context: "BETA_FEATURE",
    triggerCondition: { type: "FEATURE_CLICK", feature: "beta" },
    priority: 2,
    cooldownHours: 72,
    maxShowsPerDay: 1,
    respectDND: true,
  },
};

// ============================================================================
// Paywall History Tracking
// ============================================================================

interface PaywallShowRecord {
  context: PaywallContextType;
  shownAt: number;
  dismissed: boolean;
  converted: boolean;
}

const paywallHistory = new Map<string, PaywallShowRecord[]>();

/**
 * Record paywall display
 */
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

/**
 * Get paywall history for user
 */
export function getPaywallHistory(userId: string): PaywallShowRecord[] {
  return paywallHistory.get(userId) || [];
}

/**
 * Check if paywall can be shown (cooldown, frequency)
 */
export function canShowPaywall(userId: string, context: PaywallContextType, isInSession: boolean = false): { canShow: boolean; reason: string | null } {
  const moment = PAYWALL_MOMENTS[context];
  const history = getPaywallHistory(userId);
  const now = Date.now();

  // Don't show if user is premium
  if (isPremium(userId)) {
    return { canShow: false, reason: "User is already premium" };
  }

  // Don't show during sessions if respectDND is true
  if (isInSession && moment.respectDND) {
    return { canShow: false, reason: "Respecting Do Not Disturb during session" };
  }

  // Check daily frequency
  const todayShows = history.filter((h) => h.context === context && h.shownAt > now - 24 * 60 * 60 * 1000);
  if (todayShows.length >= moment.maxShowsPerDay) {
    return { canShow: false, reason: "Daily frequency limit reached" };
  }

  // Check cooldown
  const lastShow = history.filter((h) => h.context === context).pop();
  if (lastShow) {
    const hoursSinceLastShow = (now - lastShow.shownAt) / (1000 * 60 * 60);
    if (hoursSinceLastShow < moment.cooldownHours) {
      return { canShow: false, reason: "Cooldown period active" };
    }
  }

  return { canShow: true, reason: null };
}

/**
 * Get time until paywall can be shown again
 */
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

// ============================================================================
// Trigger Conditions Evaluation
// ============================================================================

/**
 * Evaluate if a trigger condition should show paywall
 */
export function evaluateTrigger(userId: string, condition: PaywallTriggerCondition, tier: SubscriptionTier = "FREE"): { shouldShow: boolean; context: PaywallContextType | null } {
  switch (condition.type) {
    case "STUDY_PLAN_CREATE_ATTEMPT": {
      const { show, context } = shouldShowPaywall(tier, "maxActiveStudyPlans");
      if (show && context) {
        const canShow = canShowPaywall(userId, context);
        return { shouldShow: canShow.canShow, context };
      }
      return { shouldShow: false, context: null };
    }

    case "BOSS_BOUNTY_PLACE_ATTEMPT": {
      const { show, context } = shouldShowPaywall(tier, "bossBounties");
      if (show && context) {
        const canShow = canShowPaywall(userId, context);
        return { shouldShow: canShow.canShow, context };
      }
      return { shouldShow: false, context: null };
    }

    case "STREAK_BREAK_NO_INSURANCE": {
      // Always show streak insurance paywall on break if no insurance
      const context: PaywallContextType = "STREAK_INSURANCE";
      const canShow = canShowPaywall(userId, context);
      return { shouldShow: canShow.canShow, context };
    }

    case "ANALYTICS_VIEW_ATTEMPT": {
      const { show, context } = shouldShowPaywall(tier, "studyAnalytics");
      if (show && context) {
        const canShow = canShowPaywall(userId, context);
        return { shouldShow: canShow.canShow, context };
      }
      return { shouldShow: false, context: null };
    }

    case "PERSONALITY_SWITCH_ATTEMPT": {
      const { show, context } = shouldShowPaywall(tier, "personalitySelection");
      if (show && context) {
        const canShow = canShowPaywall(userId, context);
        return { shouldShow: canShow.canShow, context };
      }
      return { shouldShow: false, context: null };
    }

    case "SQUAD_JOIN_ATTEMPT": {
      const { show, context } = shouldShowPaywall(tier, "maxSquads");
      if (show && context) {
        const canShow = canShowPaywall(userId, context);
        return { shouldShow: canShow.canShow, context };
      }
      return { shouldShow: false, context: null };
    }

    case "COSMETIC_PREVIEW_ATTEMPT": {
      const context: PaywallContextType = "EXCLUSIVE_COSMETIC";
      const canShow = canShowPaywall(userId, context);
      return { shouldShow: canShow.canShow, context };
    }

    case "FEATURE_CLICK": {
      // Map feature clicks to appropriate contexts
      const featureMap: Record<string, PaywallContextType> = {
        advanced_ai: "ADVANCED_AI",
        beta: "BETA_FEATURE",
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

// ============================================================================
// Smart Paywall Selection
// ============================================================================

/**
 * Get the best paywall to show based on priority and history
 */
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

// ============================================================================
// Conversion Tracking
// ============================================================================

interface ConversionMetrics {
  userId: string;
  context: PaywallContextType;
  shownAt: number;
  converted: boolean;
  convertedAt?: number;
  dismissed: boolean;
  timeToDecide: number; // ms
}

const conversionMetrics: ConversionMetrics[] = [];

/**
 * Record conversion
 */
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

/**
 * Get conversion rate for a context
 */
export function getConversionRate(context: PaywallContextType): number {
  const metrics = conversionMetrics.filter((m) => m.context === context);
  if (metrics.length === 0) {
    return 0;
  }

  const conversions = metrics.filter((m) => m.converted).length;
  return conversions / metrics.length;
}

/**
 * Get best converting paywall context
 */
export function getBestConvertingContext(): PaywallContextType | null {
  const contexts: PaywallContextType[] = ["STUDY_PLAN_LIMIT", "BOSS_BOUNTY", "STREAK_INSURANCE", "PERSONALITY_SELECT", "ANALYTICS_REQUEST"];

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

// ============================================================================
// Paywall Prevention Rules
// ============================================================================

/**
 * Check if we should absolutely not show paywall (onboarding, first session, etc)
 */
export function shouldPreventPaywall(userId: string, sessionsCompleted: number, isOnboarding: boolean, isFirstSession: boolean): { prevent: boolean; reason: string | null } {
  // Never show during onboarding
  if (isOnboarding) {
    return { prevent: true, reason: "Onboarding in progress" };
  }

  // Never show during very first session
  if (isFirstSession) {
    return { prevent: true, reason: "First session" };
  }

  // Wait until user has completed at least 1 session
  if (sessionsCompleted < 1) {
    return { prevent: true, reason: "Not enough sessions completed" };
  }

  // Don't show if user dismissed 3+ paywalls in last 24h (fatigue)
  const history = getPaywallHistory(userId);
  const last24h = history.filter((h) => h.shownAt > Date.now() - 24 * 60 * 60 * 1000 && h.dismissed);
  if (last24h.length >= 3) {
    return { prevent: true, reason: "Paywall fatigue detected" };
  }

  return { prevent: false, reason: null };
}

// ============================================================================
// Exports
// ============================================================================

// Types are already exported via 'export interface' declarations above
