/**
 * Quantum Algorithms Screen
 * 
 * Full-screen container for the Quantum Algorithms feature.
 * Handles navigation, initial loading states, and error display.
 */

import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { QuantumAlgorithms } from '../components/QuantumAlgorithms';
import { QuantumAlgorithmsLoading } from '../components/QuantumAlgorithmsLoading';
import { QuantumAlgorithmsError } from '../components/QuantumAlgorithmsError';
import { useQuantumAlgorithms } from '../hooks/useQuantumAlgorithms';

type RouteParams = {
  userId?: string;
  algorithmId?: string;
  hardwareId?: string;
};

export function QuantumAlgorithmsScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const params = (route.params as RouteParams) || {};
  
  const {
    loading,
    error,
    algorithms,
    hardware,
    initialize,
    refresh,
    clearError,
  } = useQuantumAlgorithms();

  const userId = params.userId || 'default_user';

  useEffect(() => {
    // Set navigation title
    navigation.setOptions({
      title: 'Quantum Algorithms',
      headerStyle: {
        backgroundColor: '#3498DB',
      },
      headerTintColor: '#FFFFFF',
      headerTitleStyle: {
        fontWeight: '600',
      },
    });

    // Initialize data
    initialize();
  }, [navigation, initialize]);

  const handleAlgorithmPress = (algorithm: any) => {
    navigation.navigate('QuantumAlgorithmDetails', {
      algorithmId: algorithm.id,
      userId,
    });
  };

  const handleHardwarePress = (hardware: any) => {
    navigation.navigate('QuantumHardwareDetails', {
      hardwareId: hardware.id,
      userId,
    });
  };

  const handleJobPress = (job: any) => {
    navigation.navigate('QuantumJobDetails', {
      jobId: job.id,
      userId,
    });
  };

  const handleModelPress = (model: any) => {
    navigation.navigate('QuantumModelDetails', {
      modelId: model.id,
      userId,
    });
  };

  // Show loading state on initial load
  if (loading && algorithms.length === 0) {
    return <QuantumAlgorithmsLoading />;
  }

  // Show error state
  if (error) {
    return (
      <QuantumAlgorithmsError
        error={error}
        onRetry={refresh}
        onDismiss={clearError}
      />
    );
  }

  // Show main content
  return (
    <View style={styles.container}>
      <QuantumAlgorithms
        userId={userId}
        onAlgorithmPress={handleAlgorithmPress}
        onHardwarePress={handleHardwarePress}
        onJobPress={handleJobPress}
        onModelPress={handleModelPress}
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
