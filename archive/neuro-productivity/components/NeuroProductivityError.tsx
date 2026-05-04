/**
 * Neuro Productivity Error Component
 * 
 * Error state component for neuro productivity with different error types,
 * retry functionality, and helpful error messages.
 */

import React from 'react';
import { View, StyleSheet, Text, ScrollView } from 'react-native';
import { Button } from '../../../components/primitives/Button';
import { Card } from '../../../components/primitives/Card';

interface NeuroProductivityErrorProps {
  error: string;
  type?: 'device' | 'connection' | 'analysis' | 'session' | 'optimization' | 'unknown';
  onRetry?: () => void;
  onDismiss?: () => void;
  retryCount?: number;
  maxRetries?: number;
}

export function NeuroProductivityError({ 
  error, 
  type = 'unknown',
  onRetry,
  onDismiss,
  retryCount = 0,
  maxRetries = 3 
}: NeuroProductivityErrorProps) {
  const getErrorConfig = () => {
    switch (type) {
      case 'device':
        return {
          icon: '📱',
          title: 'Device Connection Error',
          description: 'Unable to connect to neuro device. Please check device compatibility and connection.',
          canRetry: true,
          suggestions: [
            'Check device is powered on',
            'Verify Bluetooth is enabled',
            'Ensure device is paired',
            'Check device compatibility',
          ],
        };
      case 'connection':
        return {
          icon: '🔗',
          title: 'Connection Error',
          description: 'Lost connection to neuro device or system. Please re-establish connection.',
          canRetry: true,
          suggestions: [
            'Check device battery level',
            'Move closer to device',
            'Restart the device',
            'Check signal strength',
          ],
        };
      case 'analysis':
        return {
          icon: '🧠',
          title: 'Brainwave Analysis Error',
          description: 'Error processing brainwave data. Please check sensor placement and signal quality.',
          canRetry: true,
          suggestions: [
            'Check sensor placement',
            'Ensure good contact',
            'Reduce electrical interference',
            'Recalibrate sensors',
          ],
        };
      case 'session':
        return {
          icon: '🎯',
          title: 'Session Error',
          description: 'Error during neuro feedback session. Please check session parameters and device status.',
          canRetry: true,
          suggestions: [
            'Verify device connection',
            'Check session settings',
            'Ensure sufficient battery',
            'Restart session',
          ],
        };
      case 'optimization':
        return {
          icon: '⚡',
          title: 'Optimization Error',
          description: 'Error generating cognitive optimization plan. Please check data availability.',
          canRetry: true,
          suggestions: [
            'Collect more baseline data',
            'Check data quality',
            'Verify goals are set',
            'Try different optimization approach',
          ],
        };
      default:
        return {
          icon: '❌',
          title: 'Neuro Productivity Error',
          description: 'An unexpected error occurred with the neuro productivity system.',
          canRetry: true,
          suggestions: [
            'Check device connection',
            'Verify system status',
            'Restart application',
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
                title="Connection Guide"
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
            <Text style={styles.contextItem}>• Brainwave monitoring</Text>
            <Text style={styles.contextItem}>• Cognitive state analysis</Text>
            <Text style={styles.contextItem}>• Neuro feedback sessions</Text>
            <Text style={styles.contextItem}>• Performance metrics</Text>
            <Text style={styles.contextItem}>• Enhancement protocols</Text>
          </View>
        </Card>

        {/* Troubleshooting Steps */}
        <Card style={styles.troubleshootingCard}>
          <Text style={styles.troubleshootingTitle}>Quick Troubleshooting:</Text>
          <View style={styles.troubleshootingSteps}>
            <View style={styles.stepItem}>
              <Text style={styles.stepNumber}>1</Text>
              <Text style={styles.stepText}>Check device connection</Text>
            </View>
            <View style={styles.stepItem}>
              <Text style={styles.stepNumber}>2</Text>
              <Text style={styles.stepText}>Verify sensor placement</Text>
            </View>
            <View style={styles.stepItem}>
              <Text style={styles.stepNumber}>3</Text>
              <Text style={styles.stepText}>Check signal quality</Text>
            </View>
            <View style={styles.stepItem}>
              <Text style={styles.stepNumber}>4</Text>
              <Text style={styles.stepText}>Restart if needed</Text>
            </View>
          </View>
        </Card>

        {/* Device Specific Tips */}
        <Card style={styles.tipsCard}>
          <Text style={styles.tipsCardTitle}>Neuro Device Tips:</Text>
          <View style={styles.tipsList}>
            <Text style={styles.tipItem}>• Ensure sensors have good skin contact</Text>
            <Text style={styles.tipItem}>• Keep device charged during sessions</Text>
            <Text style={styles.tipItem}>• Minimize electrical interference</Text>
            <Text style={styles.tipItem}>• Follow proper sensor placement guidelines</Text>
            <Text style={styles.tipItem}>• Calibrate device before each session</Text>
          </View>
        </Card>

        {/* Signal Quality */}
        <Card style={styles.signalCard}>
          <Text style={styles.signalTitle}>Signal Quality Check:</Text>
          <View style={styles.signalItems}>
            <View style={styles.signalItem}>
              <Text style={styles.signalLabel}>EEG Signal:</Text>
              <Text style={styles.signalValue}>Poor</Text>
            </View>
            <View style={styles.signalItem}>
              <Text style={styles.signalLabel}>Noise Level:</Text>
              <Text style={styles.signalValue}>High</Text>
            </View>
            <View style={styles.signalItem}>
              <Text style={styles.signalLabel}>Contact Quality:</Text>
              <Text style={styles.signalValue}>Low</Text>
            </View>
            <View style={styles.signalItem}>
              <Text style={styles.signalLabel}>Battery Level:</Text>
              <Text style={styles.signalValue}>Checking...</Text>
            </View>
          </View>
        </Card>

        {/* Common Issues */}
        <Card style={styles.issuesCard}>
          <Text style={styles.issuesTitle}>Common Issues:</Text>
          <View style={styles.issuesList}>
            <View style={styles.issueItem}>
              <Text style={styles.issueProblem}>Poor Signal Quality</Text>
              <Text style={styles.issueSolution}>Reposition sensors, clean contacts</Text>
            </View>
            <View style={styles.issueItem}>
              <Text style={styles.issueProblem}>Device Not Found</Text>
              <Text style={styles.issueSolution}>Check Bluetooth, restart device</Text>
            </View>
            <View style={styles.issueItem}>
              <Text style={styles.issueProblem}>Connection Drops</Text>
              <Text style={styles.issueSolution}>Move closer, reduce interference</Text>
            </View>
            <View style={styles.issueItem}>
              <Text style={styles.issueProblem}>Data Processing Error</Text>
              <Text style={styles.issueSolution}>Recalibrate, check data quality</Text>
            </View>
          </View>
        </Card>

        {/* Support Resources */}
        <Card style={styles.supportCard}>
          <Text style={styles.supportTitle}>Support Resources:</Text>
          <View style={styles.supportItems}>
            <View style={styles.supportItem}>
              <Text style={styles.supportLabel}>User Manual:</Text>
              <Text style={styles.supportValue}>Available in app</Text>
            </View>
            <View style={styles.supportItem}>
              <Text style={styles.supportLabel}>Video Tutorials:</Text>
              <Text style={styles.supportValue}>Setup & troubleshooting</Text>
            </View>
            <View style={styles.supportItem}>
              <Text style={styles.supportLabel}>Live Support:</Text>
              <Text style={styles.supportValue}>Chat with neuro specialist</Text>
            </View>
            <View style={styles.supportItem}>
              <Text style={styles.supportLabel}>Community Forum:</Text>
              <Text style={styles.supportValue}>User discussions & tips</Text>
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
  signalCard: {
    padding: 20,
    marginBottom: 16,
  },
  signalTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 16,
  },
  signalItems: {
    gap: 8,
  },
  signalItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  signalLabel: {
    fontSize: 12,
    color: '#7F8C8D',
  },
  signalValue: {
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
