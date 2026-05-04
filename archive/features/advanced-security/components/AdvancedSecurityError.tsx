/**
 * Advanced Security Error Component
 * 
 * Error handling UI for advanced security features with detailed messages,
 * retry functionality, suggestions, technical details, troubleshooting steps,
 * security-specific tips, system status, and support options.
 */

import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Animated } from 'react-native';
import { Card } from '../../../components/primitives/Card';
import { Button } from '../../../components/primitives/Button';
import { Badge } from '../../../components/primitives/Badge';

interface AdvancedSecurityErrorProps {
  error?: string;
  errorType?: 'threat_detection' | 'vulnerability_scanning' | 'compliance_monitoring' | 'incident_response' | 'security_monitoring' | 'data_persistence' | 'authentication' | 'network' | 'unknown';
  onRetry?: () => void;
  onDismiss?: () => void;
  onContactSupport?: () => void;
}

export function AdvancedSecurityError({
  error = 'An unexpected error occurred while loading security systems.',
  errorType = 'unknown',
  onRetry,
  onDismiss,
  onContactSupport,
}: AdvancedSecurityErrorProps) {
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
      threat_detection: {
        title: 'Threat Detection Failed',
        message: 'Unable to initialize threat detection systems. Please check security service status.',
        suggestions: [
          'Verify your internet connection for security service access',
          'Check if threat detection servers are accessible',
          'Try refreshing the threat detection manually',
          'Check if you have security monitoring permissions',
        ],
        troubleshooting: [
          'Threat detection may be temporarily disabled during maintenance',
          'Check if security database servers are operational',
          'Try accessing specific threat types directly',
          'Contact support if threat data appears corrupted',
        ],
        tips: [
          'Threat detection monitors for malware, phishing, and unauthorized access',
          'Real-time scanning requires stable network connection',
          'Threat databases update regularly for latest protection',
          'False positives can be reported to improve detection accuracy',
        ],
      },
      vulnerability_scanning: {
        title: 'Vulnerability Scanning Failed',
        message: 'Unable to perform vulnerability scanning. The scanning engine may be temporarily unavailable.',
        suggestions: [
          'Check your network connection for vulnerability database access',
          'Verify vulnerability scanning servers are online',
          'Try initiating scan manually',
          'Check if you have vulnerability assessment permissions',
        ],
        troubleshooting: [
          'Vulnerability scanning may be temporarily unavailable during updates',
          'Check if CVE database servers are operational',
          'Try scanning specific system components directly',
          'Contact support if vulnerability data appears corrupted',
        ],
        tips: [
          'Vulnerability scanning checks for software weaknesses and misconfigurations',
          'CVSS scores help prioritize critical vulnerabilities',
          'Regular scanning helps maintain security posture',
          'Patch management reduces attack surface significantly',
        ],
      },
      compliance_monitoring: {
        title: 'Compliance Monitoring Failed',
        message: 'Unable to load compliance frameworks. The compliance system may be experiencing issues.',
        suggestions: [
          'Check your network connection for compliance API access',
          'Verify compliance database servers are accessible',
          'Try loading compliance frameworks manually',
          'Check if you have compliance monitoring permissions',
        ],
        troubleshooting: [
          'Compliance data may be temporarily unavailable during maintenance',
          'Check if compliance calculation system is operational',
          'Try accessing specific frameworks directly',
          'Contact support if compliance data appears corrupted',
        ],
        tips: [
          'Compliance monitoring tracks adherence to security standards',
          'Multiple frameworks (ISO 27001, SOC2, GDPR) are supported',
          'Compliance scores help identify security gaps',
          'Regular assessments ensure continuous compliance',
        ],
      },
      incident_response: {
        title: 'Incident Response Failed',
        message: 'Unable to load incident response systems. The response engine may be temporarily unavailable.',
        suggestions: [
          'Check your network connection for incident system access',
          'Verify incident response servers are accessible',
          'Try loading incident data manually',
          'Check if you have incident management permissions',
        ],
        troubleshooting: [
          'Incident response may be temporarily disabled during maintenance',
          'Check if incident database servers are operational',
          'Try accessing specific incident types directly',
          'Contact support if incident data appears corrupted',
        ],
        tips: [
          'Incident response provides structured approach to security events',
          'MTTR (Mean Time to Resolve) measures response effectiveness',
          'Automated workflows speed up incident handling',
          'Post-incident reviews improve future response',
        ],
      },
      security_monitoring: {
        title: 'Security Monitoring Failed',
        message: 'Unable to establish security monitoring. The monitoring system may be experiencing issues.',
        suggestions: [
          'Check your network connection for monitoring service access',
          'Verify monitoring infrastructure is accessible',
          'Try starting monitoring manually',
          'Check if you have security monitoring permissions',
        ],
        troubleshooting: [
          'Security monitoring may be temporarily disabled during updates',
          'Check if monitoring agents are operational',
          'Try accessing specific monitoring metrics directly',
          'Contact support if monitoring data appears corrupted',
        ],
        tips: [
          'Security monitoring provides real-time visibility into threats',
          'Alert systems notify of critical security events',
          'Log analysis helps detect suspicious patterns',
          'Continuous monitoring ensures early threat detection',
        ],
      },
      data_persistence: {
        title: 'Data Persistence Failed',
        message: 'Unable to save or load security data. Please check storage system status.',
        suggestions: [
          'Check your internet connection for security data storage access',
          'Verify cloud storage servers are accessible',
          'Try saving security data manually',
          'Check if you have sufficient storage space',
        ],
        troubleshooting: [
          'Security data persistence may be temporarily disabled during maintenance',
          'Check if cloud storage system is operational',
          'Try using local storage as backup',
          'Contact support if security data appears lost or corrupted',
        ],
        tips: [
          'Security data persistence maintains threat and incident history',
          'Audit logs require reliable storage for compliance',
          'Backup systems ensure data recovery capability',
          'Data retention policies govern storage duration',
        ],
      },
      authentication: {
        title: 'Authentication Failed',
        message: 'Unable to authenticate with security services.',
        suggestions: [
          'Verify your security credentials are correct',
          'Check if your account has security access permissions',
          'Try logging out and logging back in',
          'Reset your security password if needed',
        ],
        troubleshooting: [
          'Security account may be temporarily locked due to failed attempts',
          'Check if your security subscription is active and not expired',
          'Verify two-factor authentication is working properly',
          'Contact support if security account appears compromised',
        ],
        tips: [
          'Security authentication ensures only authorized access to systems',
          'Multi-factor authentication provides additional protection',
          'Session timeouts protect against unauthorized access',
          'Security audit logs track all authentication attempts',
        ],
      },
      network: {
        title: 'Network Connection Failed',
        message: 'Unable to connect to security service servers.',
        suggestions: [
          'Check your internet connection is stable and secure',
          'Verify firewall settings allow security service access',
          'Try connecting from a different secure network',
          'Check if security services are experiencing outages',
        ],
        troubleshooting: [
          'Security services may have regional server maintenance',
          'Check service status pages for known security outages',
          'Try using VPN if regional security restrictions apply',
          'Contact your IT department if connection issues persist',
        ],
        tips: [
          'Security services use encrypted connections for data protection',
          'Multiple server locations ensure high availability',
          'Automatic failover switches to backup security servers',
          'Network optimization improves security scanning speeds',
        ],
      },
      unknown: {
        title: 'Unexpected Security Error',
        message: 'An unexpected error occurred in the security system.',
        suggestions: [
          'Refresh the security dashboard and try again',
          'Check your internet connection and security settings',
          'Verify your security account is in good standing',
          'Try accessing from a different secure browser',
        ],
        troubleshooting: [
          'Clear security cache and cookies',
          'Disable security browser extensions temporarily',
          'Check if security browser is up to date',
          'Contact security support if error persists',
        ],
        tips: [
          'Security systems can experience temporary issues',
          'Security status pages provide real-time service information',
          'Security interface refresh resolves many common issues',
          'Security support teams assist with persistent problems',
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
            <Text style={styles.errorIcon}>🚨</Text>
            <Text style={styles.errorTitle}>{content.title}</Text>
          </View>
          <Text style={styles.errorMessage}>{error}</Text>
          <Text style={styles.errorDescription}>{content.message}</Text>

          {/* Action Buttons */}
          <View style={styles.actionContainer}>
            {onRetry && (
              <Button
                title="Retry Security Check"
                onPress={onRetry}
                variant="primary"
                style={styles.retryButton}
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

        {/* Security Tips */}
        <Card style={styles.tipsCard}>
          <TouchableOpacity
            style={styles.sectionHeader}
            onPress={() => toggleSection('tips')}
          >
            <Text style={styles.sectionTitle}>🛡️ Security Tips</Text>
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
          <Text style={styles.statusTitle}>🖥️ Security System Status</Text>
          <View style={styles.statusGrid}>
            <View style={styles.statusItem}>
              <Text style={styles.statusLabel}>Security Core:</Text>
              <Badge text="Online" variant="success" />
            </View>
            <View style={styles.statusItem}>
              <Text style={styles.statusLabel}>Threat Engine:</Text>
              <Badge text="Operational" variant="success" />
            </View>
            <View style={styles.statusItem}>
              <Text style={styles.statusLabel}>Compliance:</Text>
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
          <Text style={styles.supportTitle}>📞 Security Support Options</Text>
          <View style={styles.supportOptions}>
            <View style={styles.supportOption}>
              <Text style={styles.supportOptionTitle}>Security Help Center</Text>
              <Text style={styles.supportOptionDescription}>
                Browse comprehensive security guides and troubleshooting articles
              </Text>
            </View>
            <View style={styles.supportOption}>
              <Text style={styles.supportOptionTitle}>Security Live Chat</Text>
              <Text style={styles.supportOptionDescription}>
                Get instant help from our security support team
              </Text>
            </View>
            <View style={styles.supportOption}>
              <Text style={styles.supportOptionTitle}>Security Email Support</Text>
              <Text style={styles.supportOptionDescription}>
                Contact our security specialists for personalized assistance
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
                Security System Version: v2.1.0
              </Text>
              <Text style={styles.detailText}>
                Session ID: SEC-{Math.random().toString(36).substr(2, 9).toUpperCase()}
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
    color: '#E74C3C',
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
