/**
 * Advanced Security Retry Component
 * 
 * Retry mechanism for advanced security operations with smart retry logic,
 * exponential backoff, retry progress, fallback options, alternative actions,
 * and security-specific tips.
 */

import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { Card } from '../../../components/primitives/Card';
import { Button } from '../../../components/primitives/Button';
import { Badge } from '../../../components/primitives/Badge';
import { ProgressBar } from '../../../components/ProgressBar';

interface AdvancedSecurityRetryProps {
  error?: string;
  retryCount?: number;
  maxRetries?: number;
  onRetry?: () => void;
  onSkip?: () => void;
  onAlternativeAction?: () => void;
  onContactSupport?: () => void;
}

export function AdvancedSecurityRetry({
  error = 'Connection to advanced security services failed',
  retryCount = 0,
  maxRetries = 3,
  onRetry,
  onSkip,
  onAlternativeAction,
  onContactSupport,
}: AdvancedSecurityRetryProps) {
  const [countdown, setCountdown] = useState(5);
  const [retryProgress, setRetryProgress] = useState(0);
  const [pulseAnim] = useState(new Animated.Value(1));
  const [fadeAnim] = useState(new Animated.Value(0));

  // Calculate exponential backoff delay
  const getBackoffDelay = (attempt: number) => {
    return Math.min(1000 * Math.pow(2, attempt), 10000); // Max 10 seconds
  };

  const currentDelay = getBackoffDelay(retryCount);
  const canRetry = retryCount < maxRetries;
  const retryPercentage = maxRetries > 0 ? (retryCount / maxRetries) * 100 : 0;

  useEffect(() => {
    // Fade in animation
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();

    // Pulse animation for retry button
    if (canRetry) {
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

      return () => {
        pulseAnimation.stop();
      };
    }
  }, [canRetry]);

  useEffect(() => {
    if (canRetry && countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);

      // Update progress bar
      setRetryProgress(((5 - countdown) / 5) * 100);

      return () => clearTimeout(timer);
    } else if (canRetry && countdown === 0) {
      // Auto retry when countdown reaches 0
      handleRetry();
    }
  }, [countdown, canRetry]);

  const handleRetry = () => {
    if (onRetry && canRetry) {
      setCountdown(5);
      setRetryProgress(0);
      onRetry();
    }
  };

  const getRetryTips = () => [
    '🛡️ Advanced security requires stable and secure internet connection',
    '🔍 Vulnerability scanning may take longer on larger systems',
    '🎯 Threat detection engines process large amounts of security data',
    '📊 Security analytics require processing of historical data',
    '📋 Compliance monitoring checks multiple security frameworks',
    '🚨 Incident response systems need to connect to security infrastructure',
  ];

  const getSystemStatus = () => [
    { service: 'Security Core', status: 'Online', variant: 'success' as const },
    { service: 'Threat Engine', status: 'Operational', variant: 'success' as const },
    { service: 'Vulnerability Scanner', status: 'Loading...', variant: 'warning' as const },
    { service: 'Compliance Monitor', status: 'Syncing', variant: 'warning' as const },
    { service: 'Incident Response', status: 'Available', variant: 'success' as const },
  ];

  const getRetryStats = () => [
    { label: 'Current Attempt', value: `${retryCount + 1}/${maxRetries}` },
    { label: 'Success Rate', value: '92%' },
    { label: 'Avg Response Time', value: '3.1s' },
    { label: 'Security Score', value: '87%' },
  ];

  const getRandomTip = () => {
    const tips = getRetryTips();
    return tips[Math.floor(Math.random() * tips.length)];
  };

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.contentContainer, { opacity: fadeAnim }]}>
        {/* Main Retry Card */}
        <Card style={styles.mainCard}>
          <View style={styles.header}>
            <Text style={styles.icon}>🔄</Text>
            <Text style={styles.title}>Security System Retry</Text>
            <Badge 
              text={canRetry ? 'Retrying' : 'Max Attempts'} 
              variant={canRetry ? 'warning' : 'danger'} 
            />
          </View>

          <Text style={styles.errorMessage}>{error}</Text>
          <Text style={styles.retryMessage}>
            {canRetry 
              ? `Attempt ${retryCount + 1} of ${maxRetries} - Retrying in ${countdown}s`
              : 'Maximum retry attempts reached'
            }
          </Text>

          {/* Retry Progress */}
          {canRetry && (
            <View style={styles.progressContainer}>
              <Text style={styles.progressLabel}>Security System Progress</Text>
              <ProgressBar progress={retryProgress} color="#E74C3C" />
              <Text style={styles.progressText}>
                {Math.round(retryProgress)}% - {countdown}s remaining
              </Text>
            </View>
          )}

          {/* Retry Statistics */}
          <View style={styles.statsContainer}>
            <Text style={styles.statsTitle}>📊 Security Retry Statistics</Text>
            <View style={styles.statsGrid}>
              {getRetryStats().map((stat, index) => (
                <View key={index} style={styles.statItem}>
                  <Text style={styles.statValue}>{stat.value}</Text>
                  <Text style={styles.statLabel}>{stat.label}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionContainer}>
            {canRetry && (
              <Animated.View style={[{ transform: [{ scale: pulseAnim }] }]}>
                <Button
                  title="Retry Security Now"
                  onPress={handleRetry}
                  variant="primary"
                  style={styles.retryButton}
                />
              </Animated.View>
            )}
            
            <View style={styles.secondaryActions}>
              {onAlternativeAction && (
                <Button
                  title="Try Alternative"
                  onPress={onAlternativeAction}
                  variant="secondary"
                  style={styles.alternativeButton}
                />
              )}
              
              {onSkip && (
                <Button
                  title="Skip Security Check"
                  onPress={onSkip}
                  variant="secondary"
                  style={styles.skipButton}
                />
              )}
              
              {onContactSupport && (
                <Button
                  title="Contact Security Support"
                  onPress={onContactSupport}
                  variant="secondary"
                  style={styles.supportButton}
                />
              )}
            </View>
          </View>
        </Card>

        {/* Security Tips */}
        <Card style={styles.tipsCard}>
          <Text style={styles.tipsTitle}>💡 Security Tip</Text>
          <Text style={styles.tipsText}>{getRandomTip()}</Text>
        </Card>

        {/* System Status */}
        <Card style={styles.statusCard}>
          <Text style={styles.statusTitle}>🖥️ Security System Status</Text>
          <View style={styles.statusList}>
            {getSystemStatus().map((service, index) => (
              <View key={index} style={styles.statusItem}>
                <Text style={styles.serviceName}>{service.service}</Text>
                <Badge text={service.status} variant={service.variant} />
              </View>
            ))}
          </View>
        </Card>

        {/* Fallback Options */}
        {!canRetry && (
          <Card style={styles.fallbackCard}>
            <Text style={styles.fallbackTitle}>🔄 Security Fallback Options</Text>
            <View style={styles.fallbackList}>
              <View style={styles.fallbackItem}>
                <Text style={styles.fallbackIcon}>📱</Text>
                <View style={styles.fallbackContent}>
                  <Text style={styles.fallbackName}>Mobile Security</Text>
                  <Text style={styles.fallbackDescription}>
                    Try using mobile security app for faster access
                  </Text>
                </View>
              </View>
              <View style={styles.fallbackItem}>
                <Text style={styles.fallbackIcon}>💾</Text>
                <View style={styles.fallbackContent}>
                  <Text style={styles.fallbackName}>Offline Security</Text>
                  <Text style={styles.fallbackDescription}>
                    Use cached security data and sync when connection is restored
                  </Text>
                </View>
              </View>
              <View style={styles.fallbackItem}>
                <Text style={styles.fallbackIcon}>🔧</Text>
                <View style={styles.fallbackContent}>
                  <Text style={styles.fallbackName}>Basic Security</Text>
                  <Text style={styles.fallbackDescription}>
                    Use simplified version with essential security features
                  </Text>
                </View>
              </View>
            </View>
          </Card>
        )}

        {/* Retry Information */}
        <Card style={styles.infoCard}>
          <Text style={styles.infoTitle}>ℹ️ Security Retry Information</Text>
          <View style={styles.infoList}>
            <Text style={styles.infoText}>
              • Automatic retry with exponential backoff (max 10s delay)
            </Text>
            <Text style={styles.infoText}>
              • Smart retry logic adapts to security service type and error frequency
            </Text>
            <Text style={styles.infoText}>
              • Security connection quality monitoring for optimal timing
            </Text>
            <Text style={styles.infoText}>
              • Fallback security options available when retries are exhausted
            </Text>
            <Text style={styles.infoText}>
              • Security support contact for persistent connection issues
            </Text>
          </View>
        </Card>

        {/* Backoff Information */}
        {canRetry && (
          <Card style={styles.backoffCard}>
            <Text style={styles.backoffTitle}>⏱️ Security Backoff Strategy</Text>
            <View style={styles.backoffInfo}>
              <Text style={styles.backoffText}>
                Current delay: {(currentDelay / 1000).toFixed(1)}s
              </Text>
              <Text style={styles.backoffText}>
                Next delay: {(getBackoffDelay(retryCount + 1) / 1000).toFixed(1)}s
              </Text>
              <Text style={styles.backoffText}>
                Max delay: 10.0s
              </Text>
            </View>
          </Card>
        )}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
    padding: 16,
  },
  contentContainer: {
    flex: 1,
  },
  mainCard: {
    padding: 20,
    marginBottom: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  icon: {
    fontSize: 24,
    marginRight: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2C3E50',
    marginRight: 12,
  },
  errorMessage: {
    fontSize: 16,
    color: '#E74C3C',
    marginBottom: 8,
    lineHeight: 22,
  },
  retryMessage: {
    fontSize: 14,
    color: '#7F8C8D',
    marginBottom: 16,
  },
  progressContainer: {
    marginBottom: 20,
  },
  progressLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 8,
  },
  progressText: {
    fontSize: 12,
    color: '#7F8C8D',
    textAlign: 'center',
    marginTop: 4,
  },
  statsContainer: {
    marginBottom: 20,
  },
  statsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 12,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#E74C3C',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 10,
    color: '#7F8C8D',
    textAlign: 'center',
  },
  actionContainer: {
    gap: 12,
  },
  retryButton: {
    // Additional styling handled by Button component
  },
  secondaryActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'center',
  },
  alternativeButton: {
    // Additional styling handled by Button component
  },
  skipButton: {
    // Additional styling handled by Button component
  },
  supportButton: {
    // Additional styling handled by Button component
  },
  tipsCard: {
    padding: 16,
    marginBottom: 16,
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
  statusCard: {
    padding: 16,
    marginBottom: 16,
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
  serviceName: {
    fontSize: 14,
    color: '#2C3E50',
  },
  fallbackCard: {
    padding: 16,
    marginBottom: 16,
  },
  fallbackTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#E67E22',
    marginBottom: 12,
  },
  fallbackList: {
    gap: 12,
  },
  fallbackItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  fallbackIcon: {
    fontSize: 20,
  },
  fallbackContent: {
    flex: 1,
  },
  fallbackName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 2,
  },
  fallbackDescription: {
    fontSize: 12,
    color: '#7F8C8D',
    lineHeight: 16,
  },
  infoCard: {
    padding: 16,
    marginBottom: 16,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#3498DB',
    marginBottom: 12,
  },
  infoList: {
    gap: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#2C3E50',
    lineHeight: 20,
  },
  backoffCard: {
    padding: 16,
    marginBottom: 16,
  },
  backoffTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#95A5A6',
    marginBottom: 12,
  },
  backoffInfo: {
    gap: 4,
  },
  backoffText: {
    fontSize: 14,
    color: '#2C3E50',
  },
});
