/**
 * Life Simulation Error Component
 * 
 * Error handling UI for life simulation features with detailed messages,
 * retry functionality, suggestions, technical details, troubleshooting steps,
 * life simulation-specific tips, system status, and support options.
 */

import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Animated } from 'react-native';
import { Card } from '../../../components/primitives/Card';
import { Button } from '../../../components/primitives/Button';
import { Badge } from '../../../components/primitives/Badge';

interface LifeSimulationErrorProps {
  error?: string;
  errorType?: 'avatar_loading' | 'life_event_generation' | 'career_processing' | 'relationship_management' | 'achievement_tracking' | 'data_persistence' | 'authentication' | 'network' | 'unknown';
  onRetry?: () => void;
  onDismiss?: () => void;
  onContactSupport?: () => void;
}

export function LifeSimulationError({
  error = 'An unexpected error occurred while loading life simulation data.',
  errorType = 'unknown',
  onRetry,
  onDismiss,
  onContactSupport,
}: LifeSimulationErrorProps) {
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
      avatar_loading: {
        title: 'Avatar Loading Failed',
        message: 'Unable to load avatar data. Please check your connection and try again.',
        suggestions: [
          'Verify your internet connection is stable',
          'Check if avatar servers are accessible',
          'Try refreshing the avatar data manually',
          'Clear browser cache and reload the page',
        ],
        troubleshooting: [
          'Wait a few minutes and try again (server might be busy)',
          'Check if you have sufficient permissions to access avatar data',
          'Verify your account is in good standing',
          'Try accessing from a different network or device',
        ],
        tips: [
          'Avatar data includes appearance, personality traits, and skills',
          'Large avatar files may take longer to load on slower connections',
          'Avatar customization options update automatically',
          'Premium users get access to exclusive avatar features',
        ],
      },
      life_event_generation: {
        title: 'Life Event Generation Failed',
        message: 'Unable to generate life events. The event system may be temporarily unavailable.',
        suggestions: [
          'Check your network connection for event system access',
          'Verify event generation servers are online',
          'Try generating events manually',
          'Check if you have event generation permissions',
        ],
        troubleshooting: [
          'Event generation may be temporarily disabled during maintenance',
          'Check if event database servers are operational',
          'Try accessing specific event types directly',
          'Contact support if event data appears corrupted',
        ],
        tips: [
          'Life events are generated based on your avatar attributes and choices',
          'Event frequency increases with avatar age and experience',
          'Major life events have significant impact on avatar development',
          'Event choices affect career, relationships, and life statistics',
        ],
      },
      career_processing: {
        title: 'Career Processing Failed',
        message: 'Unable to process career information. Please check career system status.',
        suggestions: [
          'Verify your internet connection for career data access',
          'Check if career servers are accessible',
          'Try loading career information manually',
          'Verify your account has career system permissions',
        ],
        troubleshooting: [
          'Career data may be temporarily unavailable during updates',
          'Check if career progression system is operational',
          'Try accessing specific career paths directly',
          'Contact support if career data appears corrupted',
        ],
        tips: [
          'Career progression requires experience and skill development',
          'Multiple career paths are available based on avatar attributes',
          'Career changes impact life statistics and relationships',
          'Advanced careers require specific education and experience',
        ],
      },
      relationship_management: {
        title: 'Relationship Management Failed',
        message: 'Unable to load relationship data. The relationship system may be experiencing issues.',
        suggestions: [
          'Check your network connection for relationship system access',
          'Verify relationship database servers are online',
          'Try loading relationship data manually',
          'Check if you have relationship management permissions',
        ],
        troubleshooting: [
          'Relationship data may be temporarily unavailable during maintenance',
          'Check if relationship AI system is operational',
          'Try accessing specific relationship types directly',
          'Contact support if relationship data appears corrupted',
        ],
        tips: [
          'Relationships develop based on social interactions and events',
          'Relationship quality affects avatar happiness and social stats',
          'Different relationship types have unique requirements and benefits',
          'Relationship maintenance requires regular interaction and attention',
        ],
      },
      achievement_tracking: {
        title: 'Achievement Tracking Failed',
        message: 'Unable to load achievement data. The achievement system may be temporarily unavailable.',
        suggestions: [
          'Check your network connection for achievement system access',
          'Verify achievement database servers are online',
          'Try loading achievement data manually',
          'Check if you have achievement tracking permissions',
        ],
        troubleshooting: [
          'Achievement data may be temporarily unavailable during updates',
          'Check if achievement calculation system is operational',
          'Try accessing specific achievement categories directly',
          'Contact support if achievement data appears corrupted',
        ],
        tips: [
          'Achievements unlock based on specific life milestones and actions',
          'Achievement progress is tracked automatically in real-time',
          'Completed achievements provide rewards and stat bonuses',
          'Hidden achievements require special actions to discover',
        ],
      },
      data_persistence: {
        title: 'Data Persistence Failed',
        message: 'Unable to save or load life simulation data. Please check storage system status.',
        suggestions: [
          'Check your internet connection for data storage access',
          'Verify cloud storage servers are accessible',
          'Try saving data manually',
          'Check if you have sufficient storage space',
        ],
        troubleshooting: [
          'Data persistence may be temporarily disabled during maintenance',
          'Check if cloud storage system is operational',
          'Try using local storage as backup',
          'Contact support if data appears lost or corrupted',
        ],
        tips: [
          'Life simulation data is automatically saved at key milestones',
          'Manual save options are available for important moments',
          'Cloud storage provides backup across multiple devices',
          'Data includes avatar, events, career, and relationship information',
        ],
      },
      authentication: {
        title: 'Authentication Failed',
        message: 'Unable to authenticate with life simulation services.',
        suggestions: [
          'Verify your login credentials are correct',
          'Check if your account is active and in good standing',
          'Try logging out and logging back in',
          'Reset your password if needed',
        ],
        troubleshooting: [
          'Account may be temporarily locked due to security concerns',
          'Check if your subscription is active and not expired',
          'Verify two-factor authentication is working properly',
          'Contact support if account appears compromised',
        ],
        tips: [
          'Authentication ensures your life simulation data remains private',
          'Session timeouts protect against unauthorized access',
          'Account activity logs help monitor suspicious behavior',
          'Premium accounts have enhanced security features',
        ],
      },
      network: {
        title: 'Network Connection Failed',
        message: 'Unable to connect to life simulation servers.',
        suggestions: [
          'Check your internet connection is stable',
          'Verify firewall settings allow simulation access',
          'Try connecting from a different network',
          'Check if simulation services are experiencing outages',
        ],
        troubleshooting: [
          'Life simulation may have regional server maintenance',
          'Check service status pages for known outages',
          'Try using VPN if regional restrictions apply',
          'Contact your ISP if connection issues persist',
        ],
        tips: [
          'Life simulation uses CDN for fast worldwide access',
          'Multiple server locations ensure high availability',
          'Automatic failover switches to backup servers during outages',
          'Network optimization improves loading speeds globally',
        ],
      },
      unknown: {
        title: 'Unexpected Error',
        message: 'An unexpected error occurred in the life simulation system.',
        suggestions: [
          'Refresh the page and try again',
          'Check your internet connection',
          'Verify your account is in good standing',
          'Try accessing from a different browser',
        ],
        troubleshooting: [
          'Clear browser cache and cookies',
          'Disable browser extensions temporarily',
          'Check if browser is up to date',
          'Contact support if error persists',
        ],
        tips: [
          'Life simulation systems can experience temporary issues',
          'System status pages provide real-time service information',
          'Interface refresh resolves many common issues',
          'Support teams can assist with persistent problems',
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

        {/* Life Simulation Tips */}
        <Card style={styles.tipsCard}>
          <TouchableOpacity
            style={styles.sectionHeader}
            onPress={() => toggleSection('tips')}
          >
            <Text style={styles.sectionTitle}>🎭 Life Simulation Tips</Text>
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
              <Text style={styles.statusLabel}>Life Simulation:</Text>
              <Badge text="Online" variant="success" />
            </View>
            <View style={styles.statusItem}>
              <Text style={styles.statusLabel}>Avatar System:</Text>
              <Badge text="Operational" variant="success" />
            </View>
            <View style={styles.statusItem}>
              <Text style={styles.statusLabel}>Event Generator:</Text>
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
              <Text style={styles.supportOptionTitle}>Help Center</Text>
              <Text style={styles.supportOptionDescription}>
                Browse comprehensive life simulation guides and tutorials
              </Text>
            </View>
            <View style={styles.supportOption}>
              <Text style={styles.supportOptionTitle}>Live Chat</Text>
              <Text style={styles.supportOptionDescription}>
                Get instant help from our support team
              </Text>
            </View>
            <View style={styles.supportOption}>
              <Text style={styles.supportOptionTitle}>Email Support</Text>
              <Text style={styles.supportOptionDescription}>
                Contact our life simulation specialists for personalized help
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
                User Agent: Life Simulation System v1.0
              </Text>
              <Text style={styles.detailText}>
                Session ID: LIFE-{Math.random().toString(36).substr(2, 9).toUpperCase()}
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
    color: '#9B59B6',
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
