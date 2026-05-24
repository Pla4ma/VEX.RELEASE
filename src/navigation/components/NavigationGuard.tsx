/**
 * Navigation Guard Component
 *
 * Wraps screens with feature flag checks to hide disabled features.
 */

import React from 'react';

import { useFeatureFlags } from '../../hooks/useFeatureFlags';

interface NavigationGuardProps {
  featureFlag: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export const NavigationGuard: React.FC<NavigationGuardProps> = ({
  featureFlag,
  children,
  fallback,
}) => {
  const { isEnabled } = useFeatureFlags();
  const isFeatureEnabled = isEnabled(featureFlag);

  if (!isFeatureEnabled) {
    return fallback ?? null;
  }

  return <>{children}</>;
};
