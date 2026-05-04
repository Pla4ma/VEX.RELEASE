/**
 * Enterprise Analytics Loading Component
 * 
 * Loading state component for enterprise analytics with animated indicators
 * and progress feedback for different loading scenarios.
 */

import React from 'react';
import { View, StyleSheet, Text, Animated } from 'react-native';
import { Skeleton } from '../../../components/ui/Skeleton';

interface EnterpriseAnalyticsLoadingProps {
  type?: 'initial' | 'data-sync' | 'report-generation' | 'analysis' | 'forecasting';
  message?: string;
  progress?: number;
}

export function EnterpriseAnalyticsLoading({ 
  type = 'initial', 
  message,
  progress 
}: EnterpriseAnalyticsLoadingProps) {
  const [fadeAnim] = React.useState(new Animated.Value(0));
  const [scaleAnim] = React.useState(new Animated.Value(0.8));

  React.useEffect(() => {
    // Start animations
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const getLoadingMessage = () => {
    if (message) return message;
    
    switch (type) {
      case 'initial':
        return 'Initializing Enterprise Analytics...';
      case 'data-sync':
        return 'Synchronizing organizational data...';
      case 'report-generation':
        return 'Generating analytics reports...';
      case 'analysis':
        return 'Analyzing business intelligence...';
      case 'forecasting':
        return 'Creating predictive forecasts...';
      default:
        return 'Loading...';
    }
  };

  const getLoadingSteps = () => {
    switch (type) {
      case 'initial':
        return [
          'Connecting to data sources',
          'Loading organization profile',
          'Initializing analytics engine',
          'Preparing dashboard',
        ];
      case 'data-sync':
        return [
          'Connecting to HR systems',
          'Syncing CRM data',
          'Importing financial records',
          'Aggregating metrics',
        ];
      case 'report-generation':
        return [
          'Gathering data points',
          'Processing analytics',
          'Generating visualizations',
          'Creating reports',
        ];
      case 'analysis':
        return [
          'Analyzing performance metrics',
          'Processing team data',
          'Evaluating KPIs',
          'Generating insights',
        ];
      case 'forecasting':
        return [
          'Loading historical data',
          'Training prediction models',
          'Generating forecasts',
          'Validating predictions',
        ];
      default:
        return ['Connecting...', 'Processing...', 'Analyzing...', 'Finalizing...'];
    }
  };

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.content, { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }]}>
        {/* Analytics Icon */}
        <View style={styles.iconContainer}>
          <Text style={styles.analyticsIcon}>📊</Text>
          <View style={styles.loadingDots}>
            {[0, 1, 2].map((index) => (
              <Animated.View
                key={index}
                style={[
                  styles.dot,
                  {
                    backgroundColor: '#3498DB',
                    transform: [
                      {
                        scale: fadeAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: [0.8, 1.2],
                        }),
                      },
                    ],
                  },
                ]}
              />
            ))}
          </View>
        </View>

        {/* Main Loading Text */}
        <Text style={styles.loadingText}>{getLoadingMessage()}</Text>

        {/* Progress Bar */}
        {progress !== undefined && (
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View 
                style={[styles.progressFill, { width: `${progress}%` }]}
              />
            </View>
            <Text style={styles.progressText}>{Math.round(progress)}%</Text>
          </View>
        )}

        {/* Loading Steps */}
        <View style={styles.stepsContainer}>
          {getLoadingSteps().map((step, index) => (
            <View key={index} style={styles.step}>
              <View style={styles.stepIndicator}>
                <View style={[
                  styles.stepDot,
                  { backgroundColor: progress !== undefined && progress > (index + 1) * 25 ? '#27AE60' : '#BDC3C7' }
                ]} />
              </View>
              <Text style={[
                styles.stepText,
                { color: progress !== undefined && progress > (index + 1) * 25 ? '#2C3E50' : '#95A5A6' }
              ]}>
                {step}
              </Text>
            </View>
          ))}
        </View>

        {/* Skeleton Content */}
        <View style={styles.skeletonContainer}>
          <Skeleton height={100} style={styles.skeletonCard} />
          <Skeleton height={100} style={styles.skeletonCard} />
          <Skeleton height={100} style={styles.skeletonCard} />
        </View>

        {/* Analytics Tips */}
        <View style={styles.tipsContainer}>
          <Text style={styles.tipsTitle}>Analytics Tip:</Text>
          <Text style={styles.tipsText}>
            Your enterprise analytics system is processing organizational data to provide comprehensive business intelligence and strategic insights.
          </Text>
        </View>

        {/* Feature Highlights */}
        <View style={styles.featuresContainer}>
          <Text style={styles.featuresTitle}>Enterprise Features:</Text>
          <View style={styles.featureGrid}>
            <View style={styles.featureItem}>
              <Text style={styles.featureIcon}>📈</Text>
              <Text style={styles.featureName}>Business Intelligence</Text>
            </View>
            <View style={styles.featureItem}>
              <Text style={styles.featureIcon}>👥</Text>
              <Text style={styles.featureName}>Team Analytics</Text>
            </View>
            <View style={styles.featureItem}>
              <Text style={styles.featureIcon}>🏢</Text>
              <Text style={styles.featureName}>Department Metrics</Text>
            </View>
            <View style={styles.featureItem}>
              <Text style={styles.featureIcon}>📊</Text>
              <Text style={styles.featureName}>Performance Dashboard</Text>
            </View>
          </View>
        </View>

        {/* Data Sources */}
        <View style={styles.dataSourceContainer}>
          <Text style={styles.dataSourceTitle}>Data Sources:</Text>
          <View style={styles.dataSourceItems}>
            <View style={styles.dataSourceItem}>
              <Text style={styles.dataSourceIcon}>💼</Text>
              <View style={styles.dataSourceInfo}>
                <Text style={styles.dataSourceName}>HR Systems</Text>
                <Text style={styles.dataSourceDesc}>Employee data</Text>
              </View>
            </View>
            <View style={styles.dataSourceItem}>
              <Text style={styles.dataSourceIcon}>🤝</Text>
              <View style={styles.dataSourceInfo}>
                <Text style={styles.dataSourceName}>CRM Platform</Text>
                <Text style={styles.dataSourceDesc}>Customer relationships</Text>
              </View>
            </View>
            <View style={styles.dataSourceItem}>
              <Text style={styles.dataSourceIcon}>💰</Text>
              <View style={styles.dataSourceInfo}>
                <Text style={styles.dataSourceName}>Financial Systems</Text>
                <Text style={styles.dataSourceDesc}>Revenue & costs</Text>
              </View>
            </View>
            <View style={styles.dataSourceItem}>
              <Text style={styles.dataSourceIcon}>⚙️</Text>
              <View style={styles.dataSourceInfo}>
                <Text style={styles.dataSourceName}>ERP Systems</Text>
                <Text style={styles.dataSourceDesc}>Operations data</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Analytics Capabilities */}
        <View style={styles.capabilitiesContainer}>
          <Text style={styles.capabilitiesTitle}>Analytics Capabilities:</Text>
          <View style={styles.capabilitiesItems}>
            <View style={styles.capabilityItem}>
              <Text style={styles.capabilityLabel}>Real-time Monitoring:</Text>
              <Text style={styles.capabilityValue}>Activating...</Text>
            </View>
            <View style={styles.capabilityItem}>
              <Text style={styles.capabilityLabel}>Predictive Analytics:</Text>
              <Text style={styles.capabilityValue}>Initializing...</Text>
            </View>
            <View style={styles.capabilityItem}>
              <Text style={styles.capabilityLabel}>KPI Tracking:</Text>
              <Text style={styles.capabilityValue}>Setting up...</Text>
            </View>
            <View style={styles.capabilityItem}>
              <Text style={styles.capabilityLabel}>Report Generation:</Text>
              <Text style={styles.capabilityValue}>Preparing...</Text>
            </View>
          </View>
        </View>

        {/* Processing Metrics */}
        <View style={styles.metricsContainer}>
          <Text style={styles.metricsTitle}>Processing Metrics:</Text>
          <View style={styles.metricsItems}>
            <View style={styles.metricItem}>
              <Text style={styles.metricLabel}>Data Points:</Text>
              <Text style={styles.metricValue}>Processing...</Text>
            </View>
            <View style={styles.metricItem}>
              <Text style={styles.metricLabel}>Teams Analyzed:</Text>
              <Text style={styles.metricValue}>Counting...</Text>
            </View>
            <View style={styles.metricItem}>
              <Text style={styles.metricLabel}>Departments:</Text>
              <Text style={styles.metricValue}>Loading...</Text>
            </View>
            <View style={styles.metricItem}>
              <Text style={styles.metricLabel}>KPIs Calculated:</Text>
              <Text style={styles.metricValue}>Computing...</Text>
            </View>
          </View>
        </View>

        {/* Security Status */}
        <View style={styles.securityContainer}>
          <Text style={styles.securityTitle}>Security Status:</Text>
          <View style={styles.securityItems}>
            <View style={styles.securityItem}>
              <Text style={styles.securityLabel}>Data Encryption:</Text>
              <Text style={styles.securityValue}>Active</Text>
            </View>
            <View style={styles.securityItem}>
              <Text style={styles.securityLabel}>Access Control:</Text>
              <Text style={styles.securityValue}>Verified</Text>
            </View>
            <View style={styles.securityItem}>
              <Text style={styles.securityLabel}>Compliance Check:</Text>
              <Text style={styles.securityValue}>Running...</Text>
            </View>
            <View style={styles.securityItem}>
              <Text style={styles.securityLabel}>Audit Trail:</Text>
              <Text style={styles.securityValue}>Enabled</Text>
            </View>
          </View>
        </View>

        {/* Integration Status */}
        <View style={styles.integrationContainer}>
          <Text style={styles.integrationTitle}>System Integration:</Text>
          <View style={styles.integrationItems}>
            <View style={styles.integrationItem}>
              <Text style={styles.integrationLabel}>API Connections:</Text>
              <Text style={styles.integrationValue}>Establishing...</Text>
            </View>
            <View style={styles.integrationItem}>
              <Text style={styles.integrationLabel}>Data Synchronization:</Text>
              <Text style={styles.integrationValue}>In Progress</Text>
            </View>
            <View style={styles.integrationItem}>
              <Text style={styles.integrationLabel}>Real-time Updates:</Text>
              <Text style={styles.integrationValue}>Configuring...</Text>
            </View>
            <View style={styles.integrationItem}>
              <Text style={styles.integrationLabel}>Alert System:</Text>
              <Text style={styles.integrationValue}>Setting up...</Text>
            </View>
          </View>
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    padding: 20,
  },
  content: {
    alignItems: 'center',
    width: '100%',
    maxWidth: 400,
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  analyticsIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  loadingDots: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginHorizontal: 4,
  },
  loadingText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2C3E50',
    textAlign: 'center',
    marginBottom: 30,
  },
  progressContainer: {
    width: '100%',
    marginBottom: 30,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#E1E8ED',
    borderRadius: 4,
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#3498DB',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#3498DB',
    textAlign: 'center',
  },
  stepsContainer: {
    width: '100%',
    marginBottom: 30,
  },
  step: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  stepIndicator: {
    marginRight: 12,
  },
  stepDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  stepText: {
    fontSize: 13,
    fontWeight: '500',
    flex: 1,
  },
  skeletonContainer: {
    width: '100%',
    marginBottom: 30,
  },
  skeletonCard: {
    marginBottom: 12,
    borderRadius: 8,
  },
  tipsContainer: {
    backgroundColor: '#E3F2FD',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#BBDEFB',
    marginBottom: 30,
    width: '100%',
  },
  tipsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 8,
  },
  tipsText: {
    fontSize: 13,
    color: '#3498DB',
    lineHeight: 18,
  },
  featuresContainer: {
    marginBottom: 30,
    width: '100%',
  },
  featuresTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
    textAlign: 'center',
    marginBottom: 16,
  },
  featureGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  featureItem: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E1E8ED',
    alignItems: 'center',
    marginBottom: 12,
  },
  featureIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  featureName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#2C3E50',
    textAlign: 'center',
  },
  dataSourceContainer: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E1E8ED',
    marginBottom: 30,
    width: '100%',
  },
  dataSourceTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 12,
  },
  dataSourceItems: {
    gap: 12,
  },
  dataSourceItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dataSourceIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  dataSourceInfo: {
    flex: 1,
  },
  dataSourceName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 2,
  },
  dataSourceDesc: {
    fontSize: 12,
    color: '#7F8C8D',
  },
  capabilitiesContainer: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E1E8ED',
    marginBottom: 30,
    width: '100%',
  },
  capabilitiesTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 12,
  },
  capabilitiesItems: {
    gap: 8,
  },
  capabilityItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  capabilityLabel: {
    fontSize: 12,
    color: '#7F8C8D',
  },
  capabilityValue: {
    fontSize: 12,
    color: '#3498DB',
    fontWeight: '600',
  },
  metricsContainer: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E1E8ED',
    marginBottom: 30,
    width: '100%',
  },
  metricsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 12,
  },
  metricsItems: {
    gap: 8,
  },
  metricItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  metricLabel: {
    fontSize: 12,
    color: '#7F8C8D',
  },
  metricValue: {
    fontSize: 12,
    color: '#2C3E50',
    fontWeight: '600',
  },
  securityContainer: {
    backgroundColor: '#E8F5E8',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#C3E6CB',
    marginBottom: 30,
    width: '100%',
  },
  securityTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 12,
  },
  securityItems: {
    gap: 8,
  },
  securityItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  securityLabel: {
    fontSize: 12,
    color: '#7F8C8D',
  },
  securityValue: {
    fontSize: 12,
    color: '#27AE60',
    fontWeight: '600',
  },
  integrationContainer: {
    backgroundColor: '#FFF3E0',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FFE0B2',
    width: '100%',
  },
  integrationTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 12,
  },
  integrationItems: {
    gap: 8,
  },
  integrationItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  integrationLabel: {
    fontSize: 12,
    color: '#7F8C8D',
  },
  integrationValue: {
    fontSize: 12,
    color: '#F39C12',
    fontWeight: '600',
  },
});
