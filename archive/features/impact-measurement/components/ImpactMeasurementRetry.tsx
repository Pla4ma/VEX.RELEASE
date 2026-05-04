/**
 * Impact Measurement Retry Component
 * 
 * Retry component for impact measurement operations with smart retry logic,
 * exponential backoff, retry progress, fallback options, alternative actions,
 * and impact-specific tips.
 */

import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { Card } from '../../../components/primitives/Card';
import { Button } from '../../../components/primitives/Button';
import { Badge } from '../../../components/primitives/Badge';
import { ProgressBar } from '../../../components/ProgressBar';

interface ImpactMeasurementRetryProps {
  onRetry?: () => void;
  onDismiss?: () => void;
  errorType?: 'metric_creation' | 'report_generation' | 'goal_tracking' | 'carbon_calculation' | 'data_sync' | 'analytics' | 'authentication' | 'network' | 'unknown';
  retryCount?: number;
  maxRetries?: number;
  lastRetryTime?: Date;
  nextRetryTime?: Date;
  estimatedWaitTime?: number;
}

export function ImpactMeasurementRetry({
  onRetry,
  onDismiss,
  errorType = 'unknown',
  retryCount = 0,
  maxRetries = 3,
  lastRetryTime,
  nextRetryTime,
  estimatedWaitTime = 5000,
}: ImpactMeasurementRetryProps) {
  const [countdown, setCountdown] = useState(0);
  const [pulseAnim] = useState(new Animated.Value(1));
  const [slideAnim] = useState(new Animated.Value(20));
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  useEffect(() => {
    // Pulse animation for retry button
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
      duration: 300,
      useNativeDriver: true,
    }).start();

    return () => {
      pulseAnimation.stop();
    };
  }, []);

  useEffect(() => {
    if (nextRetryTime) {
      const interval = setInterval(() => {
        const now = new Date().getTime();
        const retryTime = nextRetryTime.getTime();
        const remaining = Math.max(0, retryTime - now);
        setCountdown(Math.ceil(remaining / 1000));
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [nextRetryTime]);

  const getRetryContent = () => {
    const content = {
      metric_creation: {
        title: 'Retry Metric Creation',
        message: 'Attempting to create impact metric with optimized parameters',
        fallbackActions: [
          { id: 'use_template', title: 'Use Metric Template', description: 'Start with a pre-built impact metric' },
          { id: 'simplify_metric', title: 'Simplify Metric', description: 'Reduce metric complexity' },
          { id: 'check_data', title: 'Check Data Format', description: 'Verify data format and values' },
        ],
        tips: [
          'Impact metrics need clear names and units for proper tracking',
          'Consider starting with basic metrics like energy usage or waste reduction',
          'Ensure baseline values are accurate for meaningful progress tracking',
          'Different categories (environmental, social, economic) have specific requirements',
        ],
      },
      report_generation: {
        title: 'Retry Report Generation',
        message: 'Attempting to generate impact report with adjusted parameters',
        fallbackActions: [
          { id: 'adjust_period', title: 'Adjust Time Period', description: 'Select a different date range' },
          { id: 'simplify_report', title: 'Simplify Report', description: 'Generate a simpler report first' },
          { id: 'check_data', title: 'Check Data Availability', description: 'Verify sufficient data exists' },
        ],
        tips: [
          'Reports require sufficient data for meaningful insights',
          'Different report types have different data requirements',
          'Time periods should align with metric collection frequency',
          'Complex reports may take longer to generate',
        ],
      },
      goal_tracking: {
        title: 'Retry Goal Tracking',
        message: 'Attempting to track sustainability goal with corrected parameters',
        fallbackActions: [
          { id: 'adjust_target', title: 'Adjust Target Value', description: 'Set a more achievable target' },
          { id: 'extend_deadline', title: 'Extend Deadline', description: 'Allow more time for achievement' },
          { id: 'check_metrics', title: 'Check Related Metrics', description: 'Verify metrics are being tracked' },
        ],
        tips: [
          'Sustainability goals should be SMART (Specific, Measurable, Achievable, Relevant, Time-bound)',
          'Targets should be based on historical performance data',
          'Regular monitoring helps identify when goals need adjustment',
          'Break large goals into smaller milestones for better tracking',
        ],
      },
      carbon_calculation: {
        title: 'Retry Carbon Calculation',
        message: 'Attempting carbon footprint calculation with improved data sources',
        fallbackActions: [
          { id: 'check_data', title: 'Check Data Sources', description: 'Verify energy data is available' },
          { id: 'adjust_factors', title: 'Adjust Emission Factors', description: 'Update regional emission factors' },
          { id: 'simplify_calc', title: 'Simplify Calculation', description: 'Use basic calculation method' },
        ],
        tips: [
          'Carbon calculations require consistent energy usage data',
          'Emission factors vary by region and energy source',
          'Include all relevant emission sources for accurate footprint',
          'Regular calculations help track progress over time',
        ],
      },
      data_sync: {
        title: 'Retry Data Synchronization',
        message: 'Attempting to sync impact measurement data with optimized settings',
        fallbackActions: [
          { id: 'check_connection', title: 'Check Connection', description: 'Verify data source connectivity' },
          { id: 'adjust_frequency', title: 'Adjust Sync Frequency', description: 'Change sync interval' },
          { id: 'manual_sync', title: 'Manual Sync', description: 'Trigger manual synchronization' },
        ],
        tips: [
          'Data synchronization requires stable network connections',
          'API rate limits may affect sync frequency',
          'Monitor sync logs for troubleshooting connection issues',
          'Automated sync ensures data is always current',
        ],
      },
      analytics: {
        title: 'Retry Analytics Processing',
        message: 'Attempting analytics processing with improved data quality',
        fallbackActions: [
          { id: 'check_data_quality', title: 'Check Data Quality', description: 'Verify data completeness' },
          { id: 'adjust_parameters', title: 'Adjust Parameters', description: 'Modify analytics settings' },
          { id: 'extend_period', title: 'Extend Time Period', description: 'Use longer data period' },
        ],
        tips: [
          'Analytics require sufficient historical data for meaningful insights',
          'Data quality directly impacts analytics accuracy',
          'Different analytics methods have different data requirements',
          'Regular processing helps identify trends and patterns',
        ],
      },
      authentication: {
        title: 'Retry Authentication',
        message: 'Attempting authentication with refreshed credentials',
        fallbackActions: [
          { id: 'refresh_tokens', title: 'Refresh Tokens', description: 'Generate new authentication tokens' },
          { id: 'check_permissions', title: 'Check Permissions', description: 'Verify account permissions' },
          { id: 'alternative_auth', title: 'Alternative Auth', description: 'Try different authentication method' },
        ],
        tips: [
          'Authentication tokens have expiration dates',
          'API keys should be regularly rotated for security',
          'Account permissions affect available features and data',
          'Two-factor authentication enhances security',
        ],
      },
      network: {
        title: 'Retry Network Connection',
        message: 'Attempting to reconnect to impact measurement services',
        fallbackActions: [
          { id: 'check_connectivity', title: 'Check Connectivity', description: 'Test network connection' },
          { id: 'alternative_endpoint', title: 'Alternative Endpoint', description: 'Try different service endpoint' },
          { id: 'offline_mode', title: 'Offline Mode', description: 'Work with cached data' },
        ],
        tips: [
          'Stable internet is crucial for real-time impact tracking',
          'Network latency affects data synchronization speed',
          'Firewall settings may block service access',
          'Consider offline mode for poor connectivity areas',
        ],
      },
      unknown: {
        title: 'Retry Operation',
        message: 'Attempting to retry impact measurement operation with default recovery strategy',
        fallbackActions: [
          { id: 'refresh_interface', title: 'Refresh Interface', description: 'Reload impact measurement interface' },
          { id: 'check_status', title: 'Check Status', description: 'Verify service status' },
          { id: 'contact_support', title: 'Contact Support', description: 'Get help from support team' },
        ],
        tips: [
          'Impact measurement systems can experience transient failures',
          'Service status pages provide information about known issues',
          'Regular application restarts can resolve some issues',
          'Error logs help diagnose system problems',
        ],
      },
    };

    return content[errorType] || content.unknown;
  };

  const content = getRetryContent();
  const canRetry = retryCount < maxRetries;
  const retryProgress = (retryCount / maxRetries) * 100;
  const isWaiting = countdown > 0;

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  const getExponentialBackoffTime = (attempt: number) => {
    return Math.min(1000 * Math.pow(2, attempt), 30000);
  };

  const formatTimeRemaining = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <View style={styles.container}>
      {/* Main Retry Card */}
      <Card style={styles.mainCard}>
        <Animated.View
          style={[
            styles.retryHeader,
            { transform: [{ translateY: slideAnim }] },
          ]}
        >
          <View style={styles.retryTitleContainer}>
            <Text style={styles.retryTitle}>{content.title}</Text>
            <Badge text={`Attempt ${retryCount + 1}/${maxRetries}`} variant="primary" />
          </View>
          <Text style={styles.retryMessage}>{content.message}</Text>
        </Animated.View>

        {/* Retry Progress */}
        <View style={styles.progressContainer}>
          <Text style={styles.progressTitle}>Retry Progress</Text>
          <ProgressBar 
            progress={retryProgress} 
            color={canRetry ? '#27AE60' : '#E74C3C'}
          />
          <Text style={styles.progressText}>
            {retryCount} of {maxRetries} retries completed
          </Text>
        </View>

        {/* Countdown Timer */}
        {isWaiting && (
          <View style={styles.countdownContainer}>
            <Text style={styles.countdownTitle}>Next Retry In:</Text>
            <Animated.View
              style={[
                styles.countdownTimer,
                { transform: [{ scale: pulseAnim }] },
              ]}
            >
              <Text style={styles.countdownText}>
                {formatTimeRemaining(countdown)}
              </Text>
            </Animated.View>
          </View>
        )}

        {/* Retry Strategy */}
        <View style={styles.strategyContainer}>
          <Text style={styles.strategyTitle}>Retry Strategy:</Text>
          <Text style={styles.strategyText}>
            Exponential backoff with {getExponentialBackoffTime(retryCount)}ms delay
          </Text>
          <Text style={styles.strategyText}>
            Next retry in {formatTimeRemaining(countdown)} seconds
          </Text>
        </View>

        {/* Last Retry Info */}
        {lastRetryTime && (
          <View style={styles.lastRetryContainer}>
            <Text style={styles.lastRetryTitle}>Last Retry:</Text>
            <Text style={styles.lastRetryText}>
              {lastRetryTime.toLocaleTimeString()}
            </Text>
          </View>
        )}

        {/* Action Buttons */}
        <View style={styles.actionsContainer}>
          {canRetry && !isWaiting && onRetry && (
            <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
              <Button
                title="Retry Now"
                onPress={onRetry}
                variant="primary"
                style={styles.retryButton}
              />
            </Animated.View>
          )}
          {isWaiting && (
            <Button
              title={`Retry in ${formatTimeRemaining(countdown)}`}
              onPress={() => {}}
              variant="secondary"
              style={styles.waitingButton}
              disabled={true}
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

      {/* Fallback Actions */}
      <Card style={styles.fallbackCard}>
        <TouchableOpacity
          style={styles.sectionHeader}
          onPress={() => toggleSection('fallback')}
        >
          <Text style={styles.sectionTitle}>🔄 Alternative Actions</Text>
          <Text style={styles.expandIcon}>
            {expandedSection === 'fallback' ? '▼' : '▶'}
          </Text>
        </TouchableOpacity>
        
        {expandedSection === 'fallback' && (
          <View style={styles.fallbackList}>
            {content.fallbackActions.map((action) => (
              <TouchableOpacity
                key={action.id}
                style={styles.fallbackItem}
                onPress={() => {}}
              >
                <Text style={styles.fallbackTitle}>{action.title}</Text>
                <Text style={styles.fallbackDescription}>{action.description}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </Card>

      {/* Impact Tips */}
      <Card style={styles.tipsCard}>
        <TouchableOpacity
          style={styles.sectionHeader}
          onPress={() => toggleSection('tips')}
        >
          <Text style={styles.sectionTitle}>🌱 Impact Tips</Text>
          <Text style={styles.expandIcon}>
            {expandedSection === 'tips' ? '▼' : '▶'}
          </Text>
        </TouchableOpacity>
        
        {expandedSection === 'tips' && (
          <View style={styles.tipsList}>
            {content.tips.map((tip, index) => (
              <View key={index} style={styles.tipItem}>
                <Text style={styles.tipText}>{tip}</Text>
              </View>
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
            <Text style={styles.statusLabel}>Network:</Text>
            <Badge text="Connected" variant="success" />
          </View>
          <View style={styles.statusItem}>
            <Text style={styles.statusLabel}>Retry Status:</Text>
            <Badge text={canRetry ? "Active" : "Exhausted"} variant={canRetry ? "success" : "danger"} />
          </View>
        </View>
      </Card>

      {/* Retry Statistics */}
      <Card style={styles.statsCard}>
        <Text style={styles.statsTitle}>📊 Retry Statistics</Text>
        <View style={styles.statsGrid}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{retryCount}</Text>
            <Text style={styles.statLabel}>Total Retries</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{maxRetries - retryCount}</Text>
            <Text style={styles.statLabel}>Retries Remaining</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{Math.round(retryProgress)}%</Text>
            <Text style={styles.statLabel}>Progress</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{formatTimeRemaining(countdown)}</Text>
            <Text style={styles.statLabel}>Next Retry</Text>
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
    marginBottom: 20,
  },
  retryTitleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  retryTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#2C3E50',
  },
  retryMessage: {
    fontSize: 16,
    color: '#7F8C8D',
    lineHeight: 24,
  },
  progressContainer: {
    marginBottom: 16,
  },
  progressTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 8,
  },
  progressText: {
    fontSize: 14,
    color: '#7F8C8D',
    marginTop: 4,
  },
  countdownContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  countdownTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 8,
  },
  countdownTimer: {
    backgroundColor: '#27AE60',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  countdownText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  strategyContainer: {
    marginBottom: 16,
  },
  strategyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 4,
  },
  strategyText: {
    fontSize: 14,
    color: '#7F8C8D',
    marginBottom: 2,
  },
  lastRetryContainer: {
    marginBottom: 20,
  },
  lastRetryTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 4,
  },
  lastRetryText: {
    fontSize: 14,
    color: '#7F8C8D',
  },
  actionsContainer: {
    gap: 12,
  },
  retryButton: {
    // Additional styling handled by Button component
  },
  waitingButton: {
    // Additional styling handled by Button component
  },
  dismissButton: {
    // Additional styling handled by Button component
  },
  fallbackCard: {
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
  fallbackList: {
    gap: 8,
  },
  fallbackItem: {
    padding: 12,
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E1E8ED',
  },
  fallbackTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 4,
  },
  fallbackDescription: {
    fontSize: 14,
    color: '#7F8C8D',
  },
  tipsCard: {
    padding: 16,
    marginBottom: 16,
  },
  tipsList: {
    gap: 8,
  },
  tipItem: {
    padding: 8,
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
    padding: 8,
  },
  statusLabel: {
    fontSize: 14,
    color: '#7F8C8D',
  },
  statsCard: {
    padding: 16,
    marginBottom: 16,
  },
  statsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 12,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statItem: {
    flex: 1,
    minWidth: '45%',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '600',
    color: '#27AE60',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#7F8C8D',
    textAlign: 'center',
  },
});
