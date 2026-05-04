/**
 * AR/VR Environments Loading Component
 * 
 * Loading state component for AR/VR environments with animated indicators
 * and progress feedback for different loading scenarios.
 */

import React from 'react';
import { View, StyleSheet, Text, Animated } from 'react-native';
import { Skeleton } from '../../../components/ui/Skeleton';

interface AREnvironmentsLoadingProps {
  type?: 'initial' | 'device-detection' | 'environment-loading' | 'tracking-calibration' | 'rendering-setup';
  message?: string;
  progress?: number;
}

export function AREnvironmentsLoading({ 
  type = 'initial', 
  message,
  progress 
}: AREnvironmentsLoadingProps) {
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
        return 'Initializing AR/VR Environments...';
      case 'device-detection':
        return 'Detecting AR/VR devices...';
      case 'environment-loading':
        return 'Loading immersive environments...';
      case 'tracking-calibration':
        return 'Calibrating tracking systems...';
      case 'rendering-setup':
        return 'Setting up rendering engine...';
      default:
        return 'Loading...';
    }
  };

  const getLoadingSteps = () => {
    switch (type) {
      case 'initial':
        return [
          'Connecting to AR/VR systems',
          'Loading environment engine',
          'Initializing tracking',
          'Setting up rendering',
        ];
      case 'device-detection':
        return [
          'Scanning for devices',
          'Checking compatibility',
          'Establishing connections',
          'Configuring settings',
        ];
      case 'environment-loading':
        return [
          'Loading virtual workspaces',
          'Preparing immersive experiences',
          'Setting up collaboration spaces',
          'Initializing 3D interfaces',
        ];
      case 'tracking-calibration':
        return [
          'Calibrating spatial tracking',
          'Setting up gesture recognition',
          'Configuring eye tracking',
          'Testing motion capture',
        ];
      case 'rendering-setup':
        return [
          'Initializing graphics engine',
          'Setting up 3D rendering',
          'Configuring spatial audio',
          'Optimizing performance',
        ];
      default:
        return ['Connecting...', 'Loading...', 'Configuring...', 'Finalizing...'];
    }
  };

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.content, { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }]}>
        {/* AR/VR Icon */}
        <View style={styles.iconContainer}>
          <Text style={styles.arvrIcon}>🥽</Text>
          <View style={styles.loadingDots}>
            {[0, 1, 2].map((index) => (
              <Animated.View
                key={index}
                style={[
                  styles.dot,
                  {
                    backgroundColor: '#9B59B6',
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

        {/* AR/VR Tips */}
        <View style={styles.tipsContainer}>
          <Text style={styles.tipsTitle}>AR/VR Tip:</Text>
          <Text style={styles.tipsText}>
            Your AR/VR environments are being prepared for immersive productivity experiences. 
            This includes device detection, tracking calibration, and environment setup.
          </Text>
        </View>

        {/* Feature Highlights */}
        <View style={styles.featuresContainer}>
          <Text style={styles.featuresTitle}>AR/VR Features:</Text>
          <View style={styles.featureGrid}>
            <View style={styles.featureItem}>
              <Text style={styles.featureIcon}>🌐</Text>
              <Text style={styles.featureName}>Spatial Computing</Text>
            </View>
            <View style={styles.featureItem}>
              <Text style={styles.featureIcon}>✋</Text>
              <Text style={styles.featureName}>Gesture Control</Text>
            </View>
            <View style={styles.featureItem}>
              <Text style={styles.featureIcon}>🎤</Text>
              <Text style={styles.featureName}>Voice Interface</Text>
            </View>
            <View style={styles.featureItem}>
              <Text style={styles.featureIcon}>👁️</Text>
              <Text style={styles.featureName}>Eye Tracking</Text>
            </View>
          </View>
        </View>

        {/* Device Support */}
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

        {/* Environment Capabilities */}
        <View style={styles.capabilitiesContainer}>
          <Text style={styles.capabilitiesTitle}>Environment Capabilities:</Text>
          <View style={styles.capabilitiesItems}>
            <View style={styles.capabilityItem}>
              <Text style={styles.capabilityLabel}>3D Rendering:</Text>
              <Text style={styles.capabilityValue}>Initializing...</Text>
            </View>
            <View style={styles.capabilityItem}>
              <Text style={styles.capabilityLabel}>Spatial Tracking:</Text>
              <Text style={styles.capabilityValue}>Calibrating...</Text>
            </View>
            <View style={styles.capabilityItem}>
              <Text style={styles.capabilityLabel}>Gesture Recognition:</Text>
              <Text style={styles.capabilityValue}>Setting up...</Text>
            </View>
            <View style={styles.capabilityItem}>
              <Text style={styles.capabilityLabel}>Audio Spatialization:</Text>
              <Text style={styles.capabilityValue}>Configuring...</Text>
            </View>
          </View>
        </View>

        {/* Processing Metrics */}
        <View style={styles.metricsContainer}>
          <Text style={styles.metricsTitle}>System Metrics:</Text>
          <View style={styles.metricsItems}>
            <View style={styles.metricItem}>
              <Text style={styles.metricLabel}>GPU Load:</Text>
              <Text style={styles.metricValue}>Analyzing...</Text>
            </View>
            <View style={styles.metricItem}>
              <Text style={styles.metricLabel}>Memory Usage:</Text>
              <Text style={styles.metricValue}>Checking...</Text>
            </View>
            <View style={styles.metricItem}>
              <Text style={styles.metricLabel}>Tracking Latency:</Text>
              <Text style={styles.metricValue}>Measuring...</Text>
            </View>
            <View style={styles.metricItem}>
              <Text style={styles.metricLabel}>Render FPS:</Text>
              <Text style={styles.metricValue}>Testing...</Text>
            </View>
          </View>
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

        {/* Integration Status */}
        <View style={styles.integrationContainer}>
          <Text style={styles.integrationTitle}>System Integration:</Text>
          <View style={styles.integrationItems}>
            <View style={styles.integrationItem}>
              <Text style={styles.integrationLabel}>Graphics Engine:</Text>
              <Text style={styles.integrationValue}>Loading...</Text>
            </View>
            <View style={styles.integrationItem}>
              <Text style={styles.integrationLabel}>Physics Engine:</Text>
              <Text style={styles.integrationValue}>Initializing...</Text>
            </View>
            <View style={styles.integrationItem}>
              <Text style={styles.integrationLabel}>Audio Engine:</Text>
              <Text style={styles.integrationValue}>Configuring...</Text>
            </View>
            <View style={styles.integrationItem}>
              <Text style={styles.integrationLabel}>Network Layer:</Text>
              <Text style={styles.integrationValue}>Establishing...</Text>
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
  arvrIcon: {
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
    backgroundColor: '#9B59B6',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#9B59B6',
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
    backgroundColor: '#F3E5F5',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D2B4DE',
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
    color: '#9B59B6',
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
  deviceContainer: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E1E8ED',
    marginBottom: 30,
    width: '100%',
  },
  deviceTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 12,
  },
  deviceList: {
    gap: 12,
  },
  deviceItem: {
    flexDirection: 'row',
    alignItems: 'center',
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
    color: '#9B59B6',
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
  safetyContainer: {
    backgroundColor: '#FFF3CD',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FFEAA7',
    marginBottom: 30,
    width: '100%',
  },
  safetyTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 12,
  },
  safetyPoints: {
    gap: 8,
  },
  safetyPoint: {
    fontSize: 12,
    color: '#856404',
    lineHeight: 16,
  },
  integrationContainer: {
    backgroundColor: '#E3F2FD',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#BBDEFB',
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
    color: '#3498DB',
    fontWeight: '600',
  },
});
