/**
 * AR/VR Environments Error Component
 * 
 * Error state component for AR/VR environments with different error types,
 * retry functionality, and helpful error messages.
 */

import React from 'react';
import { View, StyleSheet, Text, ScrollView } from 'react-native';
import { Button } from '../../../components/primitives/Button';
import { Card } from '../../../components/primitives/Card';

interface AREnvironmentsErrorProps {
  error: string;
  type?: 'device-connection' | 'tracking-failure' | 'rendering-error' | 'environment-load' | 'spatial-computing' | 'unknown';
  onRetry?: () => void;
  onDismiss?: () => void;
  retryCount?: number;
  maxRetries?: number;
}

export function AREnvironmentsError({ 
  error, 
  type = 'unknown',
  onRetry,
  onDismiss,
  retryCount = 0,
  maxRetries = 3 
}: AREnvironmentsErrorProps) {
  const getErrorConfig = () => {
    switch (type) {
      case 'device-connection':
        return {
          icon: '🔌',
          title: 'Device Connection Error',
          description: 'Unable to connect to AR/VR devices. Please check device compatibility and connections.',
          canRetry: true,
          suggestions: [
            'Verify device is powered on',
            'Check USB/Bluetooth connections',
            'Ensure device compatibility',
            'Restart AR/VR services',
          ],
        };
      case 'tracking-failure':
        return {
          icon: '🎯',
          title: 'Tracking System Error',
          description: 'AR/VR tracking systems failed to initialize. Please check tracking setup and calibration.',
          canRetry: true,
          suggestions: [
            'Recalibrate tracking systems',
            'Check camera sensors',
            'Ensure adequate lighting',
            'Clear tracking area',
          ],
        };
      case 'rendering-error':
        return {
          icon: '🎨',
          title: 'Rendering Engine Error',
          description: '3D rendering engine failed to initialize. Please check graphics capabilities and drivers.',
          canRetry: true,
          suggestions: [
            'Update graphics drivers',
            'Check GPU compatibility',
            'Verify rendering settings',
            'Restart graphics engine',
          ],
        };
      case 'environment-load':
        return {
          icon: '🏠',
          title: 'Environment Loading Error',
          description: 'Failed to load AR/VR environments. Please check environment files and permissions.',
          canRetry: true,
          suggestions: [
            'Verify environment files',
            'Check storage permissions',
            'Ensure adequate memory',
            'Reload environment assets',
          ],
        };
      case 'spatial-computing':
        return {
          icon: '🌐',
          title: 'Spatial Computing Error',
          description: 'Spatial computing systems failed to initialize. Please check spatial mapping and sensors.',
          canRetry: true,
          suggestions: [
            'Recalibrate spatial mapping',
            'Check sensor functionality',
            'Ensure adequate space',
            'Reset spatial systems',
          ],
        };
      default:
        return {
          icon: '❌',
          title: 'AR/VR Environments Error',
          description: 'An unexpected error occurred with the AR/VR environments system.',
          canRetry: true,
          suggestions: [
            'Check system status',
            'Verify device connections',
            'Review recent changes',
            'Contact support if issues persist',
          ],
        };
    }
  };

  const errorConfig = getErrorConfig();
  const canRetry = errorConfig.canRetry && retryCount < maxRetries;
  const retryAttemptsRemaining = maxRetries - retryCount;

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <Card style={styles.errorCard}>
          {/* Error Icon and Title */}
          <View style={styles.header}>
            <Text style={styles.icon}>{errorConfig.icon}</Text>
            <Text style={styles.title}>{errorConfig.title}</Text>
          </View>

          {/* Error Description */}
          <Text style={styles.description}>{errorConfig.description}</Text>

          {/* Technical Error Details */}
          <View style={styles.technicalContainer}>
            <Text style={styles.technicalTitle}>Technical Details:</Text>
            <Text style={styles.technicalError}>{error}</Text>
          </View>

          {/* Retry Information */}
          {retryCount > 0 && (
            <View style={styles.retryContainer}>
              <Text style={styles.retryText}>
                Retry attempts: {retryCount}/{maxRetries}
              </Text>
              {canRetry && (
                <Text style={styles.retryRemaining}>
                  {retryAttemptsRemaining} attempts remaining
                </Text>
              )}
            </View>
          )}

          {/* Suggestions */}
          <View style={styles.suggestionsContainer}>
            <Text style={styles.suggestionsTitle}>Suggestions:</Text>
            {errorConfig.suggestions.map((suggestion, index) => (
              <View key={index} style={styles.suggestionItem}>
                <Text style={styles.suggestionBullet}>•</Text>
                <Text style={styles.suggestionText}>{suggestion}</Text>
              </View>
            ))}
          </View>

          {/* Action Buttons */}
          <View style={styles.actionsContainer}>
            {canRetry && onRetry && (
              <Button
                title={`Retry ${retryAttemptsRemaining > 1 ? `(${retryAttemptsRemaining} left)` : ''}`}
                onPress={onRetry}
                style={styles.retryButton}
              />
            )}
            
            {onDismiss && (
              <Button
                title="Dismiss"
                onPress={onDismiss}
                variant="secondary"
                style={styles.dismissButton}
              />
            )}
          </View>

          {/* Additional Help */}
          <View style={styles.helpContainer}>
            <Text style={styles.helpTitle}>Need more help?</Text>
            <View style={styles.helpActions}>
              <Button
                title="Device Troubleshooting"
                variant="outline"
                size="small"
                style={styles.helpButton}
              />
              <Button
                title="System Diagnostics"
                variant="outline"
                size="small"
                style={styles.helpButton}
              />
            </View>
          </View>
        </Card>

        {/* Error Context */}
        <Card style={styles.contextCard}>
          <Text style={styles.contextTitle}>What this affects:</Text>
          <View style={styles.contextList}>
            <Text style={styles.contextItem}>• Virtual workspaces</Text>
            <Text style={styles.contextItem}>• Immersive experiences</Text>
            <Text style={styles.contextItem}>• Spatial computing</Text>
            <Text style={styles.contextItem}>• Gesture control</Text>
            <Text style={styles.contextItem}>• Voice interface</Text>
          </View>
        </Card>

        {/* Troubleshooting Steps */}
        <Card style={styles.troubleshootingCard}>
          <Text style={styles.troubleshootingTitle}>Quick Troubleshooting:</Text>
          <View style={styles.troubleshootingSteps}>
            <View style={styles.stepItem}>
              <Text style={styles.stepNumber}>1</Text>
              <Text style={styles.stepText}>Check device connections</Text>
            </View>
            <View style={styles.stepItem}>
              <Text style={styles.stepNumber}>2</Text>
              <Text style={styles.stepText}>Verify system requirements</Text>
            </View>
            <View style={styles.stepItem}>
              <Text style={styles.stepNumber}>3</Text>
              <Text style={styles.stepText}>Restart AR/VR services</Text>
            </View>
            <View style={styles.stepItem}>
              <Text style={styles.stepNumber}>4</Text>
              <Text style={styles.stepText}>Update drivers/software</Text>
            </View>
          </View>
        </Card>

        {/* Device Specific Tips */}
        <Card style={styles.tipsCard}>
          <Text style={styles.tipsCardTitle}>AR/VR Device Tips:</Text>
          <View style={styles.tipsList}>
            <Text style={styles.tipItem}>• Ensure devices are charged and powered on</Text>
            <Text style={styles.tipItem}>• Check cable connections and wireless signals</Text>
            <Text style={styles.tipItem}>• Verify device compatibility with system</Text>
            <Text style={styles.tipItem}>• Update device firmware and drivers</Text>
            <Text style={styles.tipItem}>• Clear tracking area of obstacles</Text>
          </View>
        </Card>

        {/* System Status */}
        <Card style={styles.statusCard}>
          <Text style={styles.statusTitle}>System Status Check:</Text>
          <View style={styles.statusItems}>
            <View style={styles.statusItem}>
              <Text style={styles.statusLabel}>Graphics Engine:</Text>
              <Text style={styles.statusValue}>Checking...</Text>
            </View>
            <View style={styles.statusItem}>
              <Text style={styles.statusLabel}>Tracking Systems:</Text>
              <Text style={styles.statusValue}>Offline</Text>
            </View>
            <View style={styles.statusItem}>
              <Text style={styles.statusLabel}>Spatial Computing:</Text>
              <Text style={styles.statusValue}>Ready</Text>
            </View>
            <View style={styles.statusItem}>
              <Text style={styles.statusLabel}>Audio Systems:</Text>
              <Text style={styles.statusValue}>Available</Text>
            </View>
          </View>
        </Card>

        {/* Common Issues */}
        <Card style={styles.issuesCard}>
          <Text style={styles.issuesTitle}>Common Issues:</Text>
          <View style={styles.issuesList}>
            <View style={styles.issueItem}>
              <Text style={styles.issueProblem}>Device Not Detected</Text>
              <Text style={styles.issueSolution}>Check connections and restart device</Text>
            </View>
            <View style={styles.issueItem}>
              <Text style={styles.issueProblem}>Tracking Lost</Text>
              <Text style={styles.issueSolution}>Recalibrate and clear tracking area</Text>
            </View>
            <View style={styles.issueItem}>
              <Text style={styles.issueProblem}>Rendering Lag</Text>
              <Text style={styles.issueSolution}>Lower quality settings or upgrade hardware</Text>
            </View>
            <View style={styles.issueItem}>
              <Text style={styles.issueProblem}>Spatial Mapping Failed</Text>
              <Text style={styles.issueSolution}>Ensure adequate lighting and space</Text>
            </View>
          </View>
        </Card>

        {/* Support Resources */}
        <Card style={styles.supportCard}>
          <Text style={styles.supportTitle}>Support Resources:</Text>
          <View style={styles.supportItems}>
            <View style={styles.supportItem}>
              <Text style={styles.supportLabel}>Documentation:</Text>
              <Text style={styles.supportValue}>Available in app</Text>
            </View>
            <View style={styles.supportItem}>
              <Text style={styles.supportLabel}>Device Guides:</Text>
              <Text style={styles.supportValue}>Manufacturer support</Text>
            </View>
            <View style={styles.supportItem}>
              <Text style={styles.supportLabel}>Technical Support:</Text>
              <Text style={styles.supportValue}>24/7 available</Text>
            </View>
            <View style={styles.supportItem}>
              <Text style={styles.supportLabel}>Community Forum:</Text>
              <Text style={styles.supportValue}>AR/VR discussions</Text>
            </View>
          </View>
        </Card>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
    padding: 20,
  },
  scrollView: {
    flex: 1,
  },
  errorCard: {
    padding: 24,
    marginBottom: 16,
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
  },
  icon: {
    fontSize: 48,
    marginBottom: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2C3E50',
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    color: '#7F8C8D',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 20,
  },
  technicalContainer: {
    backgroundColor: '#F8F9FA',
    padding: 16,
    borderRadius: 8,
    marginBottom: 20,
  },
  technicalTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 8,
  },
  technicalError: {
    fontSize: 12,
    color: '#E74C3C',
    fontFamily: 'monospace',
    lineHeight: 16,
  },
  retryContainer: {
    backgroundColor: '#FFF3CD',
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
    alignItems: 'center',
  },
  retryText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#856404',
    marginBottom: 4,
  },
  retryRemaining: {
    fontSize: 12,
    color: '#856404',
  },
  suggestionsContainer: {
    marginBottom: 24,
  },
  suggestionsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 12,
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  suggestionBullet: {
    fontSize: 14,
    color: '#9B59B6',
    marginRight: 8,
    marginTop: 2,
  },
  suggestionText: {
    fontSize: 14,
    color: '#7F8C8D',
    lineHeight: 20,
    flex: 1,
  },
  actionsContainer: {
    gap: 12,
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: '#9B59B6',
  },
  dismissButton: {
    backgroundColor: '#95A5A6',
  },
  helpContainer: {
    alignItems: 'center',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E1E8ED',
  },
  helpTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 12,
  },
  helpActions: {
    flexDirection: 'row',
    gap: 12,
  },
  helpButton: {
    flex: 1,
  },
  contextCard: {
    padding: 20,
    marginBottom: 16,
  },
  contextTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 12,
  },
  contextList: {
    gap: 8,
  },
  contextItem: {
    fontSize: 14,
    color: '#7F8C8D',
    lineHeight: 20,
  },
  troubleshootingCard: {
    padding: 20,
    marginBottom: 16,
  },
  troubleshootingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 16,
  },
  troubleshootingSteps: {
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
  tipsCard: {
    padding: 20,
    marginBottom: 16,
  },
  tipsCardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 16,
  },
  tipsList: {
    gap: 8,
  },
  tipItem: {
    fontSize: 14,
    color: '#7F8C8D',
    lineHeight: 20,
  },
  statusCard: {
    padding: 20,
    marginBottom: 16,
  },
  statusTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 16,
  },
  statusItems: {
    gap: 8,
  },
  statusItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusLabel: {
    fontSize: 12,
    color: '#7F8C8D',
  },
  statusValue: {
    fontSize: 12,
    color: '#2C3E50',
    fontWeight: '600',
  },
  issuesCard: {
    padding: 20,
    marginBottom: 16,
  },
  issuesTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 16,
  },
  issuesList: {
    gap: 12,
  },
  issueItem: {
    backgroundColor: '#F8F9FA',
    padding: 12,
    borderRadius: 8,
  },
  issueProblem: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 4,
  },
  issueSolution: {
    fontSize: 12,
    color: '#7F8C8D',
  },
  supportCard: {
    padding: 20,
  },
  supportTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 16,
  },
  supportItems: {
    gap: 8,
  },
  supportItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  supportLabel: {
    fontSize: 12,
    color: '#7F8C8D',
  },
  supportValue: {
    fontSize: 12,
    color: '#9B59B6',
    fontWeight: '600',
  },
});
