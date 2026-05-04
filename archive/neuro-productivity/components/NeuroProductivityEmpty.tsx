/**
 * Neuro Productivity Empty Component
 * 
 * Empty state component for neuro productivity when no data is available,
 * with helpful guidance and action prompts.
 */

import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { Button } from '../../../components/primitives/Button';

interface NeuroProductivityEmptyProps {
  type?: 'overview' | 'sessions' | 'devices' | 'enhancements' | 'all';
  onAction?: () => void;
  customMessage?: string;
  customIcon?: string;
}

export function NeuroProductivityEmpty({ 
  type = 'all', 
  onAction,
  customMessage,
  customIcon 
}: NeuroProductivityEmptyProps) {
  const getEmptyState = () => {
    switch (type) {
      case 'overview':
        return {
          icon: customIcon || '🧠',
          title: 'No Neuro Data Yet',
          message: customMessage || 'Start monitoring your brain activity to get personalized productivity insights.',
          actionText: 'Start Monitoring',
          tips: [
            'Connect a neuro device',
            'Begin brainwave analysis',
            'Track cognitive performance',
            'Get optimization recommendations',
          ],
        };
      case 'sessions':
        return {
          icon: customIcon || '🎯',
          title: 'No Neuro Sessions',
          message: customMessage || 'Start neuro feedback sessions to enhance your focus and cognitive performance.',
          actionText: 'Start Session',
          tips: [
            'Choose session type',
            'Connect neuro device',
            'Set goals',
            'Begin real-time feedback',
          ],
        };
      case 'devices':
        return {
          icon: customIcon || '📱',
          title: 'No Neuro Devices',
          message: customMessage || 'Connect neuro devices to start monitoring your brain activity and cognitive state.',
          actionText: 'Connect Device',
          tips: [
            'Connect EEG headset',
            'Pair heart rate monitor',
            'Set up GSR sensor',
            'Calibrate sensors',
          ],
        };
      case 'enhancements':
        return {
          icon: customIcon || '⚡',
          title: 'No Enhancements',
          message: customMessage || 'Generate cognitive enhancement protocols to optimize your productivity.',
          actionText: 'Generate Plan',
          tips: [
            'Analyze performance data',
            'Set optimization goals',
            'Create enhancement protocols',
            'Apply personalized strategies',
          ],
        };
      default:
        return {
          icon: customIcon || '🧠',
          title: 'Welcome to Neuro Productivity',
          message: customMessage || 'Optimize your productivity with brainwave analysis and cognitive enhancement.',
          actionText: 'Get Started',
          tips: [
            'Connect neuro devices',
            'Start brainwave monitoring',
            'Begin neuro feedback sessions',
            'Generate optimization plans',
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
          <Text style={styles.featuresTitle}>Neuro Features:</Text>
          <View style={styles.featureGrid}>
            <View style={styles.featureItem}>
              <Text style={styles.featureIcon}>🧠</Text>
              <Text style={styles.featureName}>Brainwave Analysis</Text>
              <Text style={styles.featureDescription}>Real-time EEG monitoring</Text>
            </View>
            <View style={styles.featureItem}>
              <Text style={styles.featureIcon}>🎯</Text>
              <Text style={styles.featureName}>Focus Enhancement</Text>
              <Text style={styles.featureDescription}>Neuro feedback training</Text>
            </View>
            <View style={styles.featureItem}>
              <Text style={styles.featureIcon}>⚡</Text>
              <Text style={styles.featureName}>Energy Optimization</Text>
              <Text style={styles.featureDescription}>Cognitive fatigue tracking</Text>
            </View>
            <View style={styles.featureItem}>
              <Text style={styles.featureIcon}>📊</Text>
              <Text style={styles.featureName}>Performance Metrics</Text>
              <Text style={styles.featureDescription}>Cognitive scoring system</Text>
            </View>
          </View>
        </View>

        {/* Device Support */}
        <View style={styles.deviceContainer}>
          <Text style={styles.deviceTitle}>Supported Devices:</Text>
          <View style={styles.deviceList}>
            <View style={styles.deviceItem}>
              <Text style={styles.deviceIcon}>🎧</Text>
              <View style={styles.deviceInfo}>
                <Text style={styles.deviceName}>EEG Headsets</Text>
                <Text style={styles.deviceDesc}>Brainwave monitoring</Text>
              </View>
            </View>
            <View style={styles.deviceItem}>
              <Text style={styles.deviceIcon}>❤️</Text>
              <View style={styles.deviceInfo}>
                <Text style={styles.deviceName}>Heart Rate Monitors</Text>
                <Text style={styles.deviceDesc}>Physiological data</Text>
              </View>
            </View>
            <View style={styles.deviceItem}>
              <Text style={styles.deviceIcon}>🤚</Text>
              <View style={styles.deviceInfo}>
                <Text style={styles.deviceName}>GSR Sensors</Text>
                <Text style={styles.deviceDesc}>Stress response tracking</Text>
              </View>
            </View>
            <View style={styles.deviceItem}>
              <Text style={styles.deviceIcon}>👁️</Text>
              <View style={styles.deviceInfo}>
                <Text style={styles.deviceName}>Eye Trackers</Text>
                <Text style={styles.deviceDesc}>Attention monitoring</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Benefits */}
        <View style={styles.benefitsContainer}>
          <Text style={styles.benefitsTitle}>Why Neuro Productivity?</Text>
          <View style={styles.benefitsList}>
            <Text style={styles.benefitItem}>• Real-time cognitive state monitoring</Text>
            <Text style={styles.benefitItem}>• Personalized neuro feedback training</Text>
            <Text style={styles.benefitItem}>• Data-driven productivity optimization</Text>
            <Text style={styles.benefitItem}>• Cognitive performance enhancement</Text>
            <Text style={styles.benefitItem}>• Mental fatigue prevention</Text>
          </View>
        </View>

        {/* Getting Started */}
        <View style={styles.gettingStartedContainer}>
          <Text style={styles.gettingStartedTitle}>Getting Started:</Text>
          <View style={styles.gettingStartedSteps}>
            <View style={styles.stepItem}>
              <Text style={styles.stepNumber}>1</Text>
              <Text style={styles.stepText}>Connect your neuro device</Text>
            </View>
            <View style={styles.stepItem}>
              <Text style={styles.stepNumber}>2</Text>
              <Text style={styles.stepText}>Start brainwave monitoring</Text>
            </View>
            <View style={styles.stepItem}>
              <Text style={styles.stepNumber}>3</Text>
              <Text style={styles.stepText}>Begin neuro feedback session</Text>
            </View>
            <View style={styles.stepItem}>
              <Text style={styles.stepNumber}>4</Text>
              <Text style={styles.stepText}>Review cognitive insights</Text>
            </View>
          </View>
        </View>

        {/* Scientific Background */}
        <View style={styles.scienceContainer}>
          <Text style={styles.scienceTitle}>Science Behind It:</Text>
          <Text style={styles.scienceText}>
            Neuro productivity uses EEG (electroencephalography) to monitor brainwave patterns 
            associated with focus, relaxation, and cognitive load. Real-time feedback helps 
            train your brain to enter optimal states for productivity and learning.
          </Text>
        </View>

        {/* Privacy & Safety */}
        <View style={styles.privacyContainer}>
          <Text style={styles.privacyTitle}>Privacy & Safety:</Text>
          <View style={styles.privacyPoints}>
            <Text style={styles.privacyPoint}>• All brain data is processed locally</Text>
            <Text style={styles.privacyPoint}>• No personal information is shared</Text>
            <Text style={styles.privacyPoint}>• Medical-grade sensor safety standards</Text>
            <Text style={styles.privacyPoint}>• Full control over your data</Text>
          </View>
        </View>

        {/* Encouragement */}
        <View style={styles.encouragementContainer}>
          <Text style={styles.encouragementText}>
            Unlock your brain's full potential with scientifically-backed neuro productivity tools. 
            Start your journey to enhanced focus, better energy management, and peak cognitive performance.
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
    color: '#9B59B6',
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
  deviceContainer: {
    marginBottom: 32,
    width: '100%',
  },
  deviceTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 16,
  },
  deviceList: {
    gap: 12,
  },
  deviceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E1E8ED',
  },
  deviceIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  deviceInfo: {
    flex: 1,
  },
  deviceName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 2,
  },
  deviceDesc: {
    fontSize: 12,
    color: '#7F8C8D',
  },
  benefitsContainer: {
    marginBottom: 32,
    width: '100%',
  },
  benefitsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 12,
  },
  benefitsList: {
    gap: 8,
  },
  benefitItem: {
    fontSize: 14,
    color: '#7F8C8D',
    lineHeight: 20,
  },
  gettingStartedContainer: {
    backgroundColor: '#F3E5F5',
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#D2B4DE',
    marginBottom: 32,
    width: '100%',
  },
  gettingStartedTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 16,
  },
  gettingStartedSteps: {
    gap: 12,
  },
  stepItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stepNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#9B59B6',
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
    textAlign: 'center',
    lineHeight: 24,
    marginRight: 12,
  },
  stepText: {
    fontSize: 14,
    color: '#2C3E50',
    flex: 1,
  },
  scienceContainer: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E1E8ED',
    marginBottom: 32,
    width: '100%',
  },
  scienceTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 12,
  },
  scienceText: {
    fontSize: 14,
    color: '#7F8C8D',
    lineHeight: 20,
  },
  privacyContainer: {
    backgroundColor: '#E8F8F5',
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#A3E4D7',
    marginBottom: 32,
    width: '100%',
  },
  privacyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 12,
  },
  privacyPoints: {
    gap: 8,
  },
  privacyPoint: {
    fontSize: 14,
    color: '#27AE60',
    lineHeight: 20,
  },
  encouragementContainer: {
    backgroundColor: '#FFF3CD',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FFEAA7',
    width: '100%',
  },
  encouragementText: {
    fontSize: 14,
    color: '#2C3E50',
    textAlign: 'center',
    lineHeight: 20,
  },
});
