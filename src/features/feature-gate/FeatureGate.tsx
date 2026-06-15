/**
 * FeatureGate Component
 *
 * Conditionally renders children based on feature availability.
 * All checks go through getFeatureAvailability — never isUnlocked/isVisible alone.
 */

import React from 'react';
import { useFeatureGate, type FeatureGateMode } from './hooks';
import type { FeatureKey } from '../liveops-config/feature-access';

interface FeatureGateProps {
  feature: FeatureKey;
  children: React.ReactNode;
  fallback?: React.ReactNode;
  mode?: FeatureGateMode;
}

export function FeatureGate({
  feature,
  children,
  fallback = null,
  mode,
}: FeatureGateProps): React.ReactNode | null {
  const { isAvailable } = useFeatureGate(feature, mode);

  return isAvailable ? <>{children}</> : <>{fallback}</>;
}

/**
 * Higher-order component that wraps a screen with feature gating.
 */
export function withFeatureGate<P extends object>(
  feature: FeatureKey,
  WrappedComponent: React.ComponentType<P>,
  options: {
    fallback?: React.ComponentType<P>;
    mode?: FeatureGateMode;
  } = {},
) {
  const { fallback: FallbackComponent, mode } = options;

  return function FeatureGateWrapper(props: P): React.ReactNode {
    return (
      <FeatureGate
        feature={feature}
        mode={mode}
        fallback={FallbackComponent ? <FallbackComponent {...props} /> : null}
      >
        <WrappedComponent {...props} />
      </FeatureGate>
    );
  };
}
