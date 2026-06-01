import { capture } from './index';

export interface FunnelStep {
  name: string;
  event: string;
  count: number;
  conversionRate: number;
  dropOffRate: number;
}

export interface Funnel {
  id: string;
  name: string;
  steps: FunnelStep[];
  totalConversionRate: number;
  averageTimeToConvert: number;
}

const ONBOARDING_FUNNEL_STEPS = [
  { name: 'App Open', event: 'app_opened' },
  { name: 'Started Onboarding', event: 'onboarding_started' },
  { name: 'Completed Profile', event: 'profile_completed' },
  { name: 'First Session Started', event: 'session_started' },
  { name: 'First Session Completed', event: 'session_completed' },
  { name: 'Joined Squad', event: 'squad_joined' },
];

export function trackFunnelEvent(
  funnelId: string,
  stepName: string,
  userId: string,
  metadata?: Record<string, unknown>,
): void {
  capture('funnel_step_completed', {
    funnel_id: funnelId,
    step_name: stepName,
    user_id: userId,
    ...metadata,
  } as Record<string, unknown>);
}

export function calculateFunnelMetrics(
  funnelId: string,
  stepCounts: number[],
): Funnel {
  const steps: FunnelStep[] = ONBOARDING_FUNNEL_STEPS.map((step, index) => {
    const count = stepCounts[index] ?? 0;
    const prevCount = index > 0 ? (stepCounts[index - 1] ?? count) : count;
    const conversionRate = prevCount > 0 ? (count / prevCount) * 100 : 0;
    const dropOffRate = 100 - conversionRate;
    return {
      name: step.name,
      event: step.event,
      count,
      conversionRate,
      dropOffRate,
    };
  });
  const first = stepCounts[0] ?? 0;
  const last = stepCounts[stepCounts.length - 1] ?? 0;
  const totalConversionRate = first > 0 ? (last / first) * 100 : 0;
  return {
    id: funnelId,
    name: 'Onboarding Funnel',
    steps,
    totalConversionRate,
    averageTimeToConvert: 0,
  };
}
