/**
 * Neuro Productivity Screen
 * 
 * Full-screen implementation for neuro productivity with navigation,
 * header, and comprehensive feature access.
 */

import React, { useState, useEffect } from 'react';
import { View, StyleSheet, SafeAreaView, StatusBar } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { NeuroProductivity } from '../components/NeuroProductivity';
import { Loading } from '../../../components/states/Loading';
import { ErrorState } from '../../../components/states/ErrorState';
import { EmptyState } from '../../../components/EmptyState';

interface NeuroProductivityScreenProps {
  userId: string;
}

type RouteParams = {
  userId?: string;
  sessionId?: string;
  tab?: 'overview' | 'sessions' | 'devices' | 'enhancements';
};

export function NeuroProductivityScreen({ userId }: NeuroProductivityScreenProps) {
  const route = useRoute();
  const navigation = useNavigation();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string>(userId);

  const routeParams = route.params as RouteParams;

  useEffect(() => {
    // Set up screen
    navigation.setOptions({
      title: 'Neuro Productivity',
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
    navigation.navigate('NeuroSessionDetail', { sessionId: session.id });
  };

  const handleDevicePress = (device: any) => {
    // Navigate to device detail
    navigation.navigate('NeuroDeviceDetail', { deviceId: device.id });
  };

  const handleProtocolPress = (protocol: any) => {
    // Navigate to protocol detail
    navigation.navigate('NeuroProtocolDetail', { protocolId: protocol.id });
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
        <Loading message="Loading Neuro Productivity..." />
      </SafeAreaView>
    );
  }

  // Error state
  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
        <ErrorState
          title="Neuro Productivity Error"
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
      <NeuroProductivity
        userId={currentUserId}
        onSessionPress={handleSessionPress}
        onDevicePress={handleDevicePress}
        onProtocolPress={handleProtocolPress}
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
