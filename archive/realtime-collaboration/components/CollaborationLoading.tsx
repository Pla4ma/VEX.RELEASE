/**
 * Collaboration Loading Component
 * 
 * Loading state component for realtime collaboration with animated indicators
 * and progress feedback for different loading scenarios.
 */

import React from 'react';
import { View, StyleSheet, Text, Animated } from 'react-native';
import { Skeleton } from '../../../components/ui/Skeleton';

interface CollaborationLoadingProps {
  type?: 'initial' | 'session' | 'workspace' | 'video' | 'audio' | 'immersive';
  message?: string;
  progress?: number;
}

export function CollaborationLoading({ 
  type = 'initial', 
  message,
  progress 
}: CollaborationLoadingProps) {
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
        return 'Initializing Collaboration...';
      case 'session':
        return 'Starting collaboration session...';
      case 'workspace':
        return 'Loading workspace...';
      case 'video':
        return 'Connecting video call...';
      case 'audio':
        return 'Starting audio call...';
      case 'immersive':
        return 'Entering immersive environment...';
      default:
        return 'Loading...';
    }
  };

  const getLoadingSteps = () => {
    switch (type) {
      case 'initial':
        return [
          'Connecting to collaboration servers',
          'Loading workspace data',
          'Initializing video/audio systems',
          'Preparing immersive environments',
        ];
      case 'session':
        return [
          'Creating session workspace',
          'Inviting participants',
          'Enabling real-time features',
          'Starting collaboration tools',
        ];
      case 'workspace':
        return [
          'Loading workspace content',
          'Synchronizing documents',
          'Preparing collaboration tools',
          'Ready for teamwork',
        ];
      case 'video':
        return [
          'Initializing video engine',
          'Configuring camera settings',
          'Establishing video connection',
          'Ready for face-to-face collaboration',
        ];
      case 'audio':
        return [
          'Initializing audio engine',
          'Configuring microphone settings',
          'Establishing audio connection',
          'Ready for voice collaboration',
        ];
      case 'immersive':
        return [
          'Loading immersive environment',
          'Configuring VR/AR settings',
          'Establishing spatial connection',
          'Ready for immersive collaboration',
        ];
      default:
        return ['Connecting...', 'Synchronizing...', 'Finalizing...'];
    }
  };

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.content, { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }]}>
        {/* Collaboration Icon */}
        <View style={styles.iconContainer}>
          <Text style={styles.collaborationIcon}>🤝</Text>
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
          <Skeleton height={80} style={styles.skeletonCard} />
          <Skeleton height={80} style={styles.skeletonCard} />
          <Skeleton height={80} style={styles.skeletonCard} />
        </View>

        {/* Collaboration Tips */}
        <View style={styles.tipsContainer}>
          <Text style={styles.tipsTitle}>Collaboration Tip:</Text>
          <Text style={styles.tipsText}>
            Real-time collaboration enables seamless teamwork with video, audio, and shared workspaces.
          </Text>
        </View>

        {/* Feature Highlights */}
        <View style={styles.featuresContainer}>
          <Text style={styles.featuresTitle}>Collaboration Features:</Text>
          <View style={styles.featureGrid}>
            <View style={styles.featureItem}>
              <Text style={styles.featureIcon}>📹</Text>
              <Text style={styles.featureName}>Video Calls</Text>
            </View>
            <View style={styles.featureItem}>
              <Text style={styles.featureIcon}>🎤</Text>
              <Text style={styles.featureName}>Audio Calls</Text>
            </View>
            <View style={styles.featureItem}>
              <Text style={styles.featureIcon}>📝</Text>
              <Text style={styles.featureName}>Shared Documents</Text>
            </View>
            <View style={styles.featureItem}>
              <Text style={styles.featureIcon}>🏢</Text>
              <Text style={styles.featureName}>Workspaces</Text>
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
  collaborationIcon: {
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
    backgroundColor: '#E8F4FD',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#B3D9F2',
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
    width: '100%',
  },
  featuresTitle: {
    fontSize: 14,
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
    padding: 12,
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
});
