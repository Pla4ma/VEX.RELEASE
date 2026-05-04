/**
 * AR/VR Environments Screen
 * 
 * Full-screen implementation for AR/VR environments with navigation,
 * header, and comprehensive feature access.
 */

import React, { useState, useEffect } from 'react';
import { View, StyleSheet, SafeAreaView, StatusBar } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { AREnvironments } from '../components/AREnvironments';
import { Loading } from '../../../components/states/Loading';
import { ErrorState } from '../../../components/states/ErrorState';
import { EmptyState } from '../../../components/EmptyState';

interface AREnvironmentsScreenProps {
  userId: string;
}

type RouteParams = {
  userId?: string;
  tab?: 'overview' | 'workspaces' | 'experiences' | 'collaboration' | 'devices';
};

export function AREnvironmentsScreen({ userId }: AREnvironmentsScreenProps) {
  const route = useRoute();
  const navigation = useNavigation();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string>(userId);

  const routeParams = route.params as RouteParams;

  useEffect(() => {
    // Set up screen
    navigation.setOptions({
      title: 'AR/VR Environments',
      headerStyle: {
        backgroundColor: '#FFFFFF',
      },
      headerTintColor: '#2C3E50',
      headerTitleStyle: {
        fontWeight: 'bold',
        fontSize: 18,
      },
    });

    // Handle route parameters
    if (routeParams?.userId) {
      setCurrentUserId(routeParams.userId);
    }

    // Simulate initial loading
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, [navigation, routeParams?.userId]);

  const handleWorkspacePress = (workspace: any) => {
    // Navigate to workspace detail
    navigation.navigate('ARVRWorkspaceDetail', { workspaceId: workspace.id });
  };

  const handleExperiencePress = (experience: any) => {
    // Navigate to experience detail
    navigation.navigate('ARVRExperienceDetail', { experienceId: experience.id });
  };

  const handleCollaborationPress = (space: any) => {
    // Navigate to collaboration space detail
    navigation.navigate('ARVRCollaborationDetail', { spaceId: space.id });
  };

  const handleRetry = () => {
    setIsLoading(true);
    setError(null);
    
    // Retry loading
    setTimeout(() => {
      setIsLoading(false);
    }, 1000);
  };

  const handleDismiss = () => {
    setError(null);
    navigation.goBack();
  };

  // Loading state
  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
        <Loading message="Loading AR/VR Environments..." />
      </SafeAreaView>
    );
  }

  // Error state
  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
        <ErrorState
          title="AR/VR Environments Error"
          message={error}
          onRetry={handleRetry}
          onDismiss={handleDismiss}
        />
      </SafeAreaView>
    );
  }

  // Main content
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <AREnvironments
        userId={currentUserId}
        onWorkspacePress={handleWorkspacePress}
        onExperiencePress={handleExperiencePress}
        onCollaborationPress={handleCollaborationPress}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
});
