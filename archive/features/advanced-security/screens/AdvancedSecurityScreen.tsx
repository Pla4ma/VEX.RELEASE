/**
 * Advanced Security Screen
 * 
 * Full-screen container for advanced security features including threat detection,
 * security monitoring, vulnerability assessment, incident response,
 * security analytics, and compliance tracking.
 */

import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { AdvancedSecurity } from '../components/AdvancedSecurity';
import { AdvancedSecurityLoading } from '../components/AdvancedSecurityLoading';
import { AdvancedSecurityError } from '../components/AdvancedSecurityError';
import { useAdvancedSecurity } from '../hooks/useAdvancedSecurity';

export function AdvancedSecurityScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { userId } = route.params as { userId: string };
  const { loading, error, initialize, clearError } = useAdvancedSecurity(userId);

  useEffect(() => {
    navigation.setOptions({
      title: 'Advanced Security',
      headerStyle: {
        backgroundColor: '#E74C3C',
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

  const handleThreatDetails = (threatId: string) => {
    navigation.navigate('ThreatDetails', { userId, threatId });
  };

  const handleVulnerabilityDetails = (vulnerabilityId: string) => {
    navigation.navigate('VulnerabilityDetails', { userId, vulnerabilityId });
  };

  const handleIncidentDetails = (incidentId: string) => {
    navigation.navigate('IncidentDetails', { userId, incidentId });
  };

  const handleComplianceDetails = (complianceId: string) => {
    navigation.navigate('ComplianceDetails', { userId, complianceId });
  };

  const handleSecuritySettings = () => {
    navigation.navigate('SecuritySettings', { userId });
  };

  if (loading) {
    return <AdvancedSecurityLoading />;
  }

  if (error) {
    return (
      <AdvancedSecurityError
        error={error}
        onRetry={initialize}
        onDismiss={clearError}
      />
    );
  }

  return (
    <View style={styles.container}>
      <AdvancedSecurity
        userId={userId}
        onThreatDetails={handleThreatDetails}
        onVulnerabilityDetails={handleVulnerabilityDetails}
        onIncidentDetails={handleIncidentDetails}
        onComplianceDetails={handleComplianceDetails}
        onSecuritySettings={handleSecuritySettings}
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
