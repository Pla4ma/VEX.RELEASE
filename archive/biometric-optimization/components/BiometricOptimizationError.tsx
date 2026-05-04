/**
 * Biometric Optimization Error Component
 * 
 * Error handling for biometric optimization operations with detailed messages,
 * retry functionality, suggestions, troubleshooting steps, and device-specific tips.
 */

import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Dimensions } from 'react-native';
import { Card } from '../../../components/primitives/Card';
import { Button } from '../../../components/primitives/Button';
import { Badge } from '../../../components/primitives/Badge';

const { width } = Dimensions.get('window');

interface BiometricOptimizationErrorProps {
  error?: Error | string;
  onRetry?: () => void;
  onDismiss?: () => void;
  errorType?: 'device_connection' | 'data_sync' | 'health_monitoring' | 'performance_tracking' | 'wellness_program' | 'optimization' | 'calibration' | 'authentication' | 'network' | 'unknown';
  retryCount?: number;
  maxRetries?: number;
}

export function BiometricOptimizationError({
  error,
  onRetry,
  onDismiss,
  errorType = 'unknown',
  retryCount = 0,
  maxRetries = 3,
}: BiometricOptimizationErrorProps) {
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  const getErrorInfo = () => {
    switch (errorType) {
      case 'device_connection':
        return {
          title: 'Device Connection Error',
          description: 'Unable to connect to biometric device',
          icon: '📱',
          color: '#E74C3C',
          suggestions: [
            'Check if device is powered on and within range',
            'Ensure Bluetooth is enabled on your device',
            'Verify device compatibility and firmware updates',
            'Restart the device and try again',
          ],
          troubleshooting: [
            'Turn off Bluetooth and turn it back on',
            'Unpair and re-pair the device',
            'Check device battery level',
            'Move closer to the device',
          ],
          technicalDetails: [
            'Error Code: DEV_CONN_001',
            'Protocol: Bluetooth Low Energy (BLE)',
            'Range: ~10 meters optimal',
            'Battery: Minimum 20% required',
          ],
        };
      case 'data_sync':
        return {
          title: 'Data Synchronization Error',
          description: 'Failed to sync biometric data',
          icon: '☁️',
          color: '#F39C12',
          suggestions: [
            'Check your internet connection',
            'Ensure sufficient storage space',
            'Verify cloud service status',
            'Try manual sync',
          ],
          troubleshooting: [
            'Restart the application',
            'Clear cache and retry',
            'Check server status',
            'Update to latest version',
          ],
          technicalDetails: [
            'Error Code: SYNC_002',
            'Protocol: HTTPS/REST API',
            'Timeout: 30 seconds',
            'Retry: Exponential backoff',
          ],
        };
      case 'health_monitoring':
        return {
          title: 'Health Monitoring Error',
          description: 'Unable to start health monitoring session',
          icon: '💓',
          color: '#E74C3C',
          suggestions: [
            'Ensure device is properly connected',
            'Check sensor calibration',
            'Verify device permissions',
            'Restart monitoring session',
          ],
          troubleshooting: [
            'Reconnect the device',
            'Check sensor placement',
            'Update device firmware',
            'Reset device settings',
          ],
          technicalDetails: [
            'Error Code: HEALTH_003',
            'Sensors: Heart rate, SpO2, Temperature',
            'Sample Rate: 1Hz default',
            'Accuracy: ±2 BPM',
          ],
        };
      case 'performance_tracking':
        return {
          title: 'Performance Tracking Error',
          description: 'Failed to initialize performance tracking',
          icon: '⚡',
          color: '#F39C12',
          suggestions: [
            'Check device compatibility',
            'Ensure sufficient battery',
            'Verify tracking permissions',
            'Calibrate performance sensors',
          ],
          troubleshooting: [
            'Restart performance tracking',
            'Check sensor status',
            'Update tracking algorithms',
            'Reset baseline metrics',
          ],
          technicalDetails: [
            'Error Code: PERF_004',
            'Metrics: Energy, Focus, Productivity',
            'Update Rate: Real-time',
            'Latency: <100ms target',
          ],
        };
      case 'wellness_program':
        return {
          title: 'Wellness Program Error',
          description: 'Unable to load or start wellness program',
          icon: '🌿',
          color: '#27AE60',
          suggestions: [
            'Check program availability',
            'Verify subscription status',
            'Update wellness preferences',
            'Refresh program data',
          ],
          troubleshooting: [
            'Clear program cache',
            'Re-sync wellness data',
            'Check program compatibility',
            'Contact support if needed',
          ],
          technicalDetails: [
            'Error Code: WELLNESS_005',
            'Programs: Exercise, Nutrition, Mental Health',
            'Duration: 4-12 weeks typical',
            'Updates: Weekly recommendations',
          ],
        };
      case 'optimization':
        return {
          title: 'Optimization Error',
          description: 'Failed to generate optimization recommendations',
          icon: '🎯',
          color: '#E67E22',
          suggestions: [
            'Ensure sufficient data collected',
            'Check data quality and completeness',
            'Verify optimization settings',
            'Allow more time for analysis',
          ],
          troubleshooting: [
            'Collect more biometric data',
            'Check data synchronization',
            'Update optimization models',
            'Reset optimization parameters',
          ],
          technicalDetails: [
            'Error Code: OPT_006',
            'Algorithm: Machine Learning',
            'Data Required: 7 days minimum',
            'Processing: Cloud-based',
          ],
        };
      case 'calibration':
        return {
          title: 'Device Calibration Error',
          description: 'Failed to calibrate biometric device',
          icon: '🔧',
          color: '#95A5A6',
          suggestions: [
            'Ensure device is properly positioned',
            'Follow calibration instructions carefully',
            'Check environmental conditions',
            'Allow sufficient warm-up time',
          ],
          troubleshooting: [
            'Restart calibration process',
            'Check device placement',
            'Minimize movement during calibration',
            'Update device firmware',
          ],
          technicalDetails: [
            'Error Code: CAL_007',
            'Duration: 2-5 minutes typical',
            'Environment: Stable conditions required',
            'Accuracy: ±1% target',
          ],
        };
      case 'authentication':
        return {
          title: 'Authentication Error',
          description: 'Unable to authenticate with biometric services',
          icon: '🔐',
          color: '#E74C3C',
          suggestions: [
            'Check login credentials',
            'Verify subscription status',
            'Ensure account is active',
            'Update authentication tokens',
          ],
          troubleshooting: [
            'Log out and log back in',
            'Clear authentication cache',
            'Check account status',
            'Contact support if needed',
          ],
          technicalDetails: [
            'Error Code: AUTH_008',
            'Method: OAuth 2.0 / JWT',
            'Token Expiry: 24 hours',
            'Security: End-to-end encryption',
          ],
        };
      case 'network':
        return {
          title: 'Network Error',
          description: 'Unable to connect to biometric services',
          icon: '🌐',
          color: '#F39C12',
          suggestions: [
            'Check internet connection',
            'Verify network configuration',
            'Try different network',
            'Check firewall settings',
          ],
          troubleshooting: [
            'Restart network connection',
            'Check DNS settings',
            'Disable VPN temporarily',
            'Contact network administrator',
          ],
          technicalDetails: [
            'Error Code: NET_009',
            'Protocol: HTTPS/WSS',
            'Ports: 443, 8080',
            'Timeout: 30 seconds',
          ],
        };
      default:
        return {
          title: 'Unknown Error',
          description: 'An unexpected error occurred',
          icon: '⚠️',
          color: '#7F8C8D',
          suggestions: [
            'Restart the application',
            'Check for updates',
            'Contact support',
            'Try again later',
          ],
          troubleshooting: [
            'Clear application cache',
            'Restart device',
            'Check system status',
            'Report the issue',
          ],
          technicalDetails: [
            'Error Code: UNKNOWN_010',
            'System: Biometric Optimization',
            'Version: Latest',
            'Status: Investigating',
          ],
        };
    }
  };

  const errorInfo = getErrorInfo();
  const errorMessage = typeof error === 'string' ? error : error?.message || 'Unknown error occurred';
  const canRetry = retryCount < maxRetries;
  const retryProgress = (retryCount / maxRetries) * 100;

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Main Error Card */}
      <Card style={styles.mainCard}>
        <View style={styles.errorHeader}>
          <Text style={styles.errorIcon}>{errorInfo.icon}</Text>
          <View style={styles.errorTitleContainer}>
            <Text style={styles.errorTitle}>{errorInfo.title}</Text>
            <Badge text={errorType.replace('_', ' ').toUpperCase()} variant="danger" />
          </View>
        </View>

        <Text style={styles.errorDescription}>{errorInfo.description}</Text>
        
        {/* Error Message */}
        <View style={styles.errorMessageContainer}>
          <Text style={styles.errorMessage}>{errorMessage}</Text>
        </View>

        {/* Retry Progress */}
        {maxRetries > 1 && (
          <View style={styles.retryProgressContainer}>
            <Text style={styles.retryProgressText}>
              Retry attempts: {retryCount}/{maxRetries}
            </Text>
            <ProgressBar 
              progress={retryProgress} 
              color={errorInfo.color}
            />
          </View>
        )}

        {/* Action Buttons */}
        <View style={styles.actionsContainer}>
          {canRetry && onRetry && (
            <Button
              title="Retry"
              onPress={onRetry}
              variant="primary"
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
      </Card>

      {/* Suggestions Card */}
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
            {errorInfo.suggestions.map((suggestion, index) => (
              <View key={index} style={styles.suggestionItem}>
                <Text style={styles.suggestionNumber}>{index + 1}</Text>
                <Text style={styles.suggestionText}>{suggestion}</Text>
              </View>
            ))}
          </View>
        )}
      </Card>

      {/* Troubleshooting Card */}
      <Card style={styles.troubleshootingCard}>
        <TouchableOpacity
          style={styles.sectionHeader}
          onPress={() => toggleSection('troubleshooting')}
        >
          <Text style={styles.sectionTitle}>🔧 Troubleshooting</Text>
          <Text style={styles.expandIcon}>
            {expandedSection === 'troubleshooting' ? '▼' : '▶'}
          </Text>
        </TouchableOpacity>
        
        {expandedSection === 'troubleshooting' && (
          <View style={styles.troubleshootingList}>
            {errorInfo.troubleshooting.map((step, index) => (
              <View key={index} style={styles.troubleshootingItem}>
                <Text style={styles.troubleshootingBullet}>•</Text>
                <Text style={styles.troubleshootingText}>{step}</Text>
              </View>
            ))}
          </View>
        )}
      </Card>

      {/* Technical Details Card */}
      <Card style={styles.technicalCard}>
        <TouchableOpacity
          style={styles.sectionHeader}
          onPress={() => toggleSection('technical')}
        >
          <Text style={styles.sectionTitle}>📊 Technical Details</Text>
          <Text style={styles.expandIcon}>
            {expandedSection === 'technical' ? '▼' : '▶'}
          </Text>
        </TouchableOpacity>
        
        {expandedSection === 'technical' && (
          <View style={styles.technicalList}>
            {errorInfo.technicalDetails.map((detail, index) => (
              <View key={index} style={styles.technicalItem}>
                <Text style={styles.technicalText}>{detail}</Text>
              </View>
            ))}
          </View>
        )}
      </Card>

      {/* Device-Specific Tips */}
      {errorType === 'device_connection' && (
        <Card style={styles.tipsCard}>
          <Text style={styles.tipsTitle}>📱 Device-Specific Tips</Text>
          <View style={styles.tipsList}>
            <View style={styles.tipItem}>
              <Text style={styles.tipCategory}>Heart Rate Monitor</Text>
              <Text style={styles.tipText}>Ensure snug fit on wrist or finger</Text>
            </View>
            <View style={styles.tipItem}>
              <Text style={styles.tipCategory}>Sleep Tracker</Text>
              <Text style={styles.tipText}>Wear consistently during sleep hours</Text>
            </View>
            <View style={styles.tipItem}>
              <Text style={styles.tipCategory}>Activity Tracker</Text>
              <Text style={styles.tipText}>Check movement detection settings</Text>
            </View>
            <View style={styles.tipItem}>
              <Text style={styles.tipCategory}>Stress Monitor</Text>
              <Text style={styles.tipText}>Calm environment for accurate readings</Text>
            </View>
          </View>
        </Card>
      )}

      {/* System Status */}
      <Card style={styles.statusCard}>
        <Text style={styles.statusTitle}>📡 System Status</Text>
        <View style={styles.statusList}>
          <View style={styles.statusItem}>
            <View style={[styles.statusIndicator, styles.activeStatus]} />
            <Text style={styles.statusText}>Biometric Sensors</Text>
          </View>
          <View style={styles.statusItem}>
            <View style={[styles.statusIndicator, styles.errorStatus]} />
            <Text style={styles.statusText}>Device Connection</Text>
          </View>
          <View style={styles.statusItem}>
            <View style={[styles.statusIndicator, styles.activeStatus]} />
            <Text style={styles.statusText}>Data Processing</Text>
          </View>
          <View style={styles.statusItem}>
            <View style={[styles.statusIndicator, styles.warningStatus]} />
            <Text style={styles.statusText}>Cloud Services</Text>
          </View>
        </View>
      </Card>

      {/* Support Options */}
      <Card style={styles.supportCard}>
        <Text style={styles.supportTitle}>🆘 Support Options</Text>
        <View style={styles.supportOptions}>
          <Button
            title="View Help Center"
            onPress={() => {}}
            variant="secondary"
            style={styles.supportButton}
          />
          <Button
            title="Contact Support"
            onPress={() => {}}
            variant="secondary"
            style={styles.supportButton}
          />
          <Button
            title="Report Issue"
            onPress={() => {}}
            variant="secondary"
            style={styles.supportButton}
          />
        </View>
      </Card>

      {/* Common Issues */}
      <Card style={styles.issuesCard}>
        <Text style={styles.issuesTitle}>🔍 Common Issues</Text>
        <View style={styles.issuesList}>
          <View style={styles.issueItem}>
            <Text style={styles.issueTitle}>Bluetooth Not Working</Text>
            <Text style={styles.issueSolution}>Enable Bluetooth and restart device</Text>
          </View>
          <View style={styles.issueItem}>
            <Text style={styles.issueTitle}>Device Not Found</Text>
            <Text style={styles.issueSolution}>Check device is powered on and in range</Text>
          </View>
          <View style={styles.issueItem}>
            <Text style={styles.issueTitle}>Data Not Syncing</Text>
            <Text style={styles.issueSolution}>Check internet connection and try manual sync</Text>
          </View>
          <View style={styles.issueItem}>
            <Text style={styles.issueTitle}>Inaccurate Readings</Text>
            <Text style={styles.issueSolution}>Recalibrate device and check placement</Text>
          </View>
        </View>
      </Card>
    </ScrollView>
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
  errorHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  errorIcon: {
    fontSize: 32,
    marginRight: 16,
  },
  errorTitleContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#2C3E50',
    flex: 1,
  },
  errorDescription: {
    fontSize: 16,
    color: '#7F8C8D',
    marginBottom: 16,
    lineHeight: 24,
  },
  errorMessageContainer: {
    backgroundColor: '#FDEDEC',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  errorMessage: {
    fontSize: 14,
    color: '#E74C3C',
    fontFamily: 'monospace',
  },
  retryProgressContainer: {
    marginBottom: 16,
  },
  retryProgressText: {
    fontSize: 14,
    color: '#7F8C8D',
    marginBottom: 8,
  },
  actionsContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  retryButton: {
    flex: 1,
  },
  dismissButton: {
    flex: 1,
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
    fontSize: 18,
    fontWeight: '600',
    color: '#2C3E50',
  },
  expandIcon: {
    fontSize: 16,
    color: '#7F8C8D',
  },
  suggestionsList: {
    gap: 12,
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 12,
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
  },
  suggestionNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#3498DB',
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 24,
    marginRight: 12,
  },
  suggestionText: {
    fontSize: 14,
    color: '#2C3E50',
    flex: 1,
    lineHeight: 20,
  },
  troubleshootingCard: {
    padding: 16,
    marginBottom: 16,
  },
  troubleshootingList: {
    gap: 8,
  },
  troubleshootingItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 8,
  },
  troubleshootingBullet: {
    fontSize: 16,
    color: '#F39C12',
    marginRight: 8,
    marginTop: 2,
  },
  troubleshootingText: {
    fontSize: 14,
    color: '#2C3E50',
    flex: 1,
    lineHeight: 20,
  },
  technicalCard: {
    padding: 16,
    marginBottom: 16,
  },
  technicalList: {
    gap: 8,
  },
  technicalItem: {
    padding: 8,
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
  },
  technicalText: {
    fontSize: 12,
    color: '#7F8C8D',
    fontFamily: 'monospace',
  },
  tipsCard: {
    padding: 16,
    marginBottom: 16,
  },
  tipsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 16,
  },
  tipsList: {
    gap: 12,
  },
  tipItem: {
    padding: 12,
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
  },
  tipCategory: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 4,
  },
  tipText: {
    fontSize: 13,
    color: '#7F8C8D',
  },
  statusCard: {
    padding: 16,
    marginBottom: 16,
  },
  statusTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 16,
  },
  statusList: {
    gap: 8,
  },
  statusItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  activeStatus: {
    backgroundColor: '#27AE60',
  },
  errorStatus: {
    backgroundColor: '#E74C3C',
  },
  warningStatus: {
    backgroundColor: '#F39C12',
  },
  statusText: {
    fontSize: 14,
    color: '#7F8C8D',
  },
  supportCard: {
    padding: 16,
    marginBottom: 16,
  },
  supportTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 16,
  },
  supportOptions: {
    gap: 8,
  },
  supportButton: {
    marginBottom: 8,
  },
  issuesCard: {
    padding: 16,
    marginBottom: 16,
  },
  issuesTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 16,
  },
  issuesList: {
    gap: 12,
  },
  issueItem: {
    padding: 12,
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
  },
  issueTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 4,
  },
  issueSolution: {
    fontSize: 13,
    color: '#7F8C8D',
  },
});
