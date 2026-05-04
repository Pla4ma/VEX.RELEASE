/**
 * Biometric Optimization Empty Component
 * 
 * Empty states for biometric optimization data with dynamic messages,
 * action prompts, quick tips, feature highlights, and getting started guides.
 */

import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Dimensions } from 'react-native';
import { Card } from '../../../components/primitives/Card';
import { Button } from '../../../components/primitives/Button';
import { Badge } from '../../../components/primitives/Badge';

const { width } = Dimensions.get('window');

interface BiometricOptimizationEmptyProps {
  type?: 'no_devices' | 'no_data' | 'no_sessions' | 'no_recommendations' | 'no_goals' | 'no_analytics';
  onAction?: (action: string) => void;
}

export function BiometricOptimizationEmpty({
  type = 'no_devices',
  onAction,
}: BiometricOptimizationEmptyProps) {
  const [selectedAction, setSelectedAction] = useState<string>('');

  const getEmptyState = () => {
    switch (type) {
      case 'no_devices':
        return {
          icon: '📱',
          title: 'No Devices Connected',
          description: 'Connect your biometric devices to start monitoring your health and performance',
          actions: [
            { id: 'connect_device', label: 'Connect Device', primary: true },
            { id: 'scan_devices', label: 'Scan for Devices', primary: false },
            { id: 'learn_more', label: 'Learn More', primary: false },
          ],
          tips: [
            'Compatible devices include heart rate monitors, sleep trackers, and activity sensors',
            'Bluetooth connection provides real-time data synchronization',
            'Multiple devices can be connected simultaneously for comprehensive monitoring',
          ],
        };
      case 'no_data':
        return {
          icon: '📊',
          title: 'No Health Data Yet',
          description: 'Start monitoring to collect valuable biometric data and insights',
          actions: [
            { id: 'start_monitoring', label: 'Start Monitoring', primary: true },
            { id: 'connect_device', label: 'Connect Device', primary: false },
            { id: 'view_demo', label: 'View Demo', primary: false },
          ],
          tips: [
            'Consistent monitoring provides the most accurate insights',
            'Data is automatically synced and securely stored',
            'Historical data helps track progress and identify trends',
          ],
        };
      case 'no_sessions':
        return {
          icon: '🎯',
          title: 'No Monitoring Sessions',
          description: 'Create your first monitoring session to track your biometric metrics',
          actions: [
            { id: 'start_health', label: 'Start Health Monitoring', primary: true },
            { id: 'start_performance', label: 'Start Performance Tracking', primary: false },
            { id: 'start_wellness', label: 'Start Wellness Program', primary: false },
          ],
          tips: [
            'Health monitoring tracks vital signs and overall wellness',
            'Performance tracking helps optimize productivity and energy',
            'Wellness programs provide personalized recommendations',
          ],
        };
      case 'no_recommendations':
        return {
          icon: '💡',
          title: 'No Recommendations Yet',
          description: 'Collect more data to receive personalized health and performance recommendations',
          actions: [
            { id: 'start_monitoring', label: 'Start Monitoring', primary: true },
            { id: 'update_goals', label: 'Update Goals', primary: false },
            { id: 'sync_data', label: 'Sync Data', primary: false },
          ],
          tips: [
            'Recommendations are generated based on your biometric data and goals',
            'AI analyzes patterns to provide personalized insights',
            'Regular monitoring improves recommendation accuracy',
          ],
        };
      case 'no_goals':
        return {
          icon: '🎯',
          title: 'No Goals Set',
          description: 'Set health, performance, and wellness goals to track your progress',
          actions: [
            { id: 'set_goals', label: 'Set Goals', primary: true },
            { id: 'view_templates', label: 'View Templates', primary: false },
            { id: 'get_recommendations', label: 'Get Recommendations', primary: false },
          ],
          tips: [
            'SMART goals increase success rates and motivation',
            'Goals can be adjusted based on progress and feedback',
            'Regular goal reviews help maintain focus and direction',
          ],
        };
      case 'no_analytics':
        return {
          icon: '📈',
          title: 'No Analytics Available',
          description: 'Start collecting data to generate comprehensive health and performance analytics',
          actions: [
            { id: 'start_monitoring', label: 'Start Monitoring', primary: true },
            { id: 'connect_device', label: 'Connect Device', primary: false },
            { id: 'view_reports', label: 'View Reports', primary: false },
          ],
          tips: [
            'Analytics provide insights into patterns and trends',
            'Visual representations help understand complex data',
            'Historical analysis supports informed decision-making',
          ],
        };
      default:
        return {
          icon: '🌟',
          title: 'Welcome to Biometric Optimization',
          description: 'Start your journey to optimal health and performance with personalized biometric tracking',
          actions: [
            { id: 'get_started', label: 'Get Started', primary: true },
            { id: 'learn_more', label: 'Learn More', primary: false },
            { id: 'view_demo', label: 'View Demo', primary: false },
          ],
          tips: [
            'Biometric optimization helps you achieve peak performance',
            'Personalized insights guide your health and wellness journey',
            'Data-driven decisions lead to better outcomes',
          ],
        };
    }
  };

  const emptyState = getEmptyState();

  const handleAction = (actionId: string) => {
    setSelectedAction(actionId);
    onAction?.(actionId);
  };

  const supportedDevices = [
    { name: 'Heart Rate Monitor', icon: '💓', description: 'Track heart rate and rhythm' },
    { name: 'Sleep Tracker', icon: '😴', description: 'Monitor sleep patterns and quality' },
    { name: 'Activity Tracker', icon: '🏃‍♂️', description: 'Track physical activity and movement' },
    { name: 'Stress Monitor', icon: '🧘‍♀️', description: 'Monitor stress levels and recovery' },
    { name: 'Nutrition Tracker', icon: '🥗', description: 'Track nutrition and hydration' },
    { name: 'Blood Pressure Monitor', icon: '🩺', description: 'Monitor blood pressure and circulation' },
  ];

  const benefits = [
    'Real-time health monitoring and alerts',
    'Personalized performance optimization',
    'AI-powered wellness recommendations',
    'Comprehensive health analytics',
    'Multi-device integration',
    'Secure data management',
  ];

  const gettingStarted = [
    { step: 1, title: 'Connect Devices', description: 'Connect your biometric devices for data collection' },
    { step: 2, title: 'Set Goals', description: 'Define your health, performance, and wellness objectives' },
    { step: 3, title: 'Start Monitoring', description: 'Begin tracking your biometric metrics in real-time' },
    { step: 4, title: 'Review Insights', description: 'Analyze data and receive personalized recommendations' },
  ];

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Main Empty State Card */}
      <Card style={styles.mainCard}>
        <View style={styles.iconContainer}>
          <Text style={styles.emptyIcon}>{emptyState.icon}</Text>
        </View>
        <Text style={styles.emptyTitle}>{emptyState.title}</Text>
        <Text style={styles.emptyDescription}>{emptyState.description}</Text>
        
        {/* Action Buttons */}
        <View style={styles.actionsContainer}>
          {emptyState.actions.map((action) => (
            <Button
              key={action.id}
              title={action.label}
              onPress={() => handleAction(action.id)}
              variant={action.primary ? 'primary' : 'secondary'}
              style={[
                styles.actionButton,
                action.primary && styles.primaryActionButton,
              ]}
            />
          ))}
        </View>
      </Card>

      {/* Tips Card */}
      <Card style={styles.tipsCard}>
        <Text style={styles.tipsTitle}>💡 Quick Tips</Text>
        {emptyState.tips.map((tip, index) => (
          <View key={index} style={styles.tipItem}>
            <Text style={styles.tipBullet}>•</Text>
            <Text style={styles.tipText}>{tip}</Text>
          </View>
        ))}
      </Card>

      {/* Feature Highlights */}
      <Card style={styles.featuresCard}>
        <Text style={styles.featuresTitle}>🌟 Key Features</Text>
        <View style={styles.featuresGrid}>
          <View style={styles.featureItem}>
            <Text style={styles.featureIcon}>💓</Text>
            <Text style={styles.featureTitle}>Health Monitoring</Text>
            <Text style={styles.featureDescription}>Real-time vital signs tracking</Text>
          </View>
          <View style={styles.featureItem}>
            <Text style={styles.featureIcon}>⚡</Text>
            <Text style={styles.featureTitle}>Performance Tracking</Text>
            <Text style={styles.featureDescription}>Optimize productivity and energy</Text>
          </View>
          <View style={styles.featureItem}>
            <Text style={styles.featureIcon}>🌿</Text>
            <Text style={styles.featureTitle}>Wellness Programs</Text>
            <Text style={styles.featureDescription}>Personalized wellness plans</Text>
          </View>
          <View style={styles.featureItem}>
            <Text style={styles.featureIcon}>🤖</Text>
            <Text style={styles.featureTitle}>AI Insights</Text>
            <Text style={styles.featureDescription}>Smart recommendations</Text>
          </View>
        </View>
      </Card>

      {/* Supported Devices */}
      {type === 'no_devices' && (
        <Card style={styles.devicesCard}>
          <Text style={styles.devicesTitle}>📱 Supported Devices</Text>
          {supportedDevices.map((device, index) => (
            <TouchableOpacity
              key={index}
              style={styles.deviceItem}
              onPress={() => handleAction('connect_device')}
            >
              <Text style={styles.deviceIcon}>{device.icon}</Text>
              <View style={styles.deviceInfo}>
                <Text style={styles.deviceName}>{device.name}</Text>
                <Text style={styles.deviceDescription}>{device.description}</Text>
              </View>
              <Badge text="Compatible" variant="success" />
            </TouchableOpacity>
          ))}
        </Card>
      )}

      {/* Benefits */}
      <Card style={styles.benefitsCard}>
        <Text style={styles.benefitsTitle}>🎯 Benefits</Text>
        {benefits.map((benefit, index) => (
          <View key={index} style={styles.benefitItem}>
            <Text style={styles.benefitCheck}>✓</Text>
            <Text style={styles.benefitText}>{benefit}</Text>
          </View>
        ))}
      </Card>

      {/* Getting Started Guide */}
      <Card style={styles.guideCard}>
        <Text style={styles.guideTitle}>🚀 Getting Started</Text>
        {gettingStarted.map((step) => (
          <View key={step.step} style={styles.guideStep}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>{step.step}</Text>
            </View>
            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>{step.title}</Text>
              <Text style={styles.stepDescription}>{step.description}</Text>
            </View>
          </View>
        ))}
      </Card>

      {/* Success Metrics */}
      <Card style={styles.metricsCard}>
        <Text style={styles.metricsTitle}>📊 Success Metrics</Text>
        <View style={styles.metricsGrid}>
          <View style={styles.metricItem}>
            <Text style={styles.metricValue}>95%</Text>
            <Text style={styles.metricLabel}>User Satisfaction</Text>
          </View>
          <View style={styles.metricItem}>
            <Text style={styles.metricValue}>87%</Text>
            <Text style={metricsLabel}>Goal Achievement</Text>
          </View>
          <View style={styles.metricItem}>
            <Text style={styles.metricValue}>3x</Text>
            <Text style={styles.metricLabel}>Performance Improvement</Text>
          </View>
          <View style={styles.metricItem}>
            <Text style={styles.metricValue}>24/7</Text>
            <Text style={styles.metricLabel}>Monitoring Support</Text>
          </View>
        </View>
      </Card>

      {/* Encouragement */}
      <Card style={styles.encouragementCard}>
        <Text style={styles.encouragementTitle}>🌟 Your Journey Starts Here</Text>
        <Text style={styles.encouragementText}>
          Take the first step towards optimal health and performance. Every data point brings you closer to your goals.
        </Text>
        <Button
          title="Start Your Journey"
          onPress={() => handleAction('get_started')}
          variant="primary"
          style={styles.encouragementButton}
        />
      </Card>
    </ScrollView>
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
    alignItems: 'center',
    marginBottom: 16,
  },
  iconContainer: {
    marginBottom: 16,
  },
  emptyIcon: {
    fontSize: 48,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#2C3E50',
    textAlign: 'center',
    marginBottom: 8,
  },
  emptyDescription: {
    fontSize: 16,
    color: '#7F8C8D',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },
  actionsContainer: {
    width: '100%',
    gap: 12,
  },
  actionButton: {
    marginBottom: 8,
  },
  primaryActionButton: {
    // Additional styling for primary button handled by Button component
  },
  tipsCard: {
    padding: 16,
    marginBottom: 16,
  },
  tipsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 12,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  tipBullet: {
    fontSize: 16,
    color: '#3498DB',
    marginRight: 8,
    marginTop: 2,
  },
  tipText: {
    fontSize: 14,
    color: '#7F8C8D',
    flex: 1,
    lineHeight: 20,
  },
  featuresCard: {
    padding: 16,
    marginBottom: 16,
  },
  featuresTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 16,
  },
  featuresGrid: {
    gap: 16,
  },
  featureItem: {
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
  },
  featureIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
    textAlign: 'center',
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 14,
    color: '#7F8C8D',
    textAlign: 'center',
  },
  devicesCard: {
    padding: 16,
    marginBottom: 16,
  },
  devicesTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 16,
  },
  deviceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    marginBottom: 8,
  },
  deviceIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  deviceInfo: {
    flex: 1,
  },
  deviceName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 2,
  },
  deviceDescription: {
    fontSize: 14,
    color: '#7F8C8D',
  },
  benefitsCard: {
    padding: 16,
    marginBottom: 16,
  },
  benefitsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 16,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  benefitCheck: {
    fontSize: 16,
    color: '#27AE60',
    marginRight: 8,
  },
  benefitText: {
    fontSize: 14,
    color: '#7F8C8D',
    flex: 1,
  },
  guideCard: {
    padding: 16,
    marginBottom: 16,
  },
  guideTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 16,
  },
  guideStep: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  stepNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#3498DB',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  stepNumberText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 4,
  },
  stepDescription: {
    fontSize: 14,
    color: '#7F8C8D',
    lineHeight: 20,
  },
  metricsCard: {
    padding: 16,
    marginBottom: 16,
  },
  metricsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 16,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  metricItem: {
    width: '48%',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    marginBottom: 8,
  },
  metricValue: {
    fontSize: 24,
    fontWeight: '600',
    color: '#3498DB',
    marginBottom: 4,
  },
  metricLabel: {
    fontSize: 12,
    color: '#7F8C8D',
    textAlign: 'center',
  },
  encouragementCard: {
    padding: 20,
    alignItems: 'center',
    marginBottom: 16,
  },
  encouragementTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2C3E50',
    textAlign: 'center',
    marginBottom: 12,
  },
  encouragementText: {
    fontSize: 16,
    color: '#7F8C8D',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 20,
  },
  encouragementButton: {
    // Additional styling handled by Button component
  },
});
