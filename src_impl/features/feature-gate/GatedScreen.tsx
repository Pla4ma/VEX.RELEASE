/**
 * GatedScreen Component
 *
 * Wraps a screen component with feature gating and navigation fallback.
 */

import React from 'react';
import { FeatureGate, NavigationGate } from './FeatureGate';
import type { FeatureKey } from '../liveops-config/feature-access';

interface GatedScreenProps {
  feature: FeatureKey;
  featureName: string;
  children: React.ReactNode;
  fallbackRoute?: string;
  fallbackAction?: string;
}

export function GatedScreen({
  feature,
  featureName,
  children,
  fallbackRoute = 'Main',
  fallbackAction = 'Return to Home',
}: GatedScreenProps): JSX.Element {
  return (
    <FeatureGate
      feature={feature}
      fallback={
        <NavigationGate
          featureName={featureName}
          featureReason="currently disabled"
          suggestedAction={fallbackAction}
          suggestedRoute={fallbackRoute as any}
        />
      }
    >
      {children}
    </FeatureGate>
  );
}
