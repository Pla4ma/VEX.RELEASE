/**
 * GatedScreen Component
 *
 * Wraps a screen component with feature gating and navigation fallback.
 * Uses 'navigation' mode to check canNavigate && canRegisterRoute.
 */

import React from 'react';
import { FeatureGate } from './FeatureGate';
import { NavigationGate } from './NavigationGate';
import type { FeatureKey } from '../liveops-config/feature-access';
import type { ExtendedRootStackParams } from '../../navigation/types';

interface GatedScreenProps {
  feature: FeatureKey;
  featureName: string;
  children: React.ReactNode;
  fallbackRoute?: keyof ExtendedRootStackParams;
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
      mode="navigation"
      fallback={
        <NavigationGate
          featureName={featureName}
          featureReason="currently disabled"
          suggestedAction={fallbackAction}
          suggestedRoute={fallbackRoute}
        />
      }
    >
      {children}
    </FeatureGate>
  );
}
