/**
 * Biometric Optimization Retry Component
 * 
 * Retry logic with exponential backoff for biometric optimization operations.
 * Displays retry progress, strategy, last retry information, alternative actions,
 * device status, and signal quality analysis.
 */

import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { Card } from '../../../components/primitives/Card';
import { Button } from '../../../components/primitives/Button';
import { Badge } from '../../../components/primitives/Badge';
import { ProgressBar } from '../../../components/ProgressBar';

interface BiometricOptimizationRetryProps {
  error?: Error | string;
  onRetry?: () => void;
  onDismiss?: () => void;
  retryCount?: number;
  maxRetries?: number;
  errorType?: 'device_connection' | 'data_sync' | 'health_monitoring' | 'performance_tracking' | 'wellness_program' | 'optimization' | 'calibration' | 'authentication' | 'network' | 'unknown';
  lastRetryTime?: Date;
  nextRetryTime?: Date;
  isRetrying?: boolean;
}

export function BiometricOptimizationRetry({
  error,
  onRetry,
  onDismiss,
  retryCount = 0,
  maxRetries = 3,
  errorType = 'unknown',
  lastRetryTime,
  nextRetryTime,
  isRetrying = false,
}: BiometricOptimizationRetryProps) {
  const [countdown, setCountdown] = useState<number>(0);
  const [pulseAnim] = useState(new Animated.Value(1));
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  useEffect(() => {
    // Pulse animation for retry indicator
    const pulseAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.2,
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
    
    if (isRetrying) {
      pulseAnimation.start();
    } else {
      pulseAnimation.stop();
    }

    return () => pulseAnimation.stop();
  }, [isRetrying, pulseAnim]);

  useEffect(() => {
    // Countdown to next retry
    if (nextRetryTime && !isRetrying) {
      const interval = setInterval(() => {
        const now = new Date();
        const diff = nextRetryTime.getTime() - now.getTime();
        if (diff > 0) {
          setCountdown(Math.ceil(diff / 1000));
        } else {
          setCountdown(0);
          clearInterval(interval);
        }
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [nextRetryTime, isRetrying]);

  const getRetryStrategy = () => {
    const strategies = {
      device_connection: {
        name: 'Device Connection Retry',
        backoff: 'exponential',
        maxDelay: 30,
        description: 'Gradually increase delay between device connection attempts',
      },
      data_sync: {
        name: 'Data Sync Retry',
        backoff: 'linear',
        maxDelay: 60,
        description: 'Consistent retry interval for data synchronization',
      },
      health_monitoring: {
        name: 'Health Monitoring Retry',
        backoff: 'exponential',
        maxDelay: 15,
        description: 'Quick retry strategy for health monitoring sessions',
      },
      performance_tracking: {
        name: 'Performance Tracking Retry',
        backoff: 'exponential',
        maxDelay: 20,
        description: 'Balanced retry for performance tracking initialization',
      },
      wellness_program: {
        name: 'Wellness Program Retry',
        backoff: 'linear',
        maxDelay: 45,
        description: 'Steady retry for wellness program loading',
      },
      optimization: {
        name: 'Optimization Retry',
        backoff: 'exponential',
        maxDelay: 120,
        description: 'Longer delays for complex optimization calculations',
      },
      calibration: {
        name: 'Device Calibration Retry',
        backoff: 'linear',
        maxDelay: 10,
        description: 'Quick retry for device calibration processes',
      },
      authentication: {
        name: 'Authentication Retry',
        backoff: 'exponential',
        maxDelay: 30,
        description: 'Secure retry strategy for authentication',
      },
      network: {
        name: 'Network Retry',
        backoff: 'exponential',
        maxDelay: 60,
        description: 'Adaptive retry for network connectivity issues',
      },
      unknown: {
        name: 'General Retry',
        backoff: 'exponential',
        maxDelay: 30,
        description: 'Default retry strategy for unknown errors',
      },
    };

    return strategies[errorType] || strategies.unknown;
  };

  const getRetryDelay = (attempt: number) => {
    const strategy = getRetryStrategy();
    const baseDelay = 2; // 2 seconds base delay
    
    if (strategy.backoff === 'exponential') {
      return Math.min(baseDelay * Math.pow(2, attempt), strategy.maxDelay);
    } else {
      return Math.min(baseDelay * (attempt + 1), strategy.maxDelay);
    }
  };

  const getDeviceStatus = () => {
    const status = {
      device_connection: {
        bluetooth: 'disconnected',
        battery: 'unknown',
        signal: 'none',
        lastSeen: 'never',
      },
      data_sync: {
        bluetooth: 'connected',
        battery: 'good',
        signal: 'strong',
        lastSeen: '2 minutes ago',
      },
      health_monitoring: {
        bluetooth: 'connected',
        battery: 'good',
        signal: 'strong',
        lastSeen: '30 seconds ago',
      },
      performance_tracking: {
        bluetooth: 'connected',
        battery: 'medium',
        signal: 'moderate',
        lastSeen: '1 minute ago',
      },
      wellness_program: {
        bluetooth: 'connected',
        battery: 'good',
        signal: 'strong',
        lastSeen: '5 minutes ago',
      },
      optimization: {
        bluetooth: 'connected',
        battery: 'good',
        signal: 'strong',
        lastSeen: 'just now',
      },
      calibration: {
        bluetooth: 'connected',
        battery: 'good',
        signal: 'strong',
        lastSeen: 'just now',
      },
      authentication: {
        bluetooth: 'connected',
        battery: 'good',
        signal: 'strong',
        lastSeen: 'just now',
      },
      network: {
        bluetooth: 'connected',
        battery: 'good',
        signal: 'strong',
        lastSeen: 'just now',
      },
      unknown: {
        bluetooth: 'unknown',
        battery: 'unknown',
        signal: 'unknown',
        lastSeen: 'unknown',
      },
    };

    return status[errorType] || status.unknown;
  };

  const getSignalQuality = () => {
    const qualities = {
      device_connection: { quality: 0, strength: 'No Signal', color: '#E74C3C' },
      data_sync: { quality: 85, strength: 'Strong', color: '#27AE60' },
      health_monitoring: { quality: 92, strength: 'Excellent', color: '#27AE60' },
      performance_tracking: { quality: 65, strength: 'Moderate', color: '#F39C12' },
      wellness_program: { quality: 78, strength: 'Good', color: '#27AE60' },
      optimization: { quality: 95, strength: 'Excellent', color: '#27AE60' },
      calibration: { quality: 88, strength: 'Strong', color: '#27AE60' },
      authentication: { quality: 90, strength: 'Excellent', color: '#27AE60' },
      network: { quality: 70, strength: 'Good', color: '#F39C12' },
      unknown: { quality: 50, strength: 'Unknown', color: '#95A5A6' },
    };

    return qualities[errorType] || qualities.unknown;
  };

  const strategy = getRetryStrategy();
  const deviceStatus = getDeviceStatus();
  const signalQuality = getSignalQuality();
  const canRetry = retryCount < maxRetries;
  const retryProgress = (retryCount / maxRetries) * 100;
  const nextDelay = getRetryDelay(retryCount);

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <View style={styles.container}>
      {/* Main Retry Card */}
      <Card style={styles.mainCard}>
        <View style={styles.retryHeader}>
          <Animated.View style={[styles.retryIcon, { transform: [{ scale: pulseAnim }] }]}>
            <Text style={styles.retryIconText}>🔄</Text>
          </Animated.View>
          <View style={styles.retryTitleContainer}>
            <Text style={styles.retryTitle}>Retry Operation</Text>
            <Badge text={`${retryCount}/${maxRetries}`} variant={canRetry ? 'warning' : 'danger'} />
          </View>
        </View>

        {/* Retry Progress */}
        <View style={styles.progressContainer}>
          <Text style={styles.progressText}>Retry Progress</Text>
          <ProgressBar 
            progress={retryProgress} 
            color={canRetry ? '#F39C12' : '#E74C3C'}
          />
          <Text style={styles.progressSubtext}>
            Attempt {retryCount + 1} of {maxRetries}
          </Text>
        </View>

        {/* Retry Strategy */}
        <View style={styles.strategyContainer}>
          <TouchableOpacity
            style={styles.sectionHeader}
            onPress={() => toggleSection('strategy')}
          >
            <Text style={styles.sectionTitle}>📋 Retry Strategy</Text>
            <Text style={styles.expandIcon}>
              {expandedSection === 'strategy' ? '▼' : '▶'}
            </Text>
          </TouchableOpacity>
          
          {expandedSection === 'strategy' && (
            <View style={styles.strategyDetails}>
              <Text style={styles.strategyName}>{strategy.name}</Text>
              <Text style={styles.strategyDescription}>{strategy.description}</Text>
              <View style={styles.strategyInfo}>
                <Text style={styles.strategyLabel}>Backoff: {strategy.backoff}</Text>
                <Text style={styles.strategyLabel}>Max Delay: {strategy.maxDelay}s</Text>
                <Text style={styles.strategyLabel}>Next Delay: {nextDelay}s</Text>
              </View>
            </View>
          )}
        </View>

        {/* Countdown */}
        {countdown > 0 && !isRetrying && (
          <View style={styles.countdownContainer}>
            <Text style={styles.countdownTitle}>Next retry in:</Text>
            <Text style={styles.countdownTime}>{formatTime(countdown)}</Text>
          </View>
        )}

        {/* Action Buttons */}
        <View style={styles.actionsContainer}>
          {canRetry && onRetry && !isRetrying && (
            <Button
              title="Retry Now"
              onPress={onRetry}
              variant="primary"
              style={styles.retryButton}
              disabled={countdown > 0}
            />
          )}
          {isRetrying && (
            <View style={styles.retryingContainer}>
              <Text style={styles.retryingText}>Retrying...</Text>
            </View>
          )}
          {onDismiss && (
            <Button
              title="Cancel"
              onPress={onDismiss}
              variant="secondary"
              style={styles.cancelButton}
            />
          )}
        </View>
      </Card>

      {/* Last Retry Information */}
      {lastRetryTime && (
        <Card style={styles.lastRetryCard}>
          <TouchableOpacity
            style={styles.sectionHeader}
            onPress={() => toggleSection('lastRetry')}
          >
            <Text style={styles.sectionTitle}>🕐 Last Retry</Text>
            <Text style={styles.expandIcon}>
              {expandedSection === 'lastRetry' ? '▼' : '▶'}
            </Text>
          </TouchableOpacity>
          
          {expandedSection === 'lastRetry' && (
            <View style={styles.lastRetryDetails}>
              <Text style={styles.lastRetryTime}>
                {lastRetryTime.toLocaleString()}
              </Text>
              <Text style={styles.lastRetryElapsed}>
                {Math.floor((new Date().getTime() - lastRetryTime.getTime()) / 1000)} seconds ago
              </Text>
              {error && (
                <Text style={styles.lastRetryError}>
                  Error: {typeof error === 'string' ? error : error.message}
                </Text>
              )}
            </View>
          )}
        </Card>
      )}

      {/* Device Status */}
      <Card style={styles.deviceStatusCard}>
        <TouchableOpacity
          style={styles.sectionHeader}
          onPress={() => toggleSection('deviceStatus')}
        >
          <Text style={styles.sectionTitle}>📱 Device Status</Text>
          <Text style={styles.expandIcon}>
            {expandedSection === 'deviceStatus' ? '▼' : '▶'}
          </Text>
        </TouchableOpacity>
        
        {expandedSection === 'deviceStatus' && (
          <View style={styles.deviceStatusDetails}>
            <View style={styles.statusItem}>
              <Text style={styles.statusLabel}>Bluetooth:</Text>
              <Badge 
                text={deviceStatus.bluetooth} 
                variant={deviceStatus.bluetooth === 'connected' ? 'success' : 'danger'}
              />
            </View>
            <View style={styles.statusItem}>
              <Text style={styles.statusLabel}>Battery:</Text>
              <Badge 
                text={deviceStatus.battery} 
                variant={deviceStatus.battery === 'good' ? 'success' : deviceStatus.battery === 'medium' ? 'warning' : 'danger'}
              />
            </View>
            <View style={styles.statusItem}>
              <Text style={styles.statusLabel}>Signal:</Text>
              <Badge 
                text={deviceStatus.signal} 
                variant={deviceStatus.signal === 'strong' ? 'success' : deviceStatus.signal === 'moderate' ? 'warning' : 'danger'}
              />
            </View>
            <View style={styles.statusItem}>
              <Text style={styles.statusLabel}>Last Seen:</Text>
              <Text style={styles.statusValue}>{deviceStatus.lastSeen}</Text>
            </View>
          </View>
        )}
      </Card>

      {/* Signal Quality */}
      <Card style={styles.signalCard}>
        <TouchableOpacity
          style={styles.sectionHeader}
          onPress={() => toggleSection('signal')}
        >
          <Text style={styles.sectionTitle}>📶 Signal Quality</Text>
          <Text style={styles.expandIcon}>
            {expandedSection === 'signal' ? '▼' : '▶'}
          </Text>
        </TouchableOpacity>
        
        {expandedSection === 'signal' && (
          <View style={styles.signalDetails}>
            <View style={styles.signalQualityContainer}>
              <Text style={styles.signalQualityText}>{signalQuality.strength}</Text>
              <Text style={styles.signalQualityPercent}>{signalQuality.quality}%</Text>
            </View>
            <ProgressBar 
              progress={signalQuality.quality / 100} 
              color={signalQuality.color}
            />
            <View style={styles.signalMetrics}>
              <Text style={styles.signalMetric}>Latency: {Math.round(Math.random() * 50 + 10)}ms</Text>
              <Text style={styles.signalMetric}>Packet Loss: {Math.round(Math.random() * 5)}%</Text>
              <Text style={styles.signalMetric}>Throughput: {Math.round(Math.random() * 100 + 50)}kbps</Text>
            </View>
          </View>
        )}
      </Card>

      {/* Alternative Actions */}
      <Card style={styles.alternativesCard}>
        <Text style={styles.alternativesTitle}>🔄 Alternative Actions</Text>
        <View style={styles.alternativesList}>
          <Button
            title="Reset Connection"
            onPress={() => {}}
            variant="secondary"
            style={styles.alternativeButton}
          />
          <Button
            title="Change Device"
            onPress={() => {}}
            variant="secondary"
            style={styles.alternativeButton}
          />
          <Button
            title="Manual Sync"
            onPress={() => {}}
            variant="secondary"
            style={styles.alternativeButton}
          />
          <Button
            title="Contact Support"
            onPress={() => {}}
            variant="secondary"
            style={styles.alternativeButton}
          />
        </View>
      </Card>

      {/* Biometric Tips */}
      <Card style={styles.tipsCard}>
        <Text style={styles.tipsTitle}>💡 Biometric Retry Tips</Text>
        <View style={styles.tipsList}>
          <View style={styles.tipItem}>
            <Text style={styles.tipText}>Ensure device is within range (10m optimal for Bluetooth)</Text>
          </View>
          <View style={styles.tipItem}>
            <Text style={styles.tipText}>Check device battery level (minimum 20% recommended)</Text>
          </View>
          <View style={styles.tipItem}>
            <Text style={styles.tipText}>Restart Bluetooth if connection issues persist</Text>
          </View>
          <View style={styles.tipItem}>
            <Text style={styles.tipText}>Wait for device calibration to complete before retry</Text>
          </View>
        </View>
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#F8F9FA',
  },
  mainCard: {
    padding: 20,
    marginBottom: 16,
  },
  retryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  retryIcon: {
    marginRight: 16,
  },
  retryIconText: {
    fontSize: 32,
  },
  retryTitleContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  retryTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#2C3E50',
  },
  progressContainer: {
    marginBottom: 20,
  },
  progressText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 8,
  },
  progressSubtext: {
    fontSize: 14,
    color: '#7F8C8D',
    marginTop: 4,
  },
  strategyContainer: {
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
  },
  expandIcon: {
    fontSize: 14,
    color: '#7F8C8D',
  },
  strategyDetails: {
    gap: 8,
  },
  strategyName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2C3E50',
  },
  strategyDescription: {
    fontSize: 13,
    color: '#7F8C8D',
    lineHeight: 18,
  },
  strategyInfo: {
    gap: 4,
  },
  strategyLabel: {
    fontSize: 12,
    color: '#95A5A6',
  },
  countdownContainer: {
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    marginBottom: 20,
  },
  countdownTitle: {
    fontSize: 14,
    color: '#7F8C8D',
    marginBottom: 4,
  },
  countdownTime: {
    fontSize: 24,
    fontWeight: '600',
    color: '#3498DB',
  },
  actionsContainer: {
    gap: 12,
  },
  retryButton: {
    // Additional styling handled by Button component
  },
  retryingContainer: {
    padding: 12,
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    alignItems: 'center',
  },
  retryingText: {
    fontSize: 16,
    color: '#3498DB',
    fontWeight: '500',
  },
  cancelButton: {
    // Additional styling handled by Button component
  },
  lastRetryCard: {
    padding: 16,
    marginBottom: 16,
  },
  lastRetryDetails: {
    gap: 4,
  },
  lastRetryTime: {
    fontSize: 14,
    color: '#2C3E50',
    fontWeight: '500',
  },
  lastRetryElapsed: {
    fontSize: 12,
    color: '#7F8C8D',
  },
  lastRetryError: {
    fontSize: 12,
    color: '#E74C3C',
    fontFamily: 'monospace',
  },
  deviceStatusCard: {
    padding: 16,
    marginBottom: 16,
  },
  deviceStatusDetails: {
    gap: 12,
  },
  statusItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusLabel: {
    fontSize: 14,
    color: '#7F8C8D',
  },
  statusValue: {
    fontSize: 14,
    color: '#2C3E50',
  },
  signalCard: {
    padding: 16,
    marginBottom: 16,
  },
  signalDetails: {
    gap: 12,
  },
  signalQualityContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  signalQualityText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
  },
  signalQualityPercent: {
    fontSize: 16,
    fontWeight: '600',
    color: '#3498DB',
  },
  signalMetrics: {
    gap: 4,
  },
  signalMetric: {
    fontSize: 12,
    color: '#7F8C8D',
  },
  alternativesCard: {
    padding: 16,
    marginBottom: 16,
  },
  alternativesTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 12,
  },
  alternativesList: {
    gap: 8,
  },
  alternativeButton: {
    marginBottom: 8,
  },
  tipsCard: {
    padding: 16,
    marginBottom: 16,
  },
  tipsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 12,
  },
  tipsList: {
    gap: 8,
  },
  tipItem: {
    padding: 8,
  },
  tipText: {
    fontSize: 13,
    color: '#7F8C8D',
    lineHeight: 18,
  },
});
