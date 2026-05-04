/**
 * Advanced Security Loading Component
 * 
 * Loading state UI for advanced security features with animated indicators,
 * progress feedback, loading steps, security tips, feature highlights,
 * data source status, system integration status, processing metrics,
 * and security information.
 */

import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Animated, Dimensions } from 'react-native';
import { Card } from '../../../components/primitives/Card';
import { Badge } from '../../../components/primitives/Badge';
import { ProgressBar } from '../../../components/ProgressBar';

const { width } = Dimensions.get('window');

export function AdvancedSecurityLoading() {
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);
  const [pulseAnim] = useState(new Animated.Value(1));
  const [slideAnim] = useState(new Animated.Value(20));
  const [fadeAnim] = useState(new Animated.Value(0));

  const loadingSteps = [
    'Initializing security systems...',
    'Loading threat detection engine...',
    'Fetching vulnerability database...',
    'Processing security analytics...',
    'Loading compliance frameworks...',
    'Establishing monitoring connections...',
    'Calibrating security metrics...',
    'Preparing security dashboard...',
  ];

  const securityTips = [
    '🛡️ Enable multi-factor authentication for enhanced security',
    '🔍 Regular security scans help detect vulnerabilities early',
    '📊 Monitor security metrics for proactive threat detection',
    '🚨 Set up alerts for critical security events',
    '🔒 Keep software updated to patch security vulnerabilities',
    '📋 Maintain compliance with security frameworks',
    '👥 Train staff on security best practices',
    '🔄 Regular security audits ensure system integrity',
  ];

  const featureHighlights = [
    '🎯 Real-time threat detection and response',
    '🔍 Comprehensive vulnerability scanning',
    '📊 Advanced security analytics and reporting',
    '📋 Multi-framework compliance management',
    '🚨 Automated incident response workflows',
    '🔧 Security monitoring and alerting',
    '📈 Risk assessment and mitigation',
    '🛡️ Proactive security posture management',
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
        return prev + Math.random() * 12;
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
    }, 1000);

    return () => {
      pulseAnimation.stop();
      clearInterval(progressInterval);
      clearInterval(stepInterval);
    };
  }, []);

  const getRandomTip = () => {
    return securityTips[Math.floor(Math.random() * securityTips.length)];
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
              <Text style={styles.icon}>🛡️</Text>
            </Animated.View>
            <Text style={styles.title}>Advanced Security</Text>
            <Text style={styles.subtitle}>Loading security systems...</Text>
          </View>

          {/* Progress Bar */}
          <View style={styles.progressContainer}>
            <ProgressBar progress={loadingProgress} color="#E74C3C" />
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

        {/* Security Tips */}
        <Card style={styles.tipsCard}>
          <Text style={styles.tipsTitle}>💡 Security Tip</Text>
          <Text style={styles.tipsText}>{getRandomTip()}</Text>
        </Card>

        {/* Feature Highlights */}
        <Card style={styles.featuresCard}>
          <Text style={styles.featuresTitle}>✨ Security Feature</Text>
          <Text style={styles.featuresText}>{getRandomHighlight()}</Text>
        </Card>

        {/* Data Source Status */}
        <Card style={styles.statusCard}>
          <Text style={styles.statusTitle}>📊 Data Sources</Text>
          <View style={styles.statusList}>
            <View style={styles.statusItem}>
              <Badge text="Threat Database" variant="success" />
              <Text style={styles.statusText}>Connected</Text>
            </View>
            <View style={styles.statusItem}>
              <Badge text="Vulnerability Feed" variant="success" />
              <Text style={styles.statusText}>Connected</Text>
            </View>
            <View style={styles.statusItem}>
              <Badge text="Compliance APIs" variant="warning" />
              <Text style={styles.statusText}>Loading...</Text>
            </View>
            <View style={styles.statusItem}>
              <Badge text="Security Logs" variant="success" />
              <Text style={styles.statusText}>Connected</Text>
            </View>
          </View>
        </Card>

        {/* System Integration Status */}
        <Card style={styles.integrationCard}>
          <Text style={styles.integrationTitle}>🔗 System Integration</Text>
          <View style={styles.integrationList}>
            <View style={styles.integrationItem}>
              <Text style={styles.integrationName}>Threat Engine</Text>
              <Badge text="Active" variant="success" />
            </View>
            <View style={styles.integrationItem}>
              <Text style={styles.integrationName}>Vulnerability Scanner</Text>
              <Badge text="Active" variant="success" />
            </View>
            <View style={styles.integrationItem}>
              <Text style={styles.integrationName}>Compliance Monitor</Text>
              <Badge text="Active" variant="success" />
            </View>
            <View style={styles.integrationItem}>
              <Text style={styles.integrationName}>Incident Response</Text>
              <Badge text="Syncing..." variant="warning" />
            </View>
          </View>
        </Card>

        {/* Processing Metrics */}
        <Card style={styles.metricsCard}>
          <Text style={styles.metricsTitle}>📈 Processing Metrics</Text>
          <View style={styles.metricsGrid}>
            <View style={styles.metricItem}>
              <Text style={styles.metricValue}>{Math.round(loadingProgress * 0.9)}</Text>
              <Text style={styles.metricLabel}>Threats Scanned</Text>
            </View>
            <View style={styles.metricItem}>
              <Text style={styles.metricValue}>{Math.round(loadingProgress * 1.1)}</Text>
              <Text style={styles.metricLabel}>Vulnerabilities</Text>
            </View>
            <View style={styles.metricItem}>
              <Text style={styles.metricValue}>{Math.round(loadingProgress * 0.7)}</Text>
              <Text style={styles.metricLabel}>Compliance Items</Text>
            </View>
            <View style={styles.metricItem}>
              <Text style={styles.metricValue}>{Math.round(loadingProgress * 0.5)}</Text>
              <Text style={styles.metricLabel}>Security Events</Text>
            </View>
          </View>
        </Card>

        {/* Security Information */}
        <Card style={styles.securityCard}>
          <Text style={styles.securityTitle}>🛡️ Security Features</Text>
          <View style={styles.securityList}>
            <View style={styles.securityItem}>
              <Text style={styles.securityIcon}>🎯</Text>
              <View style={styles.securityContent}>
                <Text style={styles.securityName}>Threat Detection</Text>
                <Text style={styles.securityDescription}>
                  Real-time monitoring and detection of security threats across all systems
                </Text>
              </View>
            </View>
            <View style={styles.securityItem}>
              <Text style={styles.securityIcon}>🔍</Text>
              <View style={styles.securityContent}>
                <Text style={styles.securityName}>Vulnerability Assessment</Text>
                <Text style={styles.securityDescription}>
                  Comprehensive scanning and assessment of system vulnerabilities
                </Text>
              </View>
            </View>
            <View style={styles.securityItem}>
              <Text style={styles.securityIcon}>📋</Text>
              <View style={styles.securityContent}>
                <Text style={styles.securityName}>Compliance Management</Text>
                <Text style={styles.securityDescription}>
                  Automated compliance tracking across multiple security frameworks
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
                  backgroundColor: '#E74C3C',
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
    backgroundColor: '#FADBD8',
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
    color: '#E74C3C',
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
    color: '#E74C3C',
    marginBottom: 4,
  },
  metricLabel: {
    fontSize: 10,
    color: '#7F8C8D',
    textAlign: 'center',
  },
  securityCard: {
    padding: 16,
    marginBottom: 12,
  },
  securityTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#E74C3C',
    marginBottom: 12,
  },
  securityList: {
    gap: 12,
  },
  securityItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  securityIcon: {
    fontSize: 20,
    marginTop: 2,
  },
  securityContent: {
    flex: 1,
  },
  securityName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 2,
  },
  securityDescription: {
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
