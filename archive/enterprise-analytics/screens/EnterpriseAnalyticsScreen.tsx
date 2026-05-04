/**
 * Enterprise Analytics Screen
 * 
 * Full-screen implementation for enterprise analytics with navigation,
 * header, and comprehensive feature access.
 */

import React, { useState, useEffect } from 'react';
import { View, StyleSheet, SafeAreaView, StatusBar } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { EnterpriseAnalytics } from '../components/EnterpriseAnalytics';
import { Loading } from '../../../components/states/Loading';
import { ErrorState } from '../../../components/states/ErrorState';
import { EmptyState } from '../../../components/EmptyState';

interface EnterpriseAnalyticsScreenProps {
  organizationId: string;
}

type RouteParams = {
  organizationId?: string;
  tab?: 'overview' | 'teams' | 'departments' | 'reports' | 'insights';
};

export function EnterpriseAnalyticsScreen({ organizationId }: EnterpriseAnalyticsScreenProps) {
  const route = useRoute();
  const navigation = useNavigation();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentOrganizationId, setCurrentOrganizationId] = useState<string>(organizationId);

  const routeParams = route.params as RouteParams;

  useEffect(() => {
    // Set up screen
    navigation.setOptions({
      title: 'Enterprise Analytics',
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
    if (routeParams?.organizationId) {
      setCurrentOrganizationId(routeParams.organizationId);
    }

    // Simulate initial loading
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, [navigation, routeParams?.organizationId]);

  const handleReportPress = (report: any) => {
    // Navigate to report detail
    navigation.navigate('EnterpriseReportDetail', { reportId: report.id });
  };

  const handleTeamPress = (team: any) => {
    // Navigate to team detail
    navigation.navigate('EnterpriseTeamDetail', { teamId: team.id });
  };

  const handleDepartmentPress = (department: any) => {
    // Navigate to department detail
    navigation.navigate('EnterpriseDepartmentDetail', { departmentId: department.id });
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
        <Loading message="Loading Enterprise Analytics..." />
      </SafeAreaView>
    );
  }

  // Error state
  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
        <ErrorState
          title="Enterprise Analytics Error"
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
      <EnterpriseAnalytics
        organizationId={currentOrganizationId}
        onReportPress={handleReportPress}
        onTeamPress={handleTeamPress}
        onDepartmentPress={handleDepartmentPress}
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
