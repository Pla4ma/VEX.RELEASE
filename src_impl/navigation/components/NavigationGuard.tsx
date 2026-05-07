/**
 * Navigation Guard Component
 *
 * Wraps screens with feature flag checks to hide disabled features.
 */

import React from 'react';
import { View, Text } from 'react-native';
import { useFeatureFlags } from '../../hooks/useFeatureFlags';
import { FEATURE_FLAGS } from '../../constants/features';
import { useTheme } from '../../theme';

interface NavigationGuardProps {
  featureFlag: keyof typeof FEATURE_FLAGS;
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
    return fallback ?? (
      <View style={styles.container}>
        <Text style={styles.text}>Feature not available</Text>
      </View>
    );
  }

  return <>{children}</>;
};

const styles = {
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  text: {
    fontSize: 16,
    textAlign: 'center',
    opacity: 0.6,
  },
};

