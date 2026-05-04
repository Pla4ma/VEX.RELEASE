/**
 * AR/VR Environments Empty Component
 * 
 * Empty state component for AR/VR environments when no data is available,
 * with helpful guidance and action prompts.
 */

import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { Button } from '../../../components/primitives/Button';

interface AREnvironmentsEmptyProps {
  type?: 'overview' | 'workspaces' | 'experiences' | 'collaboration' | 'devices' | 'all';
  onAction?: () => void;
  customMessage?: string;
  customIcon?: string;
}

export function AREnvironmentsEmpty({ 
  type = 'all', 
  onAction,
  customMessage,
  customIcon 
}: AREnvironmentsEmptyProps) {
  const getEmptyState = () => {
    switch (type) {
      case 'overview':
        return {
          icon: customIcon || '🥽',
          title: 'No AR/VR Data Yet',
          message: customMessage || 'Connect your AR/VR devices to start immersive productivity experiences.',
          actionText: 'Connect Devices',
          tips: [
            'Detect AR/VR headsets',
            'Configure tracking systems',
            'Set up spatial computing',
            'Enable gesture control',
          ],
        };
      case 'workspaces':
        return {
          icon: customIcon || '🏢',
          title: 'No Virtual Workspaces',
          message: customMessage || 'Create your first virtual workspace to experience immersive productivity.',
          actionText: 'Create Workspace',
          tips: [
            'Choose workspace type',
            'Set up environment',
            'Configure collaboration',
            'Add productivity tools',
          ],
        };
      case 'experiences':
        return {
          icon: customIcon || '🎮',
          title: 'No Immersive Experiences',
          message: customMessage || 'Start your first AR/VR experience to explore immersive productivity.',
          actionText: 'Start Experience',
          tips: [
            'Select experience type',
            'Configure intensity',
            'Set up interactions',
            'Begin immersion',
          ],
        };
      case 'collaboration':
        return {
          icon: customIcon || '👥',
          title: 'No Collaboration Spaces',
          message: customMessage || 'Create collaboration spaces for immersive teamwork and meetings.',
          actionText: 'Create Space',
          tips: [
            'Set up meeting space',
            'Invite participants',
            'Configure tools',
            'Start collaboration',
          ],
        };
      case 'devices':
        return {
          icon: customIcon || '🔧',
          title: 'No Devices Connected',
          message: customMessage || 'Connect AR/VR devices to enable immersive experiences.',
          actionText: 'Connect Devices',
          tips: [
            'Scan for devices',
            'Check compatibility',
            'Establish connections',
            'Configure settings',
          ],
        };
      default:
        return {
          icon: customIcon || '🥽',
          title: 'Welcome to AR/VR Environments',
          message: customMessage || 'Experience immersive productivity with augmented and virtual reality.',
          actionText: 'Get Started',
          tips: [
            'Connect AR/VR devices',
            'Create virtual workspaces',
            'Start immersive experiences',
            'Enable collaboration',
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
          <Text style={styles.featuresTitle}>AR/VR Features:</Text>
          <View style={styles.featureGrid}>
            <View style={styles.featureItem}>
              <Text style={styles.featureIcon}>🌐</Text>
              <Text style={styles.featureName}>Spatial Computing</Text>
              <Text style={styles.featureDescription}>3D environment interaction</Text>
            </View>
            <View style={styles.featureItem}>
              <Text style={styles.featureIcon}>✋</Text>
              <Text style={styles.featureName}>Gesture Control</Text>
              <Text style={styles.featureDescription}>Natural hand interactions</Text>
            </View>
            <View style={styles.featureItem}>
              <Text style={styles.featureIcon}>🎤</Text>
              <Text style={styles.featureName}>Voice Interface</Text>
              <Text style={styles.featureDescription}>Voice commands & control</Text>
            </View>
            <View style={styles.featureItem}>
              <Text style={styles.featureIcon}>👁️</Text>
              <Text style={styles.featureName}>Eye Tracking</Text>
              <Text style={styles.featureDescription}>Gaze-based interactions</Text>
            </View>
          </View>
        </View>

        {/* Supported Devices */}
        <View style={styles.deviceContainer}>
          <Text style={styles.deviceTitle}>Supported Devices:</Text>
          <View style={styles.deviceList}>
            <View style={styles.deviceItem}>
              <Text style={styles.deviceIcon}>🥽</Text>
              <View style={styles.deviceInfo}>
                <Text style={styles.deviceName}>AR Headsets</Text>
                <Text style={styles.deviceDesc}>HoloLens, Magic Leap</Text>
              </View>
            </View>
            <View style={styles.deviceItem}>
              <Text style={styles.deviceIcon}>🎮</Text>
              <View style={styles.deviceInfo}>
                <Text style={styles.deviceName}>VR Headsets</Text>
                <Text style={styles.deviceDesc}>Oculus Quest, HTC Vive</Text>
              </View>
            </View>
            <View style={styles.deviceItem}>
              <Text style={styles.deviceIcon}>📱</Text>
              <View style={styles.deviceInfo}>
                <Text style={styles.deviceName}>Mobile AR</Text>
                <Text style={styles.deviceDesc}>iOS & Android devices</Text>
              </View>
            </View>
            <View style={styles.deviceItem}>
              <Text style={styles.deviceIcon}>💻</Text>
              <View style={styles.deviceInfo}>
                <Text style={styles.deviceName}>Desktop VR</Text>
                <Text style={styles.deviceDesc}>PC-connected systems</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Benefits */}
        <View style={styles.benefitsContainer}>
          <Text style={styles.benefitsTitle}>Why AR/VR Environments?</Text>
          <View style={styles.benefitsList}>
            <Text style={styles.benefitItem}>• Immersive productivity experiences</Text>
            <Text style={styles.benefitItem}>• Enhanced collaboration capabilities</Text>
            <Text style={styles.benefitItem}>• Spatial data visualization</Text>
            <Text style={styles.benefitItem}>• Natural gesture interactions</Text>
            <Text style={styles.benefitItem}>• Voice-controlled interfaces</Text>
          </View>
        </View>

        {/* Getting Started */}
        <View style={styles.gettingStartedContainer}>
          <Text style={styles.gettingStartedTitle}>Getting Started:</Text>
          <View style={styles.gettingStartedSteps}>
            <View style={styles.stepItem}>
              <Text style={styles.stepNumber}>1</Text>
              <Text style={styles.stepText}>Connect AR/VR devices</Text>
            </View>
            <View style={styles.stepItem}>
              <Text style={styles.stepNumber}>2</Text>
              <Text style={styles.stepText}>Configure tracking systems</Text>
            </View>
            <View style={styles.stepItem}>
              <Text style={styles.stepNumber}>3</Text>
              <Text style={styles.stepText}>Create virtual workspace</Text>
            </View>
            <View style={styles.stepItem}>
              <Text style={styles.stepNumber}>4</Text>
              <Text style={styles.stepText}>Start immersive experience</Text>
            </View>
          </View>
        </View>

        {/* Environment Capabilities */}
        <View style={styles.capabilitiesContainer}>
          <Text style={styles.capabilitiesTitle}>Environment Capabilities:</Text>
          <Text style={styles.capabilitiesText}>
            AR/VR Environments provide immersive productivity through spatial computing, 
            natural interactions, and collaborative workspaces. Transform your productivity 
            with augmented and virtual reality experiences.
          </Text>
        </View>

        {/* Safety Information */}
        <View style={styles.safetyContainer}>
          <Text style={styles.safetyTitle}>Safety Information:</Text>
          <View style={styles.safetyPoints}>
            <Text style={styles.safetyPoint}>• Ensure adequate space for movement</Text>
            <Text style={styles.safetyPoint}>• Clear obstacles from play area</Text>
            <Text style={styles.safetyPoint}>• Take regular breaks to prevent fatigue</Text>
            <Text style={styles.safetyPoint}>• Stay hydrated during sessions</Text>
          </View>
        </View>

        {/* Integration Support */}
        <View style={styles.integrationContainer}>
          <Text style={styles.integrationTitle}>Integration Support:</Text>
          <View style={styles.integrationItems}>
            <View style={styles.integrationItem}>
              <Text style={styles.integrationLabel}>Graphics Engine:</Text>
              <Text style={styles.integrationValue}>Unity, Unreal Engine</Text>
            </View>
            <View style={styles.integrationItem}>
              <Text style={styles.integrationLabel}>Tracking Systems:</Text>
              <Text style={styles.integrationValue}>ARCore, ARKit</Text>
            </View>
            <View style={styles.integrationItem}>
              <Text style={styles.integrationLabel}>Audio Systems:</Text>
              <Text style={styles.integrationValue}>Spatial audio, 3D sound</Text>
            </View>
            <View style={styles.integrationItem}>
              <Text style={styles.integrationLabel}>Input Methods:</Text>
              <Text style={styles.integrationValue}>Gestures, voice, controllers</Text>
            </View>
          </View>
        </View>

        {/* Success Metrics */}
        <View style={styles.metricsContainer}>
          <Text style={styles.metricsTitle}>Performance Metrics:</Text>
          <View style={styles.metricsList}>
            <Text style={styles.metricsItem}>• 90+ FPS rendering performance</Text>
            <Text style={styles.metricsItem}>• Sub-20ms tracking latency</Text>
            <Text style={styles.metricsItem}>• 99.9% device compatibility</Text>
            <Text style={styles.metricsItem}>• Enterprise-grade security</Text>
          </View>
        </View>

        {/* Encouragement */}
        <View style={styles.encouragementContainer}>
          <Text style={styles.encouragementText}>
            Transform your productivity with immersive AR/VR environments. Experience spatial computing, 
            natural interactions, and collaborative workspaces that redefine how you work and create.
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
  capabilitiesContainer: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E1E8ED',
    marginBottom: 32,
    width: '100%',
  },
  capabilitiesTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 12,
  },
  capabilitiesText: {
    fontSize: 14,
    color: '#7F8C8D',
    lineHeight: 20,
  },
  safetyContainer: {
    backgroundColor: '#FFF3CD',
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FFEAA7',
    marginBottom: 32,
    width: '100%',
  },
  safetyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 12,
  },
  safetyPoints: {
    gap: 8,
  },
  safetyPoint: {
    fontSize: 14,
    color: '#856404',
    lineHeight: 20,
  },
  integrationContainer: {
    backgroundColor: '#E3F2FD',
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#BBDEFB',
    marginBottom: 32,
    width: '100%',
  },
  integrationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 16,
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
    color: '#3498DB',
    fontWeight: '600',
  },
  metricsContainer: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E1E8ED',
    marginBottom: 32,
    width: '100%',
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
  metricsItem: {
    fontSize: 14,
    color: '#7F8C8D',
    lineHeight: 20,
  },
  encouragementContainer: {
    backgroundColor: '#F3E5F5',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D2B4DE',
    width: '100%',
  },
  encouragementText: {
    fontSize: 14,
    color: '#2C3E50',
    textAlign: 'center',
    lineHeight: 20,
  },
});
