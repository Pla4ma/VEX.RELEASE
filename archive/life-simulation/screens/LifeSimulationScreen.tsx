/**
 * Life Simulation Screen
 * 
 * Full-screen container for life simulation features including avatar management,
 * life events, career progression, relationships, achievements, and life statistics.
 */

import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { LifeSimulation } from '../components/LifeSimulation';
import { LifeSimulationLoading } from '../components/LifeSimulationLoading';
import { LifeSimulationError } from '../components/LifeSimulationError';
import { useLifeSimulation } from '../hooks/useLifeSimulation';

export function LifeSimulationScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { userId } = route.params as { userId: string };
  const { loading, error, initialize, clearError } = useLifeSimulation(userId);

  useEffect(() => {
    navigation.setOptions({
      title: 'Life Simulation',
      headerStyle: {
        backgroundColor: '#9B59B6',
      },
      headerTintColor: '#FFFFFF',
      headerTitleStyle: {
        fontWeight: '600',
      },
    });
  }, [navigation]);

  useEffect(() => {
    initialize();
  }, [initialize]);

  const handleCreateAvatar = () => {
    navigation.navigate('AvatarCreation', { userId });
  };

  const handleManageCareer = () => {
    navigation.navigate('CareerManagement', { userId });
  };

  const handleManageRelationships = () => {
    navigation.navigate('RelationshipManagement', { userId });
  };

  const handleViewAchievements = () => {
    navigation.navigate('AchievementsView', { userId });
  };

  const handleLifeEventAction = (eventId: string, action: string) => {
    // Handle life event actions
    console.log(`Life event ${eventId} action: ${action}`);
  };

  if (loading) {
    return <LifeSimulationLoading />;
  }

  if (error) {
    return (
      <LifeSimulationError
        error={error}
        onRetry={initialize}
        onDismiss={clearError}
      />
    );
  }

  return (
    <View style={styles.container}>
      <LifeSimulation
        userId={userId}
        onCreateAvatar={handleCreateAvatar}
        onManageCareer={handleManageCareer}
        onManageRelationships={handleManageRelationships}
        onViewAchievements={handleViewAchievements}
        onLifeEventAction={handleLifeEventAction}
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
