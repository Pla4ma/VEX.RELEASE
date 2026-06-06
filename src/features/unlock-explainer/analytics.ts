import * as Sentry from '@sentry/react-native';
import type { UnlockDecision } from './types';

export function trackUnlockDecisionResolved(decision: UnlockDecision): void {
  try {
    Sentry.addBreadcrumb({
      category: 'unlock-explainer',
      message: 'unlock_decision_resolved',
      data: {
        featureKey: decision.featureKey,
        decision: decision.decision,
        reasonCode: decision.reasonCode,
      },
      level: 'info',
    });
  } catch {
    // analytics failure must not break app flow
  }
}

export function trackUnlockDecisionDismissed(featureKey: string): void {
  try {
    Sentry.addBreadcrumb({
      category: 'unlock-explainer',
      message: 'unlock_decision_dismissed',
      data: { featureKey },
      level: 'info',
    });
  } catch {
    // analytics failure must not break app flow
  }
}
