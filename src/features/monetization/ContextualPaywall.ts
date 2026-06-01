import {
  type SubscriptionTier,
  type PaywallContextType,
  shouldShowPaywall,
  isPremium,
} from './PremiumTierSystem';
import { getPaywallContext, type PaywallContextData } from './paywall-contexts';
import {
  PAYWALL_MOMENTS,
  type PaywallMoment,
  type PaywallTriggerCondition,
} from './paywall-moments';

export type { PaywallMoment, PaywallTriggerCondition };
export { PAYWALL_MOMENTS };

interface PaywallShowRecord {
  context: PaywallContextType;
  shownAt: number;
  dismissed: boolean;
  converted: boolean;
}

const paywallHistory = new Map<string, PaywallShowRecord[]>();

export function recordPaywallShow(
  userId: string,
  context: PaywallContextType,
  dismissed = false,
  converted = false,
): void {
  const history = paywallHistory.get(userId) ?? [];
  history.push({ context, shownAt: Date.now(), dismissed, converted });
  paywallHistory.set(userId, history);
}

export function getPaywallHistory(userId: string): PaywallShowRecord[] {
  return paywallHistory.get(userId) ?? [];
}

export function canShowPaywall(
  userId: string,
  context: PaywallContextType,
  isInSession = false,
): { canShow: boolean; reason: string | null } {
  const moment = PAYWALL_MOMENTS[context];
  const history = getPaywallHistory(userId);
  const now = Date.now();

  if (isPremium(userId))
    {return { canShow: false, reason: 'User is already premium' };}
  if (isInSession && moment.respectDND)
    {return {
      canShow: false,
      reason: 'Respecting Do Not Disturb during session',
    };}

  const todayShows = history.filter(
    (h) => h.context === context && h.shownAt > now - 24 * 60 * 60 * 1000,
  );
  if (todayShows.length >= moment.maxShowsPerDay) {
    return { canShow: false, reason: 'Daily frequency limit reached' };
  }

  const lastShow = history.filter((h) => h.context === context).pop();
  if (lastShow) {
    const hoursSinceLastShow = (now - lastShow.shownAt) / (1000 * 60 * 60);
    if (hoursSinceLastShow < moment.cooldownHours) {
      return { canShow: false, reason: 'Cooldown period active' };
    }
  }
  return { canShow: true, reason: null };
}

export function getPaywallCooldownRemaining(
  userId: string,
  context: PaywallContextType,
): number {
  const moment = PAYWALL_MOMENTS[context];
  const history = getPaywallHistory(userId);
  const lastShow = history.filter((h) => h.context === context).pop();
  if (!lastShow) {return 0;}
  return Math.max(
    0,
    lastShow.shownAt + moment.cooldownHours * 60 * 60 * 1000 - Date.now(),
  );
}

const TRIGGER_FEATURE_MAP: Record<string, string> = {
  COACH_MEMORY_REQUEST: 'deepCoachMemory',
  ADVANCED_STUDY_ATTEMPT: 'advancedStudyOS',
  INTELLIGENCE_VIEW_ATTEMPT: 'progressIntelligence',
  VISUAL_IDENTITY_ATTEMPT: 'visualIdentity',
  PREMIUM_MODE_SELECT_ATTEMPT: 'premiumSessionModes',
  RECOVERY_PLAN_ATTEMPT: 'recoveryPlanning',
  STUDY_PLAN_CREATE_ATTEMPT: 'maxActiveStudyPlans',
};

export function evaluateTrigger(
  userId: string,
  condition: PaywallTriggerCondition,
  tier: SubscriptionTier = 'free',
): { shouldShow: boolean; context: PaywallContextType | null } {
  const feature = TRIGGER_FEATURE_MAP[condition.type];
  if (!feature) {return { shouldShow: false, context: null };}
  const { show, context } = shouldShowPaywall(
    tier,
    feature as 'deepCoachMemory',
  );
  if (!show || !context) {return { shouldShow: false, context: null };}
  const result = canShowPaywall(userId, context);
  return {
    shouldShow: result.canShow,
    context: result.canShow ? context : null,
  };
}

export function selectBestPaywall(
  userId: string,
  availableContexts: PaywallContextType[],
): { context: PaywallContextType; data: PaywallContextData } | null {
  const validContexts = availableContexts.filter(
    (ctx) => canShowPaywall(userId, ctx).canShow,
  );
  if (validContexts.length === 0) {return null;}
  validContexts.sort(
    (a, b) =>
      (PAYWALL_MOMENTS[b]?.priority ?? 0) - (PAYWALL_MOMENTS[a]?.priority ?? 0),
  );
  const selected = validContexts[0]!;
  return { context: selected, data: getPaywallContext(selected) };
}

export {
  recordConversion,
  getConversionRate,
  getBestConvertingContext,
} from './conversion-tracking';

export function shouldPreventPaywall(
  userId: string,
  sessionsCompleted: number,
  isOnboarding: boolean,
  isFirstSession: boolean,
): { prevent: boolean; reason: string | null } {
  if (isOnboarding) {return { prevent: true, reason: 'Onboarding in progress' };}
  if (isFirstSession) {return { prevent: true, reason: 'First session' };}
  if (sessionsCompleted < 1)
    {return { prevent: true, reason: 'Not enough sessions completed' };}
  const history = getPaywallHistory(userId);
  const last24h = history.filter(
    (h) => h.shownAt > Date.now() - 24 * 60 * 60 * 1000 && h.dismissed,
  );
  if (last24h.length >= 3)
    {return { prevent: true, reason: 'Paywall fatigue detected' };}
  return { prevent: false, reason: null };
}
