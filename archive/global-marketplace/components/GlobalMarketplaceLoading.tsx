/**
 * Global Marketplace Loading Component
 * 
 * Loading state UI for global marketplace features with animated indicators,
 * progress feedback, loading steps, skeleton UI, marketplace tips,
 * feature highlights, data source status, system integration status,
 * processing metrics, and commerce information.
 */

import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Animated, Dimensions } from 'react-native';
import { Card } from '../../../components/primitives/Card';
import { Badge } from '../../../components/primitives/Badge';
import { ProgressBar } from '../../../components/ProgressBar';

const { width } = Dimensions.get('window');

export function GlobalMarketplaceLoading() {
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);
  const [pulseAnim] = useState(new Animated.Value(1));
  const [slideAnim] = useState(new Animated.Value(20));
  const [fadeAnim] = useState(new Animated.Value(0));

  const loadingSteps = [
    'Initializing global marketplace system...',
    'Loading product catalog...',
    'Fetching vendor information...',
    'Processing transaction data...',
    'Calculating marketplace analytics...',
    'Updating currency exchange rates...',
    'Synchronizing inventory data...',
    'Preparing marketplace dashboard...',
  ];

  const marketplaceTips = [
    '🛍️ Browse products from verified vendors worldwide',
    '💰 Compare prices across different currencies and regions',
    '📊 Track marketplace trends and analytics in real-time',
    '🚀 Fast and secure international transactions',
    '⭐ Rate vendors and products to help the community',
  ];

  const featureHighlights = [
    '🌍 Global product catalog with millions of items',
    '🏪 Verified vendor network across 50+ countries',
    '💳 Secure payment processing with multiple currencies',
    '📈 Real-time marketplace analytics and insights',
    '🚀 Fast global shipping and tracking',
    '⭐ Vendor and product rating system',
    '🔍 Advanced search and filtering options',
    '📱 Mobile-optimized marketplace experience',
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
    return marketplaceTips[Math.floor(Math.random() * marketplaceTips.length)];
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
              <Text style={styles.icon}>🛍️</Text>
            </Animated.View>
            <Text style={styles.title}>Global Marketplace</Text>
            <Text style={styles.subtitle}>Loading marketplace features...</Text>
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

        {/* Marketplace Tips */}
        <Card style={styles.tipsCard}>
          <Text style={styles.tipsTitle}>💡 Marketplace Tip</Text>
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
              <Badge text="Products" variant="success" />
              <Text style={styles.statusText}>Connected</Text>
            </View>
            <View style={styles.statusItem}>
              <Badge text="Vendors" variant="success" />
              <Text style={styles.statusText}>Connected</Text>
            </View>
            <View style={styles.statusItem}>
              <Badge text="Transactions" variant="warning" />
              <Text style={styles.statusText}>Loading...</Text>
            </View>
            <View style={styles.statusItem}>
              <Badge text="Analytics" variant="success" />
              <Text style={styles.statusText}>Connected</Text>
            </View>
          </View>
        </Card>

        {/* System Integration Status */}
        <Card style={styles.integrationCard}>
          <Text style={styles.integrationTitle}>🔗 System Integration</Text>
          <View style={styles.integrationList}>
            <View style={styles.integrationItem}>
              <Text style={styles.integrationName}>Payment Gateway</Text>
              <Badge text="Active" variant="success" />
            </View>
            <View style={styles.integrationItem}>
              <Text style={styles.integrationName}>Shipping API</Text>
              <Badge text="Active" variant="success" />
            </View>
            <View style={styles.integrationItem}>
              <Text style={styles.integrationName}>Currency Exchange</Text>
              <Badge text="Active" variant="success" />
            </View>
            <View style={styles.integrationItem}>
              <Text style={styles.integrationName}>Inventory Sync</Text>
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
              <Text style={styles.metricLabel}>Products Loaded</Text>
            </View>
            <View style={styles.metricItem}>
              <Text style={styles.metricValue}>{Math.round(loadingProgress * 1.2)}</Text>
              <Text style={styles.metricLabel}>Vendors Synced</Text>
            </View>
            <View style={styles.metricItem}>
              <Text style={styles.metricValue}>{Math.round(loadingProgress * 0.6)}</Text>
              <Text style={styles.metricLabel}>Transactions</Text>
            </View>
            <View style={styles.metricItem}>
              <Text style={styles.metricValue}>{Math.round(loadingProgress * 0.4)}</Text>
              <Text style={styles.metricLabel}>Currencies</Text>
            </View>
          </View>
        </Card>

        {/* Commerce Information */}
        <Card style={styles.commerceCard}>
          <Text style={styles.commerceTitle}>🌍 Global Commerce</Text>
          <View style={styles.commerceList}>
            <View style={styles.commerceItem}>
              <Text style={styles.commerceIcon}>🛍️</Text>
              <View style={styles.commerceContent}>
                <Text style={styles.commerceName}>Product Catalog</Text>
                <Text style={styles.commerceDescription}>
                  Browse millions of products from verified vendors worldwide
                </Text>
              </View>
            </View>
            <View style={styles.commerceItem}>
              <Text style={styles.commerceIcon}>💳</Text>
              <View style={styles.commerceContent}>
                <Text style={styles.commerceName}>Secure Payments</Text>
                <Text style={styles.commerceDescription}>
                  Multi-currency support with secure payment processing
                </Text>
              </View>
            </View>
            <View style={styles.commerceItem}>
              <Text style={styles.commerceIcon}>🚀</Text>
              <View style={styles.commerceContent}>
                <Text style={styles.commerceName}>Global Shipping</Text>
                <Text style={styles.commerceDescription}>
                  Fast and reliable international shipping with tracking
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
  commerceCard: {
    padding: 16,
    marginBottom: 12,
  },
  commerceTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#9B59B6',
    marginBottom: 12,
  },
  commerceList: {
    gap: 12,
  },
  commerceItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  commerceIcon: {
    fontSize: 20,
    marginTop: 2,
  },
  commerceContent: {
    flex: 1,
  },
  commerceName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 2,
  },
  commerceDescription: {
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
