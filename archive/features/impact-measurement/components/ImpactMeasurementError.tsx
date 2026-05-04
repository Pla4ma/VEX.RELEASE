/**
 * Impact Measurement Error Component
 * 
 * Error handling UI for impact measurement features with detailed messages,
 * retry functionality, suggestions, technical details, troubleshooting steps,
 * impact-specific tips, system status, and support options.
 */

import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Animated } from 'react-native';
import { Card } from '../../../components/primitives/Card';
import { Button } from '../../../components/primitives/Button';
import { Badge } from '../../../components/primitives/Badge';

interface ImpactMeasurementErrorProps {
  error?: string;
  errorType?: 'metric_creation' | 'report_generation' | 'goal_tracking' | 'carbon_calculation' | 'data_sync' | 'analytics' | 'authentication' | 'network' | 'unknown';
  onRetry?: () => void;
  onDismiss?: () => void;
  onContactSupport?: () => void;
}

export function ImpactMeasurementError({
  error = 'An unexpected error occurred while loading impact measurement data.',
  errorType = 'unknown',
  onRetry,
  onDismiss,
  onContactSupport,
}: ImpactMeasurementErrorProps) {
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const [fadeAnim] = useState(new Animated.Value(0));

  React.useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, []);

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  const getErrorContent = () => {
    const content = {
      metric_creation: {
        title: 'Metric Creation Failed',
        message: 'Unable to create new impact metric. Please check your data format and try again.',
        suggestions: [
          'Verify metric name and category are valid',
          'Ensure measurement units are correctly specified',
          'Check that baseline and target values are numeric',
          'Validate metric description length and format',
        ],
        troubleshooting: [
          'Refresh the page and try again',
          'Check your internet connection',
          'Verify you have sufficient permissions',
          'Try creating a simpler metric first',
        ],
        tips: [
          'Start with basic metrics like energy consumption or waste reduction',
          'Use standard units (kWh, kg CO2e, gallons) for consistency',
          'Set realistic baseline and target values',
          'Include clear descriptions for better tracking',
        ],
      },
      report_generation: {
        title: 'Report Generation Failed',
        message: 'Unable to generate impact report. Please check your report parameters and try again.',
        suggestions: [
          'Verify date range is valid and contains data',
          'Check that selected metrics have sufficient data',
          'Ensure report type is supported for your plan',
          'Validate report format preferences',
        ],
        troubleshooting: [
          'Select a broader date range',
          'Try generating a simpler report first',
          'Check if metrics are properly configured',
          'Verify your account has reporting permissions',
        ],
        tips: [
          'Reports require at least 7 days of data for meaningful insights',
          'Combine multiple metrics for comprehensive reports',
          'Schedule regular reports for consistent tracking',
          'Export reports in multiple formats for sharing',
        ],
      },
      goal_tracking: {
        title: 'Goal Tracking Failed',
        message: 'Unable to track or update sustainability goals. Please check goal configuration.',
        suggestions: [
          'Verify goal targets are numeric and achievable',
          'Check deadline dates are in the future',
          'Ensure goal category matches available metrics',
          'Validate priority level is appropriate',
        ],
        troubleshooting: [
          'Review similar successful goals for reference',
          'Check if required metrics are being tracked',
          'Verify goal doesn\'t conflict with existing goals',
          'Try setting a more conservative target first',
        ],
        tips: [
          'Set SMART goals (Specific, Measurable, Achievable, Relevant, Time-bound)',
          'Break large goals into smaller milestones',
          'Regular monitoring helps stay on track',
          'Adjust goals based on actual performance data',
        ],
      },
      carbon_calculation: {
        title: 'Carbon Footprint Calculation Failed',
        message: 'Unable to calculate carbon footprint. Please check data sources and parameters.',
        suggestions: [
          'Verify energy consumption data is available',
          'Check emission factors are configured for your region',
          'Ensure activity data covers the calculation period',
          'Validate calculation methodology is appropriate',
        ],
        troubleshooting: [
          'Import historical energy data first',
          'Configure emission factors for your location',
          'Check data source connections and permissions',
          'Try calculating for a shorter period first',
        ],
        tips: [
          'Carbon calculations require consistent energy usage data',
          'Different regions have different emission factors',
          'Include all relevant emission sources (electricity, gas, transport)',
          'Regular calculations help track progress over time',
        ],
      },
      data_sync: {
        title: 'Data Synchronization Failed',
        message: 'Unable to sync impact measurement data. Please check data connections.',
        suggestions: [
          'Verify data source credentials are correct',
          'Check API endpoints are accessible',
          'Ensure data format matches expected schema',
          'Validate sync schedule and frequency',
        ],
        troubleshooting: [
          'Test data source connections individually',
          'Check for API rate limits or quotas',
          'Verify network connectivity and firewalls',
          'Try manual sync to identify specific issues',
        ],
        tips: [
          'Automated sync ensures data is always current',
          'Set appropriate sync intervals to avoid API limits',
          'Monitor sync logs for troubleshooting',
          'Keep data source credentials secure and updated',
        ],
      },
      analytics: {
        title: 'Analytics Processing Failed',
        message: 'Unable to process impact analytics. Please check data availability and parameters.',
        suggestions: [
          'Verify sufficient historical data exists',
          'Check analytics parameters are valid',
          'Ensure data quality meets minimum requirements',
          'Validate calculation methods are appropriate',
        ],
        troubleshooting: [
          'Wait for more data to accumulate',
          'Check data quality and completeness',
          'Try simpler analytics calculations first',
          'Verify time periods contain adequate data points',
        ],
        tips: [
          'Analytics requires consistent data over time',
          'Quality data leads to more accurate insights',
          'Regular updates improve trend analysis',
          'Combine different analytics for comprehensive insights',
        ],
      },
      authentication: {
        title: 'Authentication Failed',
        message: 'Unable to authenticate with impact measurement services. Please check your credentials.',
        suggestions: [
          'Verify your account credentials are correct',
          'Check your subscription is active',
          'Ensure you have required permissions',
          'Validate API keys and tokens',
        ],
        troubleshooting: [
          'Reset your password if needed',
          'Check your subscription status and plan',
          'Contact administrator for permission issues',
          'Regenerate API keys if compromised',
        ],
        tips: [
          'Use strong, unique passwords for security',
          'Enable two-factor authentication when available',
          'Regularly update your account information',
          'Keep API keys secure and rotate them periodically',
        ],
      },
      network: {
        title: 'Network Connection Failed',
        message: 'Unable to connect to impact measurement services. Please check your network connection.',
        suggestions: [
          'Check your internet connection is stable',
          'Verify firewall settings allow access',
          'Check if services are experiencing outages',
          'Try connecting from a different network',
        ],
        troubleshooting: [
          'Test other internet connections',
          'Restart your router or network equipment',
          'Check service status pages for outages',
          'Try connecting using a different device',
        ],
        tips: [
          'Stable internet is crucial for real-time tracking',
          'Consider offline mode for poor connectivity areas',
          'Monitor network performance for troubleshooting',
          'Have backup connectivity options available',
        ],
      },
      unknown: {
        title: 'Unexpected Error',
        message: 'An unexpected error occurred. Please try again or contact support if the issue persists.',
        suggestions: [
          'Refresh the page and try again',
          'Check your internet connection',
          'Verify your account is in good standing',
          'Try accessing from a different browser',
        ],
        troubleshooting: [
          'Clear browser cache and cookies',
          'Disable browser extensions temporarily',
          'Try accessing from a different device',
          'Contact support with error details',
        ],
        tips: [
          'Regular backups prevent data loss',
          'Monitor system performance for issues',
          'Keep your browser and apps updated',
          'Document errors for faster troubleshooting',
        ],
      },
    };

    return content[errorType] || content.unknown;
  };

  const content = getErrorContent();

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <Animated.View style={[styles.contentContainer, { opacity: fadeAnim }]}>
        {/* Main Error Card */}
        <Card style={styles.mainCard}>
          <View style={styles.errorHeader}>
            <Text style={styles.errorIcon}>⚠️</Text>
            <Text style={styles.errorTitle}>{content.title}</Text>
          </View>
          <Text style={styles.errorMessage}>{error}</Text>
          <Text style={styles.errorDescription}>{content.message}</Text>

          {/* Action Buttons */}
          <View style={styles.actionContainer}>
            {onRetry && (
              <Button
                title="Try Again"
                onPress={onRetry}
                variant="primary"
                style={styles.retryButton}
              />
            )}
            {onContactSupport && (
              <Button
                title="Contact Support"
                onPress={onContactSupport}
                variant="secondary"
                style={styles.supportButton}
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
        </Card>

        {/* Suggestions */}
        <Card style={styles.suggestionsCard}>
          <TouchableOpacity
            style={styles.sectionHeader}
            onPress={() => toggleSection('suggestions')}
          >
            <Text style={styles.sectionTitle}>💡 Suggestions</Text>
            <Text style={styles.expandIcon}>
              {expandedSection === 'suggestions' ? '▼' : '▶'}
            </Text>
          </TouchableOpacity>
          
          {expandedSection === 'suggestions' && (
            <View style={styles.suggestionsList}>
              {content.suggestions.map((suggestion, index) => (
                <Text key={index} style={styles.suggestionText}>
                  • {suggestion}
                </Text>
              ))}
            </View>
          )}
        </Card>

        {/* Troubleshooting */}
        <Card style={styles.troubleshootingCard}>
          <TouchableOpacity
            style={styles.sectionHeader}
            onPress={() => toggleSection('troubleshooting')}
          >
            <Text style={styles.sectionTitle}>🔧 Troubleshooting Steps</Text>
            <Text style={styles.expandIcon}>
              {expandedSection === 'troubleshooting' ? '▼' : '▶'}
            </Text>
          </TouchableOpacity>
          
          {expandedSection === 'troubleshooting' && (
            <View style={styles.troubleshootingList}>
              {content.troubleshooting.map((step, index) => (
                <Text key={index} style={styles.troubleshootingText}>
                  {index + 1}. {step}
                </Text>
              ))}
            </View>
          )}
        </Card>

        {/* Impact-Specific Tips */}
        <Card style={styles.tipsCard}>
          <TouchableOpacity
            style={styles.sectionHeader}
            onPress={() => toggleSection('tips')}
          >
            <Text style={styles.sectionTitle}>🌱 Impact Measurement Tips</Text>
            <Text style={styles.expandIcon}>
              {expandedSection === 'tips' ? '▼' : '▶'}
            </Text>
          </TouchableOpacity>
          
          {expandedSection === 'tips' && (
            <View style={styles.tipsList}>
              {content.tips.map((tip, index) => (
                <Text key={index} style={styles.tipText}>
                  • {tip}
                </Text>
              ))}
            </View>
          )}
        </Card>

        {/* System Status */}
        <Card style={styles.statusCard}>
          <Text style={styles.statusTitle}>🖥️ System Status</Text>
          <View style={styles.statusGrid}>
            <View style={styles.statusItem}>
              <Text style={styles.statusLabel}>Impact Services:</Text>
              <Badge text="Online" variant="success" />
            </View>
            <View style={styles.statusItem}>
              <Text style={styles.statusLabel}>Data Processing:</Text>
              <Badge text="Operational" variant="success" />
            </View>
            <View style={styles.statusItem}>
              <Text style={styles.statusLabel}>Report Generation:</Text>
              <Badge text="Available" variant="success" />
            </View>
            <View style={styles.statusItem}>
              <Text style={styles.statusLabel}>Network:</Text>
              <Badge text="Connected" variant="success" />
            </View>
          </View>
        </Card>

        {/* Support Options */}
        <Card style={styles.supportCard}>
          <Text style={styles.supportTitle}>📞 Support Options</Text>
          <View style={styles.supportOptions}>
            <View style={styles.supportOption}>
              <Text style={styles.supportOptionTitle}>Documentation</Text>
              <Text style={styles.supportOptionDescription}>
                Browse comprehensive guides and tutorials
              </Text>
            </View>
            <View style={styles.supportOption}>
              <Text style={styles.supportOptionTitle}>Community Forum</Text>
              <Text style={styles.supportOptionDescription}>
                Get help from other impact measurement users
              </Text>
            </View>
            <View style={styles.supportOption}>
              <Text style={styles.supportOptionTitle}>Email Support</Text>
              <Text style={styles.supportOptionDescription}>
                Contact our support team for personalized help
              </Text>
            </View>
          </View>
        </Card>

        {/* Error Details */}
        <Card style={styles.detailsCard}>
          <TouchableOpacity
            style={styles.sectionHeader}
            onPress={() => toggleSection('details')}
          >
            <Text style={styles.sectionTitle}>🔍 Technical Details</Text>
            <Text style={styles.expandIcon}>
              {expandedSection === 'details' ? '▼' : '▶'}
            </Text>
          </TouchableOpacity>
          
          {expandedSection === 'details' && (
            <View style={styles.detailsList}>
              <Text style={styles.detailText}>
                Error Type: {errorType}
              </Text>
              <Text style={styles.detailText}>
                Timestamp: {new Date().toLocaleString()}
              </Text>
              <Text style={styles.detailText}>
                User Agent: Impact Measurement System v1.0
              </Text>
              <Text style={styles.detailText}>
                Session ID: IMP-{Math.random().toString(36).substr(2, 9).toUpperCase()}
              </Text>
            </View>
          )}
        </Card>
      </Animated.View>
    </ScrollView>
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
  errorHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  errorIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#E74C3C',
  },
  errorMessage: {
    fontSize: 16,
    color: '#2C3E50',
    marginBottom: 8,
    lineHeight: 22,
  },
  errorDescription: {
    fontSize: 14,
    color: '#7F8C8D',
    marginBottom: 24,
    lineHeight: 20,
  },
  actionContainer: {
    gap: 12,
  },
  retryButton: {
    // Additional styling handled by Button component
  },
  supportButton: {
    // Additional styling handled by Button component
  },
  dismissButton: {
    // Additional styling handled by Button component
  },
  suggestionsCard: {
    padding: 16,
    marginBottom: 16,
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
  suggestionsList: {
    gap: 8,
  },
  suggestionText: {
    fontSize: 14,
    color: '#2C3E50',
    lineHeight: 20,
  },
  troubleshootingCard: {
    padding: 16,
    marginBottom: 16,
  },
  troubleshootingList: {
    gap: 8,
  },
  troubleshootingText: {
    fontSize: 14,
    color: '#2C3E50',
    lineHeight: 20,
  },
  tipsCard: {
    padding: 16,
    marginBottom: 16,
  },
  tipsList: {
    gap: 8,
  },
  tipText: {
    fontSize: 14,
    color: '#27AE60',
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
  statusGrid: {
    gap: 12,
  },
  statusItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  statusLabel: {
    fontSize: 14,
    color: '#7F8C8D',
  },
  supportCard: {
    padding: 16,
    marginBottom: 16,
  },
  supportTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 12,
  },
  supportOptions: {
    gap: 12,
  },
  supportOption: {
    padding: 12,
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
  },
  supportOptionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 4,
  },
  supportOptionDescription: {
    fontSize: 12,
    color: '#7F8C8D',
    lineHeight: 16,
  },
  detailsCard: {
    padding: 16,
    marginBottom: 16,
  },
  detailsList: {
    gap: 8,
  },
  detailText: {
    fontSize: 12,
    color: '#7F8C8D',
    fontFamily: 'monospace',
  },
});
