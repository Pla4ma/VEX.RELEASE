/**
 * Navigation Guard Component
 * 
 * Guards navigation to features based on feature flags.
 * Prevents access to disabled features and shows appropriate messages.
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { isFeatureEnabled, isFeatureDisabled, isFeatureOptional } from '../../constants/features';

interface NavigationGuardProps {
  feature: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function NavigationGuard({ feature, children, fallback }: NavigationGuardProps) {
  let isEnabled = false;
  let isDisabled = false;
  let isOptional = false;

  // Handle feature flag errors gracefully
  try {
    isEnabled = isFeatureEnabled(feature);
    isDisabled = isFeatureDisabled(feature);
    isOptional = isFeatureOptional(feature);
  } catch (error) {
    // Default to showing unavailable message on error
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Feature not available</Text>
        <Text style={styles.message}>This feature is not currently available</Text>
      </View>
    );
  }

  // Allow access to enabled features
  if (isEnabled) {
    return <>{children}</>;
  }

  // Show fallback if provided
  if (fallback) {
    return <>{fallback}</>;
  }

  // Show appropriate message for disabled/optional features
  if (isDisabled) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Feature not available</Text>
        <Text style={styles.message}>This feature is currently disabled</Text>
        <Text style={styles.submessage}>
          {getFeatureDisplayName(feature)} will be available in a future update
        </Text>
      </View>
    );
  }

  // Show message for optional features
  if (isOptional) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Feature not available</Text>
        <Text style={styles.message}>This feature is not yet available</Text>
        <Text style={styles.submessage}>
          {getFeatureDisplayName(feature)} will be available soon
        </Text>
      </View>
    );
  }

  // Default fallback for unknown features
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Feature not available</Text>
      <Text style={styles.message}>This feature is not currently available</Text>
    </View>
  );
}

function getFeatureDisplayName(feature: string): string {
  const displayNames: Record<string, string> = {
    'social-feed': 'Social Feed',
    'duels': 'Duels',
    'rankings': 'Rankings',
    'squad-wars': 'Squad Wars',
    'rivals': 'Rivals',
    'trading': 'Trading',
    'boss': 'Boss Battles',
    'challenges': 'Challenges',
    'squads': 'Squads',
    'monthly-report': 'Monthly Reports',
    'emergency-gem-sinks': 'Emergency Gem Sinks',
    'complex-crafting': 'Complex Crafting',
    'ar-experimental': 'AR Features',
  };

  return displayNames[feature] || feature;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  message: {
    fontSize: 16,
    marginBottom: 4,
    textAlign: 'center',
    opacity: 0.8,
  },
  submessage: {
    fontSize: 14,
    textAlign: 'center',
    opacity: 0.6,
  },
});