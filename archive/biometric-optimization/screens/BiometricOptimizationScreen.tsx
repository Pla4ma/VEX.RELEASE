/**
 * Biometric Optimization Screen
 * 
 * Full-screen container for the Biometric Optimization feature.
 * Handles navigation, initial loading states, and error display.
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { BiometricOptimization } from '../components/BiometricOptimization';
import { BiometricOptimizationLoading } from '../components/BiometricOptimizationLoading';
import { BiometricOptimizationError } from '../components/BiometricOptimizationError';

type BiometricOptimizationScreenRouteProp = RouteProp<
  { BiometricOptimization: { userId?: string } },
  'BiometricOptimization'
>;

type BiometricOptimizationScreenNavigationProp = StackNavigationProp<
  { BiometricOptimization: { userId?: string } },
  'BiometricOptimization'
>;

export function BiometricOptimizationScreen() {
  const route = useRoute<BiometricOptimizationScreenRouteProp>();
  const navigation = useNavigation<BiometricOptimizationScreenNavigationProp>();
  
  // Get userId from route params or use a default
  const userId = route.params?.userId || 'default-user';

  React.useEffect(() => {
    // Set screen title
    navigation.setOptions({
      title: 'Biometric Optimization',
      headerStyle: {
        backgroundColor: '#FFFFFF',
      },
      headerTintColor: '#2C3E50',
      headerTitleStyle: {
        fontWeight: '600',
        fontSize: 18,
      },
    });
  }, [navigation]);

  const handleHealthSessionPress = (sessionId: string) => {
    // Navigate to health session details
    navigation.navigate('HealthSession', { sessionId });
  };

  const handlePerformanceSessionPress = (sessionId: string) => {
    // Navigate to performance session details
    navigation.navigate('PerformanceSession', { sessionId });
  };

  const handleWellnessSessionPress = (sessionId: string) => {
    // Navigate to wellness session details
    navigation.navigate('WellnessSession', { sessionId });
  };

  const handleDevicePress = (deviceId: string) => {
    // Navigate to device details
    navigation.navigate('BiometricDevice', { deviceId });
  };

  const handleRecommendationPress = (recommendationId: string) => {
    // Navigate to recommendation details
    navigation.navigate('BiometricRecommendation', { recommendationId });
  };

  const handleGoalPress = (goalId: string) => {
    // Navigate to goal details
    navigation.navigate('BiometricGoal', { goalId });
  };

  const handleRetry = () => {
    // Retry loading the biometric optimization
    // This will be handled by the BiometricOptimization component
  };

  return (
    <View style={styles.container}>
      <BiometricOptimization
        userId={userId}
        onHealthSessionPress={handleHealthSessionPress}
        onPerformanceSessionPress={handlePerformanceSessionPress}
        onWellnessSessionPress={handleWellnessSessionPress}
        onDevicePress={handleDevicePress}
        onRecommendationPress={handleRecommendationPress}
        onGoalPress={handleGoalPress}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
});
