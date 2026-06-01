import { useCallback, useMemo } from 'react';

import { computeFeatureSafetyGates, isPremiumGatedFeature } from './safety';
import { createUnlockDecision } from './service';
import { useUnlockExplainerStore } from './store';
import type { UnlockDecision, UnlockExplainerInput } from './types';

export function useUnlockDecision(input: UnlockExplainerInput): UnlockDecision {
  return useMemo(() => createUnlockDecision(input), [input]);
}

export interface UnlockWithHide {
  /** The unlock decision from the service */
  decision: UnlockDecision;
  /** Whether user has explicitly hidden this feature */
  isHiddenByUser: boolean;
  /** Safety gates for rendering, navigation, queries, subscriptions, notifications */
  safety: ReturnType<typeof computeFeatureSafetyGates>;
  /** Hide this feature. Becomes fully inert. */
  hide: () => void;
  /** Reconsider a hidden feature. Restores natural unlock state. */
  reconsider: () => void;
}

/**
 * Full unlock decision + hide/reconsider + safety gates.
 *
 * Consumes the Zustand store for persistent hide state and the unlock service
 * for feature availability decisions.
 */
export function useUnlockWithHide(input: UnlockExplainerInput): UnlockWithHide {
  const decision = useUnlockDecision(input);
  const hiddenFeatureKeys = useUnlockExplainerStore((s) => s.hiddenFeatureKeys);
  const hideFeature = useUnlockExplainerStore((s) => s.hideFeature);
  const reconsiderFeature = useUnlockExplainerStore((s) => s.reconsiderFeature);

  const isHiddenByUser = hiddenFeatureKeys.includes(input.featureKey);
  const isDegradedPremium =
    isPremiumGatedFeature(input.featureKey) &&
    input.isPremium === false &&
    decision.decision === 'degraded';

  const safety = useMemo(
    () =>
      computeFeatureSafetyGates(decision, isHiddenByUser, isDegradedPremium),
    [decision, isHiddenByUser, isDegradedPremium],
  );

  const hide = useCallback(
    () => hideFeature(input.featureKey),
    [hideFeature, input.featureKey],
  );

  const reconsider = useCallback(
    () => reconsiderFeature(input.featureKey),
    [reconsiderFeature, input.featureKey],
  );

  return useMemo(
    () => ({
      decision,
      isHiddenByUser,
      safety,
      hide,
      reconsider,
    }),
    [decision, isHiddenByUser, safety, hide, reconsider],
  );
}
