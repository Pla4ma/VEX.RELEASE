import type { PaywallContextType } from './PremiumTierSystem';

export type PaywallTriggerCondition =
  | { type: 'COACH_MEMORY_REQUEST' }
  | { type: 'ADVANCED_STUDY_ATTEMPT' }
  | { type: 'INTELLIGENCE_VIEW_ATTEMPT' }
  | { type: 'VISUAL_IDENTITY_ATTEMPT' }
  | { type: 'PREMIUM_MODE_SELECT_ATTEMPT' }
  | { type: 'RECOVERY_PLAN_ATTEMPT' }
  | { type: 'STUDY_PLAN_CREATE_ATTEMPT'; currentPlanCount: number };

export interface PaywallMoment {
  context: PaywallContextType;
  triggerCondition: PaywallTriggerCondition;
  priority: number;
  cooldownHours: number;
  maxShowsPerDay: number;
  respectDND: boolean;
}

export const PAYWALL_MOMENTS: Record<PaywallContextType, PaywallMoment> = {
  DEEP_COACH_MEMORY: {
    context: 'DEEP_COACH_MEMORY',
    triggerCondition: { type: 'COACH_MEMORY_REQUEST' },
    priority: 9, cooldownHours: 48, maxShowsPerDay: 1, respectDND: true,
  },
  ADVANCED_STUDY_OS: {
    context: 'ADVANCED_STUDY_OS',
    triggerCondition: { type: 'ADVANCED_STUDY_ATTEMPT' },
    priority: 8, cooldownHours: 48, maxShowsPerDay: 1, respectDND: true,
  },
  PROGRESS_INTELLIGENCE: {
    context: 'PROGRESS_INTELLIGENCE',
    triggerCondition: { type: 'INTELLIGENCE_VIEW_ATTEMPT' },
    priority: 7, cooldownHours: 24, maxShowsPerDay: 1, respectDND: true,
  },
  VISUAL_IDENTITY: {
    context: 'VISUAL_IDENTITY',
    triggerCondition: { type: 'VISUAL_IDENTITY_ATTEMPT' },
    priority: 5, cooldownHours: 72, maxShowsPerDay: 1, respectDND: true,
  },
  PREMIUM_SESSION_MODES: {
    context: 'PREMIUM_SESSION_MODES',
    triggerCondition: { type: 'PREMIUM_MODE_SELECT_ATTEMPT' },
    priority: 6, cooldownHours: 48, maxShowsPerDay: 1, respectDND: true,
  },
  RECOVERY_PLANNING: {
    context: 'RECOVERY_PLANNING',
    triggerCondition: { type: 'RECOVERY_PLAN_ATTEMPT' },
    priority: 10, cooldownHours: 168, maxShowsPerDay: 1, respectDND: false,
  },
  STUDY_PLAN_LIMIT: {
    context: 'STUDY_PLAN_LIMIT',
    triggerCondition: { type: 'STUDY_PLAN_CREATE_ATTEMPT', currentPlanCount: 1 },
    priority: 4, cooldownHours: 24, maxShowsPerDay: 1, respectDND: true,
  },
};
