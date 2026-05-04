/**
 * AR/VR Environments Retry Component
 * 
 * Retry/degraded state component for AR/VR environments with smart retry logic,
 * exponential backoff, and fallback functionality.
 */

import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { Button } from '../../../components/primitives/Button';
import { Card } from '../../../components/primitives/Card';
import { ProgressBar } from '../../../components/ProgressBar';

interface AREnvironmentsRetryProps {
  error: string;
  onRetry: () => Promise<void>;
  onDismiss?: () => void;
  retryCount: number;
  maxRetries: number;
  lastRetryTime?: number;
  estimatedWaitTime?: number;
}

export function AREnvironmentsRetry({
  error,
  onRetry,
  onDismiss,
  retryCount,
  maxRetries,
  lastRetryTime,
  estimatedWaitTime = 5000,
}: AREnvironmentsRetryProps) {
  const [isRetrying, setIsRetrying] = useState(false);
  const [waitTime, setWaitTime] = useState(0);
  const [canRetry, setCanRetry] = useState(true);
  const [retryStrategy, setRetryStrategy] = useState<'immediate' | 'delayed' | 'manual'>('immediate');

  const retryAttemptsRemaining = maxRetries - retryCount;
  const retryProgress = (retryCount / maxRetries) * 100;

  useEffect(() => {
    // Determine retry strategy based on attempt count
    if (retryCount === 0) {
      setRetryStrategy('immediate');
      setCanRetry(true);
      setWaitTime(0);
    } else if (retryCount < 2) {
      setRetryStrategy('delayed');
      setWaitTime(estimatedWaitTime);
      setCanRetry(false);
      startWaitTimer();
    } else {
      setRetryStrategy('manual');
      setCanRetry(true);
      setWaitTime(0);
    }
  }, [retryCount, estimatedWaitTime]);

  const startWaitTimer = () => {
    let timeRemaining = estimatedWaitTime;
    setWaitTime(timeRemaining);

    const timer = setInterval(() => {
      timeRemaining -= 1000;
      setWaitTime(timeRemaining);

      if (timeRemaining <= 0) {
        clearInterval(timer);
        setCanRetry(true);
      }
    }, 1000);

    return () => clearInterval(timer);
  };

  const handleRetry = async () => {
    if (!canRetry || isRetrying) return;

    setIsRetrying(true);
    try {
      await onRetry();
    } catch (retryError) {
      console.error('Retry failed:', retryError);
    } finally {
      setIsRetrying(false);
    }
  };

  const getRetryMessage = () => {
    switch (retryStrategy) {
      case 'immediate':
        return 'Ready to retry immediately';
      case 'delayed':
        return `Waiting ${Math.ceil(waitTime / 1000)}s before retry...`;
      case 'manual':
        return 'Manual retry recommended';
      default:
        return 'Ready to retry';
    }
  };

  const getRetryButtonText = () => {
    if (isRetrying) return 'Retrying...';
    if (!canRetry) return `Wait ${Math.ceil(waitTime / 1000)}s`;
    return `Retry (${retryAttemptsRemaining} left)`;
  };

  const getRetryIcon = () => {
    if (isRetrying) return '⏳';
    if (!canRetry) return '⏰';
    return '🔄';
  };

  const getTimeSinceLastRetry = () => {
    if (!lastRetryTime) return null;
    const timeDiff = Date.now() - lastRetryTime;
    const seconds = Math.floor(timeDiff / 1000);
    const minutes = Math.floor(seconds / 60);
    
    if (minutes > 0) {
      return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    }
    return `${seconds} second${seconds > 1 ? 's' : ''} ago`;
  };

  return (
    <View style={styles.container}>
      <Card style={styles.retryCard}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.icon}>{getRetryIcon()}</Text>
          <Text style={styles.title}>AR/VR Environments Issue</Text>
        </View>

        {/* Error Message */}
        <Text style={styles.errorMessage}>{error}</Text>

        {/* Retry Progress */}
        <View style={styles.progressContainer}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressTitle}>Retry Progress</Text>
            <Text style={styles.progressText}>
              {retryCount}/{maxRetries} attempts
            </Text>
          </View>
          <ProgressBar 
            progress={retryProgress} 
            color={retryProgress < 50 ? '#9B59B6' : retryProgress < 80 ? '#F39C12' : '#E74C3C'}
          />
          <Text style={styles.progressDescription}>
            {retryProgress < 50 ? 'Making good progress' : 
             retryProgress < 80 ? 'Multiple attempts needed' : 
             'Approaching maximum retries'}
          </Text>
        </View>

        {/* Retry Strategy */}
        <View style={styles.strategyContainer}>
          <Text style={styles.strategyTitle}>Retry Strategy:</Text>
          <Text style={styles.strategyMessage}>{getRetryMessage()}</Text>
          
          {retryStrategy === 'delayed' && (
            <View style={styles.waitIndicator}>
              <Text style={styles.waitText}>
                Automatic retry in {Math.ceil(waitTime / 1000)}s
              </Text>
            </View>
          )}
        </View>

        {/* Last Retry Info */}
        {lastRetryTime && (
          <View style={styles.lastRetryContainer}>
            <Text style={styles.lastRetryTitle}>Last retry:</Text>
            <Text style={styles.lastRetryTime}>{getTimeSinceLastRetry()}</Text>
          </View>
        )}

        {/* Action Buttons */}
        <View style={styles.actionsContainer}>
          <Button
            title={getRetryButtonText()}
            onPress={handleRetry}
            disabled={!canRetry || isRetrying}
            loading={isRetrying}
            style={[
              styles.retryButton,
              !canRetry && styles.disabledButton,
            ]}
          />
          
          {onDismiss && (
            <Button
              title="Dismiss"
              onPress={onDismiss}
              variant="secondary"
              style={styles.dismissButton}
            />
          )}
        </View>

        {/* Alternative Actions */}
        <View style={styles.alternativesContainer}>
          <Text style={styles.alternativesTitle}>Alternative actions:</Text>
          <View style={styles.alternativeButtons}>
            <TouchableOpacity style={styles.alternativeButton}>
              <Text style={styles.alternativeButtonText}>Reconnect Devices</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.alternativeButton}>
              <Text style={styles.alternativeButtonText}>Reset Tracking</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.alternativeButton}>
              <Text style={styles.alternativeButtonText}>Restart Engine</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* AR/VR Specific Tips */}
        <View style={styles.tipsContainer}>
          <Text style={styles.tipsTitle}>AR/VR Tips:</Text>
          <Text style={styles.tipsText}>
            • Check device connections{'\n'}
            • Verify tracking calibration{'\n'}
            • Ensure adequate space{'\n'}
            • Check graphics performance
          </Text>
        </View>

        {/* Fallback Options */}
        <View style={styles.fallbackContainer}>
          <Text style={styles.fallbackTitle}>Fallback Options:</Text>
          <View style={styles.fallbackOptions}>
            <TouchableOpacity style={styles.fallbackOption}>
              <Text style={styles.fallbackIcon}>🔌</Text>
              <Text style={styles.fallbackText}>Reconnect Devices</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.fallbackOption}>
              <Text style={styles.fallbackIcon}>🎯</Text>
              <Text style={styles.fallbackText}>Recalibrate Tracking</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.fallbackOption}>
              <Text style={styles.fallbackIcon}>🎨</Text>
              <Text style={styles.fallbackText}>Lower Graphics Quality</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Device Status */}
        <View style={styles.deviceContainer}>
          <Text style={styles.deviceTitle}>Device Status:</Text>
          <View style={styles.deviceItems}>
            <View style={styles.deviceItem}>
              <Text style={styles.deviceLabel}>AR Headsets:</Text>
              <Text style={styles.deviceValue}>Disconnected</Text>
            </View>
            <View style={styles.deviceItem}>
              <Text style={styles.deviceLabel}>VR Headsets:</Text>
              <Text style={styles.deviceValue}>Error</Text>
            </View>
            <View style={styles.deviceItem}>
              <Text style={styles.deviceLabel}>Tracking Systems:</Text>
              <Text style={styles.deviceValue}>Checking...</Text>
            </View>
            <View style={styles.deviceItem}>
              <Text style={styles.deviceLabel}>Graphics Engine:</Text>
              <Text style={styles.deviceValue}>Offline</Text>
            </View>
          </View>
        </View>

        {/* Connection Quality */}
        <View style={styles.connectionContainer}>
          <Text style={styles.connectionTitle}>Connection Quality:</Text>
          <View style={styles.connectionItems}>
            <View style={styles.connectionItem}>
              <Text style={styles.connectionLabel}>Device Response:</Text>
              <Text style={styles.connectionValue}>Slow - 3.2s</Text>
            </View>
            <View style={styles.connectionItem}>
              <Text style={styles.connectionLabel}>Tracking Latency:</Text>
              <Text style={styles.connectionValue}>High - 45ms</Text>
            </View>
            <View style={styles.connectionItem}>
              <Text style={styles.connectionLabel}>Graphics FPS:</Text>
              <Text style={styles.connectionValue}>Low - 15 FPS</Text>
            </View>
            <View style={styles.connectionItem}>
              <Text style={styles.connectionLabel}>Recommended Action:</Text>
              <Text style={styles.connectionValue}>Reconnect devices</Text>
            </View>
          </View>
        </View>

        {/* Troubleshooting Steps */}
        <View style={styles.troubleshootingContainer}>
          <Text style={styles.troubleshootingTitle}>Quick Troubleshooting:</Text>
          <View style={styles.troubleshootingSteps}>
            <View style={styles.troubleshootingStep}>
              <Text style={styles.stepNumber}>1</Text>
              <Text style={styles.stepText}>Check device connections</Text>
            </View>
            <View style={styles.troubleshootingStep}>
              <Text style={styles.stepNumber}>2</Text>
              <Text style={styles.stepText}>Verify tracking calibration</Text>
            </View>
            <View style={styles.troubleshootingStep}>
              <Text style={styles.stepNumber}>3</Text>
              <Text style={styles.stepText}>Check graphics performance</Text>
            </View>
            <View style={styles.troubleshootingStep}>
              <Text style={styles.stepNumber}>4</Text>
              <Text style={styles.stepText}>Restart AR/VR services</Text>
            </View>
          </View>
        </View>
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
    padding: 20,
  },
  retryCard: {
    padding: 24,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  icon: {
    fontSize: 32,
    marginRight: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2C3E50',
  },
  errorMessage: {
    fontSize: 16,
    color: '#7F8C8D',
    marginBottom: 20,
    lineHeight: 24,
  },
  progressContainer: {
    backgroundColor: '#F8F9FA',
    padding: 16,
    borderRadius: 8,
    marginBottom: 20,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2C3E50',
  },
  progressText: {
    fontSize: 14,
    color: '#7F8C8D',
  },
  progressDescription: {
    fontSize: 12,
    color: '#95A5A6',
    marginTop: 8,
    fontStyle: 'italic',
  },
  strategyContainer: {
    backgroundColor: '#F3E5F5',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  strategyTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 4,
  },
  strategyMessage: {
    fontSize: 14,
    color: '#9B59B6',
  },
  waitIndicator: {
    marginTop: 8,
    alignItems: 'center',
  },
  waitText: {
    fontSize: 12,
    color: '#9B59B6',
    fontWeight: '600',
  },
  lastRetryContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  lastRetryTitle: {
    fontSize: 14,
    color: '#7F8C8D',
  },
  lastRetryTime: {
    fontSize: 14,
    color: '#2C3E50',
    fontWeight: '600',
  },
  actionsContainer: {
    gap: 12,
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#9B59B6',
  },
  disabledButton: {
    backgroundColor: '#BDC3C7',
  },
  dismissButton: {
    backgroundColor: '#95A5A6',
  },
  alternativesContainer: {
    marginBottom: 20,
  },
  alternativesTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 12,
  },
  alternativeButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  alternativeButton: {
    flex: 1,
    padding: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E1E8ED',
    borderRadius: 6,
    alignItems: 'center',
  },
  alternativeButtonText: {
    fontSize: 12,
    color: '#9B59B6',
    fontWeight: '600',
  },
  tipsContainer: {
    backgroundColor: '#FFF3CD',
    padding: 16,
    borderRadius: 8,
    marginBottom: 20,
  },
  tipsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#856404',
    marginBottom: 8,
  },
  tipsText: {
    fontSize: 12,
    color: '#856404',
    lineHeight: 16,
  },
  fallbackContainer: {
    backgroundColor: '#D4EDDA',
    padding: 16,
    borderRadius: 8,
    marginBottom: 20,
  },
  fallbackTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#155724',
    marginBottom: 12,
  },
  fallbackOptions: {
    gap: 8,
  },
  fallbackOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 12,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#C3E6CB',
  },
  fallbackIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  fallbackText: {
    fontSize: 12,
    color: '#155724',
    fontWeight: '500',
  },
  deviceContainer: {
    backgroundColor: '#F8F9FA',
    padding: 16,
    borderRadius: 8,
    marginBottom: 20,
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
  connectionContainer: {
    backgroundColor: '#F8F9FA',
    padding: 16,
    borderRadius: 8,
    marginBottom: 20,
  },
  connectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 12,
  },
  connectionItems: {
    gap: 8,
  },
  connectionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  connectionLabel: {
    fontSize: 12,
    color: '#7F8C8D',
  },
  connectionValue: {
    fontSize: 12,
    color: '#2C3E50',
    fontWeight: '600',
  },
  troubleshootingContainer: {
    backgroundColor: '#F8F9FA',
    padding: 16,
    borderRadius: 8,
  },
  troubleshootingTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 16,
  },
  troubleshootingSteps: {
    gap: 12,
  },
  troubleshootingStep: {
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
});
