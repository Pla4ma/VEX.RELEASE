/**
 * Predictive Analytics Screen
 * 
 * Full-screen implementation for AI-powered predictive analytics with navigation,
 * header, and comprehensive feature access.
 */

import React, { useState, useEffect } from 'react';
import { View, StyleSheet, SafeAreaView, StatusBar } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { PredictiveAnalytics } from '../components/PredictiveAnalytics';
import { Loading } from '../../../components/states/Loading';
import { ErrorState } from '../../../components/states/ErrorState';
import { EmptyState } from '../../../components/EmptyState';

interface PredictiveAnalyticsScreenProps {
  userId: string;
}

type RouteParams = {
  userId?: string;
  insightId?: string;
  tab?: 'insights' | 'quantum' | 'predictions';
};

export function PredictiveAnalyticsScreen({ userId }: PredictiveAnalyticsScreenProps) {
  const route = useRoute();
  const navigation = useNavigation();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string>(userId);

  const routeParams = route.params as RouteParams;

  useEffect(() => {
    // Set up screen
    navigation.setOptions({
      title: 'Predictive Analytics',
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

  const handleInsightPress = (insight: any) => {
    // Navigate to insight detail
    navigation.navigate('InsightDetail', { insightId: insight.id });
  };

  const handlePredictionPress = (prediction: any) => {
    // Navigate to prediction detail
    navigation.navigate('PredictionDetail', { predictionId: prediction.id });
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
        <Loading message="Loading Predictive Analytics..." />
      </SafeAreaView>
    );
  }

  // Error state
  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
        <ErrorState
          title="Analytics Error"
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
      <PredictiveAnalytics
        userId={currentUserId}
        onInsightPress={handleInsightPress}
        onPredictionPress={handlePredictionPress}
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
