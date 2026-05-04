/**
 * Collaboration Screen
 * 
 * Full-screen implementation for realtime collaboration with navigation,
 * header, and comprehensive feature access.
 */

import React, { useState, useEffect } from 'react';
import { View, StyleSheet, SafeAreaView, StatusBar } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { Collaboration } from '../components/Collaboration';
import { Loading } from '../../../components/states/Loading';
import { ErrorState } from '../../../components/states/ErrorState';
import { EmptyState } from '../../../components/EmptyState';

interface CollaborationScreenProps {
  userId: string;
}

type RouteParams = {
  userId?: string;
  sessionId?: string;
  workspaceId?: string;
  tab?: 'sessions' | 'workspaces' | 'participants' | 'immersive';
};

export function CollaborationScreen({ userId }: CollaborationScreenProps) {
  const route = useRoute();
  const navigation = useNavigation();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string>(userId);

  const routeParams = route.params as RouteParams;

  useEffect(() => {
    // Set up screen
    navigation.setOptions({
      title: 'Realtime Collaboration',
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

  const handleSessionPress = (session: any) => {
    // Navigate to session detail
    navigation.navigate('SessionDetail', { sessionId: session.id });
  };

  const handleWorkspacePress = (workspace: any) => {
    // Navigate to workspace detail
    navigation.navigate('WorkspaceDetail', { workspaceId: workspace.id });
  };

  const handleParticipantPress = (participant: any) => {
    // Navigate to participant profile
    navigation.navigate('ParticipantProfile', { participantId: participant.id });
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
        <Loading message="Loading Collaboration..." />
      </SafeAreaView>
    );
  }

  // Error state
  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
        <ErrorState
          title="Collaboration Error"
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
      <Collaboration
        userId={currentUserId}
        onSessionPress={handleSessionPress}
        onWorkspacePress={handleWorkspacePress}
        onParticipantPress={handleParticipantPress}
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
