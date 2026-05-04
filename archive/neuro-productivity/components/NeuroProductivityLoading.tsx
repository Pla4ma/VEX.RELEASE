/**
 * Neuro Productivity Loading Component
 * 
 * Loading state component for neuro productivity with animated indicators
 * and progress feedback for different loading scenarios.
 */

import React from 'react';
import { View, StyleSheet, Text, Animated } from 'react-native';
import { Skeleton } from '../../../components/ui/Skeleton';

interface NeuroProductivityLoadingProps {
  type?: 'initial' | 'device-connection' | 'brainwave-analysis' | 'session-start' | 'optimization';
  message?: string;
  progress?: number;
}

export function NeuroProductivityLoading({ 
  type = 'initial', 
  message,
  progress 
}: NeuroProductivityLoadingProps) {
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
        return 'Initializing Neuro Productivity...';
      case 'device-connection':
        return 'Connecting to neuro device...';
      case 'brainwave-analysis':
        return 'Analyzing brainwave patterns...';
      case 'session-start':
        return 'Starting neuro feedback session...';
      case 'optimization':
        return 'Generating optimization plan...';
      default:
        return 'Loading...';
    }
  };

  const getLoadingSteps = () => {
    switch (type) {
      case 'initial':
        return [
          'Initializing neuro system',
          'Calibrating sensors',
          'Loading cognitive models',
          'Preparing feedback loops',
        ];
      case 'device-connection':
        return [
          'Scanning for devices',
          'Establishing connection',
          'Calibrating sensors',
          'Verifying signal quality',
        ];
      case 'brainwave-analysis':
        return [
          'Collecting brainwave data',
          'Processing EEG signals',
          'Analyzing patterns',
          'Generating insights',
        ];
      case 'session-start':
        return [
          'Preparing session environment',
          'Starting real-time monitoring',
          'Initializing feedback system',
          'Calibrating baseline',
        ];
      case 'optimization':
        return [
          'Analyzing performance data',
          'Identifying optimization opportunities',
          'Generating enhancement protocols',
          'Creating personalized plan',
        ];
      default:
        return ['Connecting...', 'Processing...', 'Finalizing...'];
    }
  };

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.content, { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }]}>
        {/* Brain Icon */}
        <View style={styles.iconContainer}>
          <Text style={styles.brainIcon}>🧠</Text>
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
          <Skeleton height={80} style={styles.skeletonCard} />
          <Skeleton height={80} style={styles.skeletonCard} />
          <Skeleton height={80} style={styles.skeletonCard} />
        </View>

        {/* Neuro Tips */}
        <View style={styles.tipsContainer}>
          <Text style={styles.tipsTitle}>Neuro Tip:</Text>
          <Text style={styles.tipsText}>
            Your brain activity patterns are being analyzed to provide personalized productivity insights and cognitive enhancement recommendations.
          </Text>
        </View>

        {/* Feature Highlights */}
        <View style={styles.featuresContainer}>
          <Text style={styles.featuresTitle}>Neuro Features:</Text>
          <View style={styles.featureGrid}>
            <View style={styles.featureItem}>
              <Text style={styles.featureIcon}>🧠</Text>
              <Text style={styles.featureName}>Brainwave Analysis</Text>
            </View>
            <View style={styles.featureItem}>
              <Text style={styles.featureIcon}>🎯</Text>
              <Text style={styles.featureName}>Focus Enhancement</Text>
            </View>
            <View style={styles.featureItem}>
              <Text style={styles.featureIcon}>⚡</Text>
              <Text style={styles.featureName}>Energy Optimization</Text>
            </View>
            <View style={styles.featureItem}>
              <Text style={styles.featureIcon}>📊</Text>
              <Text style={styles.featureName}>Cognitive Metrics</Text>
            </View>
          </View>
        </View>

        {/* Device Information */}
        <View style={styles.deviceContainer}>
          <Text style={styles.deviceTitle}>Device Status:</Text>
          <View style={styles.deviceItems}>
            <View style={styles.deviceItem}>
              <Text style={styles.deviceLabel}>EEG Headset:</Text>
              <Text style={styles.deviceValue}>Connecting...</Text>
            </View>
            <View style={styles.deviceItem}>
              <Text style={styles.deviceLabel}>Heart Rate:</Text>
              <Text style={styles.deviceValue}>Scanning...</Text>
            </View>
            <View style={styles.deviceItem}>
              <Text style={styles.deviceLabel}>GSR Sensor:</Text>
              <Text style={styles.deviceValue}>Ready</Text>
            </View>
          </View>
        </View>

        {/* Cognitive State */}
        <View style={styles.cognitiveContainer}>
          <Text style={styles.cognitiveTitle}>Cognitive State Analysis:</Text>
          <View style={styles.cognitiveItems}>
            <View style={styles.cognitiveItem}>
              <Text style={styles.cognitiveLabel}>Focus Level:</Text>
              <Text style={styles.cognitiveValue}>Analyzing...</Text>
            </View>
            <View style={styles.cognitiveItem}>
              <Text style={styles.cognitiveLabel}>Mental Energy:</Text>
              <Text style={styles.cognitiveValue}>Calculating...</Text>
            </View>
            <View style={styles.cognitiveItem}>
              <Text style={styles.cognitiveLabel}>Cognitive Load:</Text>
              <Text style={styles.cognitiveValue}>Processing...</Text>
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
  brainIcon: {
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
  deviceItems: {
    gap: 8,
  },
  deviceItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  deviceLabel: {
    fontSize: 12,
    color: '#7F8C8D',
  },
  deviceValue: {
    fontSize: 12,
    color: '#2C3E50',
    fontWeight: '600',
  },
  cognitiveContainer: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E1E8ED',
    width: '100%',
  },
  cognitiveTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 12,
  },
  cognitiveItems: {
    gap: 8,
  },
  cognitiveItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cognitiveLabel: {
    fontSize: 12,
    color: '#7F8C8D',
  },
  cognitiveValue: {
    fontSize: 12,
    color: '#9B59B6',
    fontWeight: '600',
  },
});
