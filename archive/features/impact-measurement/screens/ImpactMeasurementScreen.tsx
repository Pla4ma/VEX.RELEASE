/**
 * Impact Measurement Screen
 * 
 * Full-screen container for impact measurement features including environmental impact
 * tracking, social impact metrics, economic impact analysis, sustainability reporting,
 * and carbon footprint calculation.
 */

import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { ImpactMeasurement } from '../components/ImpactMeasurement';
import { ImpactMeasurementLoading } from '../components/ImpactMeasurementLoading';
import { ImpactMeasurementError } from '../components/ImpactMeasurementError';
import { useImpactMeasurement } from '../hooks/useImpactMeasurement';

export function ImpactMeasurementScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { userId } = route.params as { userId: string };
  const { loading, error, initialize, clearError } = useImpactMeasurement(userId);

  useEffect(() => {
    navigation.setOptions({
      title: 'Impact Measurement',
      headerStyle: {
        backgroundColor: '#27AE60',
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

  const handleMetricPress = (metric: any) => {
    navigation.navigate('ImpactMetricDetail', { metricId: metric.id, userId });
  };

  const handleReportPress = (report: any) => {
    navigation.navigate('ImpactReportDetail', { reportId: report.id, userId });
  };

  const handleGoalPress = (goal: any) => {
    navigation.navigate('ImpactGoalDetail', { goalId: goal.id, userId });
  };

  const handleAlertPress = (alert: any) => {
    navigation.navigate('ImpactAlertDetail', { alertId: alert.id, userId });
  };

  if (loading) {
    return <ImpactMeasurementLoading />;
  }

  if (error) {
    return (
      <ImpactMeasurementError
        error={error}
        onRetry={initialize}
        onDismiss={clearError}
      />
    );
  }

  return (
    <View style={styles.container}>
      <ImpactMeasurement
        userId={userId}
        onMetricPress={handleMetricPress}
        onReportPress={handleReportPress}
        onGoalPress={handleGoalPress}
        onAlertPress={handleAlertPress}
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
