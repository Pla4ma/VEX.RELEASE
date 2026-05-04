/**
 * Predictive Analytics Empty Component
 * 
 * Empty state component for predictive analytics when no data is available,
 * with helpful guidance and action prompts.
 */

import React from 'react';
import { View, StyleSheet, Text, TouchableOpacity, Image } from 'react-native';
import { Button } from '../../../components/primitives/Button';

interface PredictiveAnalyticsEmptyProps {
  type?: 'insights' | 'quantum' | 'predictions' | 'all';
  onAction?: () => void;
  customMessage?: string;
  customIcon?: string;
}

export function PredictiveAnalyticsEmpty({ 
  type = 'all', 
  onAction,
  customMessage,
  customIcon 
}: PredictiveAnalyticsEmptyProps) {
  const getEmptyState = () => {
    switch (type) {
      case 'insights':
        return {
          icon: customIcon || '💡',
          title: 'No Insights Available',
          message: customMessage || 'Start using the app regularly to generate AI-powered insights about your productivity patterns.',
          actionText: 'Start Using App',
          tips: [
            'Complete focus sessions to generate insights',
            'Set goals and track progress',
            'Use the app consistently for better predictions',
          ],
        };
      case 'quantum':
        return {
          icon: customIcon || '⚛️',
          title: 'No Quantum State Data',
          message: customMessage || 'Quantum state analysis requires more usage data to establish your productivity patterns.',
          actionText: 'Build Activity History',
          tips: [
            'Quantum state analyzes your energy and focus patterns',
            'More data leads to more accurate predictions',
            'Continue using the app to build your profile',
          ],
        };
      case 'predictions':
        return {
          icon: customIcon || '🔮',
          title: 'No Predictions Yet',
          message: customMessage || 'Generate your first prediction to see AI-powered insights about your future productivity.',
          actionText: 'Generate Prediction',
          tips: [
            'Predictions help you plan your work effectively',
            'AI analyzes your patterns to forecast outcomes',
            'Regular use improves prediction accuracy',
          ],
        };
      default:
        return {
          icon: customIcon || '🧠',
          title: 'Welcome to Predictive Analytics',
          message: customMessage || 'Start your journey with AI-powered insights to optimize your productivity.',
          actionText: 'Get Started',
          tips: [
            'Our AI analyzes over 100 data points',
            'Get personalized insights and predictions',
            'Optimize your productivity with data-driven guidance',
          ],
        };
    }
  };

  const emptyState = getEmptyState();

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {/* Icon */}
        <View style={styles.iconContainer}>
          <Text style={styles.icon}>{emptyState.icon}</Text>
        </View>

        {/* Title and Message */}
        <Text style={styles.title}>{emptyState.title}</Text>
        <Text style={styles.message}>{emptyState.message}</Text>

        {/* Action Button */}
        <View style={styles.actionContainer}>
          <Button
            title={emptyState.actionText}
            onPress={onAction || (() => {})}
            style={styles.actionButton}
          />
        </View>

        {/* Tips */}
        <View style={styles.tipsContainer}>
          <Text style={styles.tipsTitle}>Quick Tips:</Text>
          {emptyState.tips.map((tip, index) => (
            <View key={index} style={styles.tipItem}>
              <Text style={styles.tipBullet}>•</Text>
              <Text style={styles.tipText}>{tip}</Text>
            </View>
          ))}
        </View>

        {/* Feature Highlights */}
        <View style={styles.featuresContainer}>
          <Text style={styles.featuresTitle}>What Predictive Analytics Can Do:</Text>
          <View style={styles.featureGrid}>
            <View style={styles.featureItem}>
              <Text style={styles.featureIcon}>📊</Text>
              <Text style={styles.featureName}>Pattern Analysis</Text>
              <Text style={styles.featureDescription}>Identify your productivity patterns</Text>
            </View>
            <View style={styles.featureItem}>
              <Text style={styles.featureIcon}>🎯</Text>
              <Text style={styles.featureName}>Predictions</Text>
              <Text style={styles.featureDescription}>Forecast future performance</Text>
            </View>
            <View style={styles.featureItem}>
              <Text style={styles.featureIcon}>💡</Text>
              <Text style={styles.featureName}>Insights</Text>
              <Text style={styles.featureDescription}>Get personalized recommendations</Text>
            </View>
            <View style={styles.featureItem}>
              <Text style={styles.featureIcon}>⚛️</Text>
              <Text style={styles.featureName}>Quantum State</Text>
              <Text style={styles.featureDescription}>Track your energy and focus</Text>
            </View>
          </View>
        </View>

        {/* Encouragement */}
        <View style={styles.encouragementContainer}>
          <Text style={styles.encouragementText}>
            The more you use VEX, the smarter our predictions become. Start today and unlock your productivity potential!
          </Text>
        </View>
      </View>
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
    maxWidth: 400,
  },
  iconContainer: {
    marginBottom: 24,
  },
  icon: {
    fontSize: 64,
    textAlign: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2C3E50',
    textAlign: 'center',
    marginBottom: 12,
  },
  message: {
    fontSize: 16,
    color: '#7F8C8D',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  actionContainer: {
    marginBottom: 32,
  },
  actionButton: {
    paddingHorizontal: 32,
  },
  tipsContainer: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E1E8ED',
    marginBottom: 32,
    width: '100%',
  },
  tipsTitle: {
    fontSize: 16,
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
    fontSize: 14,
    color: '#3498DB',
    marginRight: 8,
    marginTop: 2,
  },
  tipText: {
    fontSize: 14,
    color: '#7F8C8D',
    lineHeight: 20,
    flex: 1,
  },
  featuresContainer: {
    marginBottom: 32,
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
    fontSize: 14,
    fontWeight: '600',
    color: '#2C3E50',
    textAlign: 'center',
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 12,
    color: '#7F8C8D',
    textAlign: 'center',
    lineHeight: 16,
  },
  encouragementContainer: {
    backgroundColor: '#E8F4FD',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#B3D9F2',
    width: '100%',
  },
  encouragementText: {
    fontSize: 14,
    color: '#2C3E50',
    textAlign: 'center',
    lineHeight: 20,
  },
});
