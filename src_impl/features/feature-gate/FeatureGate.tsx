/**
 * FeatureGate Component
 *
 * Conditionally renders children based on feature access.
 * Used to hide disabled features throughout the app.
 */

import React from 'react';
import { useFeatureAccess } from '../liveops-config/hooks/useFeatureAccess';
import type { FeatureKey } from '../liveops-config/feature-access';

interface FeatureGateProps {
  feature: FeatureKey;
  children: React.ReactNode;
  fallback?: React.ReactNode;
  requireUnlocked?: boolean;
  requireVisible?: boolean;
}

export function FeatureGate({
  feature,
  children,
  fallback = null,
  requireUnlocked = true,
  requireVisible = true,
}: FeatureGateProps): JSX.Element | null {
  const { features } = useFeatureAccess();
  const featureAccess = features[feature];

  // Check if feature meets requirements
  const meetsRequirements =
    (!requireUnlocked || featureAccess.isUnlocked) &&
    (!requireVisible || featureAccess.isVisible);

  return meetsRequirements ? <>{children}</> : <>{fallback}</>;
}

/**
 * Higher-order component that wraps a screen with feature gating
 */
export function withFeatureGate<P extends object>(
  feature: FeatureKey,
  WrappedComponent: React.ComponentType<P>,
  options: {
    fallback?: React.ComponentType<P>;
    requireUnlocked?: boolean;
    requireVisible?: boolean;
  } = {}
) {
  const { fallback: FallbackComponent, requireUnlocked = true, requireVisible = true } = options;

  return function FeatureGateWrapper(props: P): JSX.Element {
    return (
      <FeatureGate
        feature={feature}
        requireUnlocked={requireUnlocked}
        requireVisible={requireVisible}
        fallback={FallbackComponent ? <FallbackComponent {...props} /> : null}
      >
        <WrappedComponent {...props} />
      </FeatureGate>
    );
  };
}
