/**
 * Life Simulation Loading Component
 * 
 * Loading state UI for life simulation features with animated indicators,
 * progress feedback, loading steps, avatar creation tips, feature highlights,
 * data source status, system integration status, processing metrics,
 * and life simulation information.
 */

import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Animated, Dimensions } from 'react-native';
import { Card } from '../../../components/primitives/Card';
import { Badge } from '../../../components/primitives/Badge';
import { ProgressBar } from '../../../components/ProgressBar';

const { width } = Dimensions.get('window');

export function LifeSimulationLoading() {
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);
  const [pulseAnim] = useState(new Animated.Value(1));
  const [slideAnim] = useState(new Animated.Value(20));
  const [fadeAnim] = useState(new Animated.Value(0));

  const loadingSteps = [
    'Initializing life simulation system...',
    'Loading avatar data...',
    'Fetching life events...',
    'Processing career information...',
    'Loading relationship data...',
    'Calculating achievements...',
    'Updating life statistics...',
    'Preparing simulation dashboard...',
  ];

  const lifeTips = [
    '👤 Create a unique avatar to start your life journey',
    '💼 Choose a career path that matches your interests',
    '👥 Build meaningful relationships for social growth',
    '🏆 Complete achievements to unlock special rewards',
    '📊 Monitor your life stats to maintain balance',
    '🎯 Make strategic choices in life events',
    '📈 Progress through career levels for better opportunities',
    '💰 Manage your finances wisely for long-term success',
  ];

  const featureHighlights = [
    '🎭 Dynamic avatar creation with personality traits',
    '💼 Multiple career paths with progression systems',
    '👥 Relationship management with social dynamics',
    '🏆 Achievement system with unlockable rewards',
    '📊 Real-time life statistics tracking',
    '🎯 Interactive life events with meaningful choices',
    '📈 Career advancement with skill development',
    '💰 Financial management and budget tracking',
  ];

  useEffect(() => {
    // Pulse animation
    const pulseAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );
    pulseAnimation.start();

    // Slide animation
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 500,
      useNativeDriver: true,
    }).start();

    // Fade animation
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();

    // Progress animation
    const progressInterval = setInterval(() => {
      setLoadingProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return prev + Math.random() * 15;
      });
    }, 800);

    // Step animation
    const stepInterval = setInterval(() => {
      setCurrentStep(prev => {
        if (prev >= loadingSteps.length - 1) {
          clearInterval(stepInterval);
          return loadingSteps.length - 1;
        }
        return prev + 1;
      });
    }, 1200);

    return () => {
      pulseAnimation.stop();
      clearInterval(progressInterval);
      clearInterval(stepInterval);
    };
  }, []);

  const getRandomTip = () => {
    return lifeTips[Math.floor(Math.random() * lifeTips.length)];
  };

  const getRandomHighlight = () => {
    return featureHighlights[Math.floor(Math.random() * featureHighlights.length)];
  };

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.loadingContainer,
          { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
        ]}
      >
        {/* Main Loading Card */}
        <Card style={styles.mainCard}>
          <View style={styles.header}>
            <Animated.View
              style={[
                styles.iconContainer,
                { transform: [{ scale: pulseAnim }] },
              ]}
            >
              <Text style={styles.icon}>🎭</Text>
            </Animated.View>
            <Text style={styles.title}>Life Simulation</Text>
            <Text style={styles.subtitle}>Loading your virtual life...</Text>
          </View>

          {/* Progress Bar */}
          <View style={styles.progressContainer}>
            <ProgressBar progress={loadingProgress} color="#9B59B6" />
            <Text style={styles.progressText}>
              {Math.round(loadingProgress)}% Complete
            </Text>
          </View>

          {/* Current Step */}
          <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>Current Step:</Text>
            <Text style={styles.stepText}>{loadingSteps[currentStep]}</Text>
          </View>
        </Card>

        {/* Life Tips */}
        <Card style={styles.tipsCard}>
          <Text style={styles.tipsTitle}>💡 Life Tip</Text>
          <Text style={styles.tipsText}>{getRandomTip()}</Text>
        </Card>

        {/* Feature Highlights */}
        <Card style={styles.featuresCard}>
          <Text style={styles.featuresTitle}>✨ Feature Highlight</Text>
          <Text style={styles.featuresText}>{getRandomHighlight()}</Text>
        </Card>

        {/* Data Source Status */}
        <Card style={styles.statusCard}>
          <Text style={styles.statusTitle}>📊 Data Sources</Text>
          <View style={styles.statusList}>
            <View style={styles.statusItem}>
              <Badge text="Avatar" variant="success" />
              <Text style={styles.statusText}>Connected</Text>
            </View>
            <View style={styles.statusItem}>
              <Badge text="Life Events" variant="success" />
              <Text style={styles.statusText}>Connected</Text>
            </View>
            <View style={styles.statusItem}>
              <Badge text="Careers" variant="warning" />
              <Text style={styles.statusText}>Loading...</Text>
            </View>
            <View style={styles.statusItem}>
              <Badge text="Relationships" variant="success" />
              <Text style={styles.statusText}>Connected</Text>
            </View>
          </View>
        </Card>

        {/* System Integration Status */}
        <Card style={styles.integrationCard}>
          <Text style={styles.integrationTitle}>🔗 System Integration</Text>
          <View style={styles.integrationList}>
            <View style={styles.integrationItem}>
              <Text style={styles.integrationName}>Avatar Engine</Text>
              <Badge text="Active" variant="success" />
            </View>
            <View style={styles.integrationItem}>
              <Text style={styles.integrationName}>Event Generator</Text>
              <Badge text="Active" variant="success" />
            </View>
            <View style={styles.integrationItem}>
              <Text style={styles.integrationName}>Career System</Text>
              <Badge text="Active" variant="success" />
            </View>
            <View style={styles.integrationItem}>
              <Text style={styles.integrationName}>Relationship AI</Text>
              <Badge text="Syncing..." variant="warning" />
            </View>
          </View>
        </Card>

        {/* Processing Metrics */}
        <Card style={styles.metricsCard}>
          <Text style={styles.metricsTitle}>📈 Processing Metrics</Text>
          <View style={styles.metricsGrid}>
            <View style={styles.metricItem}>
              <Text style={styles.metricValue}>{Math.round(loadingProgress * 0.8)}</Text>
              <Text style={styles.metricLabel}>Avatars Loaded</Text>
            </View>
            <View style={styles.metricItem}>
              <Text style={styles.metricValue}>{Math.round(loadingProgress * 1.2)}</Text>
              <Text style={styles.metricLabel}>Life Events</Text>
            </View>
            <View style={styles.metricItem}>
              <Text style={styles.metricValue}>{Math.round(loadingProgress * 0.6)}</Text>
              <Text style={styles.metricLabel}>Careers</Text>
            </View>
            <View style={styles.metricItem}>
              <Text style={styles.metricValue}>{Math.round(loadingProgress * 0.4)}</Text>
              <Text style={styles.metricLabel}>Relationships</Text>
            </View>
          </View>
        </Card>

        {/* Life Simulation Information */}
        <Card style={styles.simulationCard}>
          <Text style={styles.simulationTitle}>🎭 Life Simulation Features</Text>
          <View style={styles.simulationList}>
            <View style={styles.simulationItem}>
              <Text style={styles.simulationIcon}>👤</Text>
              <View style={styles.simulationContent}>
                <Text style={styles.simulationName}>Avatar Creation</Text>
                <Text style={styles.simulationDescription}>
                  Create unique avatars with customizable appearance, personality traits, and skills
                </Text>
              </View>
            </View>
            <View style={styles.simulationItem}>
              <Text style={styles.simulationIcon}>💼</Text>
              <View style={styles.simulationContent}>
                <Text style={styles.simulationName}>Career Progression</Text>
                <Text style={styles.simulationDescription}>
                  Choose from multiple career paths and advance through levels with experience
                </Text>
              </View>
            </View>
            <View style={styles.simulationItem}>
              <Text style={styles.simulationIcon}>👥</Text>
              <View style={styles.simulationContent}>
                <Text style={styles.simulationName}>Relationship Building</Text>
                <Text style={styles.simulationDescription}>
                  Form and maintain relationships with family, friends, and romantic partners
                </Text>
              </View>
            </View>
          </View>
        </Card>

        {/* Loading Animation */}
        <View style={styles.animationContainer}>
          {[0, 1, 2, 3, 4].map((index) => (
            <Animated.View
              key={index}
              style={[
                styles.animationDot,
                {
                  backgroundColor: '#9B59B6',
                  transform: [
                    {
                      scale: pulseAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [1, 1.2],
                        extrapolate: 'clamp',
                      }),
                    },
                  ],
                  opacity: fadeAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.3, 1],
                    extrapolate: 'clamp',
                  }),
                },
              ]}
            />
          ))}
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingContainer: {
    width: '100%',
    maxWidth: 400,
  },
  mainCard: {
    padding: 24,
    alignItems: 'center',
    marginBottom: 16,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#F4E6F7',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  icon: {
    fontSize: 28,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#7F8C8D',
    textAlign: 'center',
  },
  progressContainer: {
    width: '100%',
    marginBottom: 20,
  },
  progressText: {
    fontSize: 12,
    color: '#7F8C8D',
    textAlign: 'center',
    marginTop: 8,
  },
  stepContainer: {
    width: '100%',
    alignItems: 'center',
  },
  stepTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 4,
  },
  stepText: {
    fontSize: 12,
    color: '#7F8C8D',
    textAlign: 'center',
  },
  tipsCard: {
    padding: 16,
    marginBottom: 12,
  },
  tipsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#9B59B6',
    marginBottom: 8,
  },
  tipsText: {
    fontSize: 14,
    color: '#2C3E50',
    lineHeight: 20,
  },
  featuresCard: {
    padding: 16,
    marginBottom: 12,
  },
  featuresTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#3498DB',
    marginBottom: 8,
  },
  featuresText: {
    fontSize: 14,
    color: '#2C3E50',
    lineHeight: 20,
  },
  statusCard: {
    padding: 16,
    marginBottom: 12,
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
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusText: {
    fontSize: 12,
    color: '#7F8C8D',
  },
  integrationCard: {
    padding: 16,
    marginBottom: 12,
  },
  integrationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 12,
  },
  integrationList: {
    gap: 8,
  },
  integrationItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  integrationName: {
    fontSize: 14,
    color: '#2C3E50',
    flex: 1,
  },
  metricsCard: {
    padding: 16,
    marginBottom: 12,
  },
  metricsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 12,
  },
  metricsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  metricItem: {
    alignItems: 'center',
    flex: 1,
  },
  metricValue: {
    fontSize: 18,
    fontWeight: '600',
    color: '#9B59B6',
    marginBottom: 4,
  },
  metricLabel: {
    fontSize: 10,
    color: '#7F8C8D',
    textAlign: 'center',
  },
  simulationCard: {
    padding: 16,
    marginBottom: 12,
  },
  simulationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#9B59B6',
    marginBottom: 12,
  },
  simulationList: {
    gap: 12,
  },
  simulationItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  simulationIcon: {
    fontSize: 20,
    marginTop: 2,
  },
  simulationContent: {
    flex: 1,
  },
  simulationName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 2,
  },
  simulationDescription: {
    fontSize: 12,
    color: '#7F8C8D',
    lineHeight: 16,
  },
  animationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginTop: 20,
  },
  animationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
});
