export { createUnlockDecision } from './unlock-decision';
import type { UnlockDecision } from './types';

export function getUnlockExplainerCopy(decision: UnlockDecision): {
  body: string;
  cta: string | null;
  title: string;
} {
  const base = {
    body: decision.userFacingReason,
    cta: decision.canHide ? 'Got it' : null,
    title:
      decision.decision === 'unlocked'
        ? `${decision.featureKey} unlocked`
        : decision.decision === 'teased'
          ? `${decision.featureKey} coming soon`
          : decision.decision === 'blocked'
            ? `${decision.featureKey} unavailable`
            : '',
  };
  return base;
}

export function isFeatureVisible(decision: UnlockDecision): boolean {
  return decision.decision !== 'hidden';
}
