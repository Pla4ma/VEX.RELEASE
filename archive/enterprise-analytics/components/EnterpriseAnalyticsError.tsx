/**
 * Enterprise Analytics Error Component
 * 
 * Error state component for enterprise analytics with different error types,
 * retry functionality, and helpful error messages.
 */

import React from 'react';
import { View, StyleSheet, Text, ScrollView } from 'react-native';
import { Button } from '../../../components/primitives/Button';
import { Card } from '../../../components/primitives/Card';

interface EnterpriseAnalyticsErrorProps {
  error: string;
  type?: 'data-source' | 'connection' | 'analysis' | 'report-generation' | 'forecasting' | 'unknown';
  onRetry?: () => void;
  onDismiss?: () => void;
  retryCount?: number;
  maxRetries?: number;
}

export function EnterpriseAnalyticsError({ 
  error, 
  type = 'unknown',
  onRetry,
  onDismiss,
  retryCount = 0,
  maxRetries = 3 
}: EnterpriseAnalyticsErrorProps) {
  const getErrorConfig = () => {
    switch (type) {
      case 'data-source':
        return {
          icon: '💾',
          title: 'Data Source Error',
          description: 'Unable to connect to or synchronize with data sources. Please check connections and permissions.',
          canRetry: true,
          suggestions: [
            'Verify API credentials',
            'Check data source availability',
            'Review connection settings',
            'Ensure proper permissions',
          ],
        };
      case 'connection':
        return {
          icon: '🔗',
          title: 'Connection Error',
          description: 'Lost connection to analytics system or data sources. Please re-establish connections.',
          canRetry: true,
          suggestions: [
            'Check network connectivity',
            'Verify server status',
            'Review connection timeout',
            'Check authentication tokens',
          ],
        };
      case 'analysis':
        return {
          icon: '📊',
          title: 'Analysis Error',
          description: 'Error processing analytics data. Please check data quality and processing parameters.',
          canRetry: true,
          suggestions: [
            'Verify data integrity',
            'Check analysis parameters',
            'Review data format',
            'Ensure sufficient data volume',
          ],
        };
      case 'report-generation':
        return {
          icon: '📈',
          title: 'Report Generation Error',
          description: 'Error generating analytics report. Please check report parameters and data availability.',
          canRetry: true,
          suggestions: [
            'Verify report parameters',
            'Check data availability',
            'Review report format',
            'Ensure sufficient permissions',
          ],
        };
      case 'forecasting':
        return {
          icon: '🔮',
          title: 'Forecasting Error',
          description: 'Error generating predictive forecasts. Please check model parameters and historical data.',
          canRetry: true,
          suggestions: [
            'Verify model parameters',
            'Check historical data quality',
            'Review forecasting timeframe',
            'Ensure data continuity',
          ],
        };
      default:
        return {
          icon: '❌',
          title: 'Enterprise Analytics Error',
          description: 'An unexpected error occurred with the enterprise analytics system.',
          canRetry: true,
          suggestions: [
            'Check system status',
            'Verify data connections',
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
                title="Data Source Troubleshooting"
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
            <Text style={styles.contextItem}>• Business intelligence dashboards</Text>
            <Text style={styles.contextItem}>• Team performance metrics</Text>
            <Text style={styles.contextItem}>• Department analytics</Text>
            <Text style={styles.contextItem}>• Report generation</Text>
            <Text style={styles.contextItem}>• Predictive forecasting</Text>
          </View>
        </Card>

        {/* Troubleshooting Steps */}
        <Card style={styles.troubleshootingCard}>
          <Text style={styles.troubleshootingTitle}>Quick Troubleshooting:</Text>
          <View style={styles.troubleshootingSteps}>
            <View style={styles.stepItem}>
              <Text style={styles.stepNumber}>1</Text>
              <Text style={styles.stepText}>Check data source connections</Text>
            </View>
            <View style={styles.stepItem}>
              <Text style={styles.stepNumber}>2</Text>
              <Text style={styles.stepText}>Verify API credentials</Text>
            </View>
            <View style={styles.stepItem}>
              <Text style={styles.stepNumber}>3</Text>
              <Text style={styles.stepText}>Review system permissions</Text>
            </View>
            <View style={styles.stepItem}>
              <Text style={styles.stepNumber}>4</Text>
              <Text style={styles.stepText}>Check network connectivity</Text>
            </View>
          </View>
        </Card>

        {/* Data Source Specific Tips */}
        <Card style={styles.tipsCard}>
          <Text style={styles.tipsCardTitle}>Data Source Tips:</Text>
          <View style={styles.tipsList}>
            <Text style={styles.tipItem}>• Ensure API keys are valid and not expired</Text>
            <Text style={styles.tipItem}>• Check data source service status</Text>
            <Text style={styles.tipItem}>• Verify network firewall settings</Text>
            <Text style={styles.tipItem}>• Review data synchronization schedule</Text>
            <Text style={styles.tipItem}>• Check data format compatibility</Text>
          </View>
        </Card>

        {/* System Status */}
        <Card style={styles.statusCard}>
          <Text style={styles.statusTitle}>System Status Check:</Text>
          <View style={styles.statusItems}>
            <View style={styles.statusItem}>
              <Text style={styles.statusLabel}>Analytics Engine:</Text>
              <Text style={styles.statusValue}>Checking...</Text>
            </View>
            <View style={styles.statusItem}>
              <Text style={styles.statusLabel}>Data Pipeline:</Text>
              <Text style={styles.statusValue}>Offline</Text>
            </View>
            <View style={styles.statusItem}>
              <Text style={styles.statusLabel}>Report Generator:</Text>
              <Text style={styles.statusValue}>Ready</Text>
            </View>
            <View style={styles.statusItem}>
              <Text style={styles.statusLabel}>Forecasting Model:</Text>
              <Text style={styles.statusValue}>Available</Text>
            </View>
          </View>
        </Card>

        {/* Common Issues */}
        <Card style={styles.issuesCard}>
          <Text style={styles.issuesTitle}>Common Issues:</Text>
          <View style={styles.issuesList}>
            <View style={styles.issueItem}>
              <Text style={styles.issueProblem}>API Rate Limits</Text>
              <Text style={styles.issueSolution}>Reduce request frequency or upgrade plan</Text>
            </View>
            <View style={styles.issueItem}>
              <Text style={styles.issueProblem}>Data Format Mismatch</Text>
              <Text style={styles.issueSolution}>Update data mapping configuration</Text>
            </View>
            <View style={styles.issueItem}>
              <Text style={styles.issueProblem}>Authentication Failure</Text>
              <Text style={styles.issueSolution}>Refresh API credentials</Text>
            </View>
            <View style={styles.issueItem}>
              <Text style={styles.issueProblem}>Network Timeout</Text>
              <Text style={styles.issueSolution}>Check connection and increase timeout</Text>
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
              <Text style={styles.supportLabel}>API Reference:</Text>
              <Text style={styles.supportValue}>Developer portal</Text>
            </View>
            <View style={styles.supportItem}>
              <Text style={styles.supportLabel}>Technical Support:</Text>
              <Text style={styles.supportValue}>24/7 available</Text>
            </View>
            <View style={styles.supportItem}>
              <Text style={styles.supportLabel}>Community Forum:</Text>
              <Text style={styles.supportValue}>Enterprise discussions</Text>
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
    color: '#3498DB',
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
    backgroundColor: '#3498DB',
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
    backgroundColor: '#3498DB',
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
    color: '#3498DB',
    fontWeight: '600',
  },
});
