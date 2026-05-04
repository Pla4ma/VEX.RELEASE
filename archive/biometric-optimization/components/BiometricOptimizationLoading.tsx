/**
 * Biometric Optimization Loading Component
 * 
 * Loading states for biometric optimization operations with animated indicators,
 * progress feedback, loading steps, skeleton UI, and biometric tips.
 */

import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Animated, Dimensions } from 'react-native';
import { Card } from '../../../components/primitives/Card';
import { Badge } from '../../../components/primitives/Badge';
import { ProgressBar } from '../../../components/ProgressBar';

const { width } = Dimensions.get('window');

interface BiometricOptimizationLoadingProps {
  operation?: 'initialization' | 'device_connection' | 'health_monitoring' | 'performance_tracking' | 'wellness_program' | 'data_sync' | 'optimization' | 'calibration';
  progress?: number;
  message?: string;
  showTips?: boolean;
  showSteps?: boolean;
}

export function BiometricOptimizationLoading({
  operation = 'initialization',
  progress = 0,
  message,
  showTips = true,
  showSteps = true,
}: BiometricOptimizationLoadingProps) {
  const [pulseAnim] = useState(new Animated.Value(1));
  const [slideAnim] = useState(new Animated.Value(0));
  const [currentTipIndex, setCurrentTipIndex] = useState(0);

  useEffect(() => {
    // Pulse animation for heart rate indicator
    const pulseAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.2,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    );
    pulseAnimation.start();

    // Slide animation for tips
    Animated.timing(slideAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();

    // Rotate tips
    const tipInterval = setInterval(() => {
      setCurrentTipIndex((prev) => (prev + 1) % biometricTips.length);
    }, 3000);

    return () => {
      pulseAnimation.stop();
      clearInterval(tipInterval);
    };
  }, []);

  const biometricTips = [
    "💓 Regular heart rate monitoring helps detect irregularities early",
    "😴 Quality sleep is essential for optimal cognitive performance",
    "🏃‍♂️ Physical activity boosts both physical and mental health",
    "🧘‍♀️ Stress management techniques improve overall wellness",
    "🥗 Balanced nutrition supports sustained energy levels",
    "💧 Proper hydration maintains optimal body function",
    "📊 Consistent data tracking provides valuable health insights",
    "🎯 Setting realistic health goals increases success rates",
    "⚡ Recovery periods prevent burnout and enhance performance",
    "🔗 Connected devices provide continuous health monitoring",
  ];

  const getOperationSteps = () => {
    switch (operation) {
      case 'initialization':
        return [
          'Connecting to biometric system...',
          'Loading user profile...',
          'Initializing health metrics...',
          'Setting up performance tracking...',
          'Configuring wellness programs...',
          'Ready to optimize!',
        ];
      case 'device_connection':
        return [
          'Scanning for available devices...',
          'Establishing Bluetooth connection...',
          'Authenticating device...',
          'Configuring device settings...',
          'Syncing device data...',
          'Device connected!',
        ];
      case 'health_monitoring':
        return [
          'Initializing health sensors...',
          'Calibrating vital sign monitors...',
          'Starting heart rate tracking...',
          'Monitoring blood pressure...',
          'Analyzing stress levels...',
          'Health monitoring active!',
        ];
      case 'performance_tracking':
        return [
          'Activating performance sensors...',
          'Calibrating energy monitors...',
          'Starting focus tracking...',
          'Monitoring productivity metrics...',
          'Analyzing cognitive load...',
          'Performance tracking active!',
        ];
      case 'wellness_program':
        return [
          'Loading wellness programs...',
          'Personalizing recommendations...',
          'Setting exercise goals...',
          'Configuring nutrition tracking...',
          'Initializing mental health support...',
          'Wellness program ready!',
        ];
      case 'data_sync':
        return [
          'Connecting to cloud services...',
          'Uploading local data...',
          'Downloading latest updates...',
          'Syncing health metrics...',
          'Updating recommendations...',
          'Data synchronized!',
        ];
      case 'optimization':
        return [
          'Analyzing current metrics...',
          'Identifying optimization opportunities...',
          'Generating personalized plan...',
          'Calculating performance improvements...',
          'Applying optimization strategies...',
          'Optimization complete!',
        ];
      case 'calibration':
        return [
          'Starting device calibration...',
          'Measuring baseline metrics...',
          'Adjusting sensor sensitivity...',
          'Validating accuracy...',
          'Finalizing calibration...',
          'Calibration complete!',
        ];
      default:
        return ['Processing...', 'Almost there...', 'Ready!'];
    }
  };

  const getOperationIcon = () => {
    switch (operation) {
      case 'initialization':
        return '🚀';
      case 'device_connection':
        return '📱';
      case 'health_monitoring':
        return '💓';
      case 'performance_tracking':
        return '⚡';
      case 'wellness_program':
        return '🌿';
      case 'data_sync':
        return '☁️';
      case 'optimization':
        return '🎯';
      case 'calibration':
        return '🔧';
      default:
        return '⏳';
    }
  };

  const getOperationColor = () => {
    switch (operation) {
      case 'initialization':
        return '#3498DB';
      case 'device_connection':
        return '#9B59B6';
      case 'health_monitoring':
        return '#E74C3C';
      case 'performance_tracking':
        return '#F39C12';
      case 'wellness_program':
        return '#27AE60';
      case 'data_sync':
        return '#3498DB';
      case 'optimization':
        return '#E67E22';
      case 'calibration':
        return '#95A5A6';
      default:
        return '#7F8C8D';
    }
  };

  const currentStep = Math.floor((progress / 100) * getOperationSteps().length);
  const steps = getOperationSteps();

  return (
    <View style={styles.container}>
      {/* Main Loading Card */}
      <Card style={styles.mainCard}>
        <View style={styles.header}>
          <Animated.View style={[styles.iconContainer, { transform: [{ scale: pulseAnim }] }]}>
            <Text style={styles.operationIcon}>{getOperationIcon()}</Text>
          </Animated.View>
          <View style={styles.titleContainer}>
            <Text style={styles.operationTitle}>
              {operation.charAt(0).toUpperCase() + operation.slice(1).replace('_', ' ')}
            </Text>
            <Badge text={`${Math.round(progress)}%`} variant="primary" />
          </View>
        </View>

        {/* Progress Bar */}
        <ProgressBar 
          progress={progress} 
          color={getOperationColor()}
          style={styles.progressBar}
        />

        {/* Loading Message */}
        <Text style={styles.loadingMessage}>
          {message || steps[Math.min(currentStep, steps.length - 1)]}
        </Text>

        {/* Loading Steps */}
        {showSteps && (
          <View style={styles.stepsContainer}>
            {steps.slice(0, currentStep + 1).map((step, index) => (
              <View key={index} style={styles.stepItem}>
                <View style={[
                  styles.stepIndicator,
                  index < currentStep && styles.completedStep,
                  index === currentStep && styles.activeStep,
                ]}>
                  {index < currentStep ? '✓' : index + 1}
                </View>
                <Text style={[
                  styles.stepText,
                  index < currentStep && styles.completedStepText,
                  index === currentStep && styles.activeStepText,
                ]}>
                  {step}
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* Animated Health Indicator */}
        <View style={styles.healthIndicatorContainer}>
          <Animated.View style={[styles.heartIndicator, { transform: [{ scale: pulseAnim }] }]}>
            <Text style={styles.heartIcon}>💓</Text>
          </Animated.View>
          <Text style={styles.healthStatus}>Monitoring Health Metrics...</Text>
        </View>
      </Card>

      {/* Tips Card */}
      {showTips && (
        <Animated.View style={[styles.tipsContainer, { transform: [{ translateX: slideAnim }] }]}>
          <Card style={styles.tipsCard}>
            <View style={styles.tipsHeader}>
              <Text style={styles.tipsTitle}>💡 Biometric Tip</Text>
            </View>
            <Text style={styles.tipText}>
              {biometricTips[currentTipIndex]}
            </Text>
            <View style={styles.tipDots}>
              {biometricTips.map((_, index) => (
                <View
                  key={index}
                  style={[
                    styles.tipDot,
                    index === currentTipIndex && styles.activeTipDot,
                  ]}
                />
              ))}
            </View>
          </Card>
        </Animated.View>
      )}

      {/* Feature Highlights */}
      <View style={styles.featuresContainer}>
        <Card style={styles.featuresCard}>
          <Text style={styles.featuresTitle}>🌟 Biometric Optimization Features</Text>
          <View style={styles.featureList}>
            <View style={styles.featureItem}>
              <Text style={styles.featureIcon}>💓</Text>
              <Text style={styles.featureText}>Real-time Health Monitoring</Text>
            </View>
            <View style={styles.featureItem}>
              <Text style={styles.featureIcon}>⚡</Text>
              <Text style={styles.featureText}>Performance Tracking</Text>
            </View>
            <View style={styles.featureItem}>
              <Text style={styles.featureIcon}>🌿</Text>
              <Text style={styles.featureText}>Personalized Wellness Programs</Text>
            </View>
            <View style={styles.featureItem}>
              <Text style={styles.featureIcon}>📱</Text>
              <Text style={styles.featureText}>Multi-Device Integration</Text>
            </View>
            <View style={styles.featureItem}>
              <Text style={styles.featureIcon}>🎯</Text>
              <Text style={styles.featureText}>AI-Powered Optimization</Text>
            </View>
            <View style={styles.featureItem}>
              <Text style={styles.featureIcon}>📊</Text>
              <Text style={styles.featureText}>Advanced Analytics</Text>
            </View>
          </View>
        </Card>
      </View>

      {/* Data Source Status */}
      <View style={styles.statusContainer}>
        <Card style={styles.statusCard}>
          <Text style={styles.statusTitle}>📡 System Status</Text>
          <View style={styles.statusList}>
            <View style={styles.statusItem}>
              <View style={[styles.statusIndicator, styles.activeIndicator]} />
              <Text style={styles.statusText}>Biometric Sensors</Text>
            </View>
            <View style={styles.statusItem}>
              <View style={[styles.statusIndicator, styles.activeIndicator]} />
              <Text style={styles.statusText}>Device Connection</Text>
            </View>
            <View style={styles.statusItem}>
              <View style={[styles.statusIndicator, styles.syncingIndicator]} />
              <Text style={styles.statusText}>Data Sync</Text>
            </View>
            <View style={styles.statusItem}>
              <View style={[styles.statusIndicator, styles.activeIndicator]} />
              <Text style={styles.statusText}>Analytics Engine</Text>
            </View>
          </View>
        </Card>
      </View>

      {/* Processing Metrics */}
      <View style={styles.metricsContainer}>
        <Card style={styles.metricsCard}>
          <Text style={styles.metricsTitle}>📈 Processing Metrics</Text>
          <View style={styles.metricsList}>
            <View style={styles.metricItem}>
              <Text style={styles.metricLabel}>Data Points</Text>
              <Text style={styles.metricValue}>1,247</Text>
            </View>
            <View style={styles.metricItem}>
              <Text style={styles.metricLabel}>Accuracy</Text>
              <Text style={styles.metricValue}>98.5%</Text>
            </View>
            <View style={styles.metricItem}>
              <Text style={styles.metricLabel}>Response Time</Text>
              <Text style={styles.metricValue}>12ms</Text>
            </View>
            <View style={styles.metricItem}>
              <Text style={styles.metricLabel}>Battery Life</Text>
              <Text style={styles.metricValue}>87%</Text>
            </View>
          </View>
        </Card>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#F8F9FA',
  },
  mainCard: {
    padding: 24,
    marginBottom: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  iconContainer: {
    marginRight: 16,
  },
  operationIcon: {
    fontSize: 32,
  },
  titleContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  operationTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#2C3E50',
  },
  progressBar: {
    marginBottom: 16,
  },
  loadingMessage: {
    fontSize: 16,
    color: '#7F8C8D',
    textAlign: 'center',
    marginBottom: 20,
  },
  stepsContainer: {
    gap: 8,
    marginBottom: 20,
  },
  stepItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
  },
  stepIndicator: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#E1E8ED',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    fontSize: 12,
    color: '#7F8C8D',
    fontWeight: '600',
  },
  completedStep: {
    backgroundColor: '#27AE60',
    color: '#FFFFFF',
  },
  activeStep: {
    backgroundColor: '#3498DB',
    color: '#FFFFFF',
  },
  stepText: {
    fontSize: 14,
    color: '#7F8C8D',
    flex: 1,
  },
  completedStepText: {
    color: '#27AE60',
    fontWeight: '500',
  },
  activeStepText: {
    color: '#3498DB',
    fontWeight: '600',
  },
  healthIndicatorContainer: {
    alignItems: 'center',
    marginTop: 20,
  },
  heartIndicator: {
    marginBottom: 8,
  },
  heartIcon: {
    fontSize: 24,
  },
  healthStatus: {
    fontSize: 14,
    color: '#7F8C8D',
    textAlign: 'center',
  },
  tipsContainer: {
    marginBottom: 16,
  },
  tipsCard: {
    padding: 16,
  },
  tipsHeader: {
    marginBottom: 8,
  },
  tipsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
  },
  tipText: {
    fontSize: 14,
    color: '#7F8C8D',
    lineHeight: 20,
    marginBottom: 12,
  },
  tipDots: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
  },
  tipDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#E1E8ED',
  },
  activeTipDot: {
    backgroundColor: '#3498DB',
  },
  featuresContainer: {
    marginBottom: 16,
  },
  featuresCard: {
    padding: 16,
  },
  featuresTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 12,
  },
  featureList: {
    gap: 8,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
  },
  featureIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  featureText: {
    fontSize: 14,
    color: '#7F8C8D',
  },
  statusContainer: {
    marginBottom: 16,
  },
  statusCard: {
    padding: 16,
  },
  statusTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 12,
  },
  statusList: {
    gap: 8,
  },
  statusItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  activeIndicator: {
    backgroundColor: '#27AE60',
  },
  syncingIndicator: {
    backgroundColor: '#F39C12',
  },
  statusText: {
    fontSize: 14,
    color: '#7F8C8D',
  },
  metricsContainer: {
    marginBottom: 16,
  },
  metricsCard: {
    padding: 16,
  },
  metricsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 12,
  },
  metricsList: {
    gap: 8,
  },
  metricItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  metricLabel: {
    fontSize: 14,
    color: '#7F8C8D',
  },
  metricValue: {
    fontSize: 14,
    color: '#2C3E50',
    fontWeight: '600',
  },
});
