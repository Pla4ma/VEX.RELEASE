/**
 * Global Marketplace Error Component
 * 
 * Error handling UI for global marketplace features with detailed messages,
 * retry functionality, suggestions, technical details, troubleshooting steps,
 * marketplace-specific tips, system status, and support options.
 */

import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Animated } from 'react-native';
import { Card } from '../../../components/primitives/Card';
import { Button } from '../../../components/primitives/Button';
import { Badge } from '../../../components/primitives/Badge';

interface GlobalMarketplaceErrorProps {
  error?: string;
  errorType?: 'product_loading' | 'vendor_loading' | 'transaction_processing' | 'payment_gateway' | 'shipping_api' | 'currency_exchange' | 'inventory_sync' | 'authentication' | 'network' | 'unknown';
  onRetry?: () => void;
  onDismiss?: () => void;
  onContactSupport?: () => void;
}

export function GlobalMarketplaceError({
  error = 'An unexpected error occurred while loading global marketplace data.',
  errorType = 'unknown',
  onRetry,
  onDismiss,
  onContactSupport,
}: GlobalMarketplaceErrorProps) {
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
      product_loading: {
        title: 'Product Loading Failed',
        message: 'Unable to load product catalog. Please check your connection and try again.',
        suggestions: [
          'Verify your internet connection is stable',
          'Check if marketplace servers are accessible',
          'Try refreshing the product catalog manually',
          'Clear browser cache and reload the page',
        ],
        troubleshooting: [
          'Wait a few minutes and try again (server might be busy)',
          'Check if you have sufficient permissions to view products',
          'Verify your account is in good standing',
          'Try accessing from a different network or device',
        ],
        tips: [
          'Product catalog refreshes automatically every 30 minutes',
          'Large catalogs may take longer to load on slower connections',
          'Premium users get priority access to product updates',
          'Filtering products can reduce loading time significantly',
        ],
      },
      vendor_loading: {
        title: 'Vendor Information Failed',
        message: 'Unable to load vendor details and verification status.',
        suggestions: [
          'Check your network connection for vendor data access',
          'Verify vendor database servers are online',
          'Try loading vendor information manually',
          'Check if you have vendor browsing permissions',
        ],
        troubleshooting: [
          'Some vendor data may be temporarily unavailable',
          'Check if vendor verification system is operational',
          'Try accessing specific vendor pages directly',
          'Contact support if vendor data appears corrupted',
        ],
        tips: [
          'Verified vendors show green badges for trustworthiness',
          'Vendor ratings update automatically based on customer feedback',
          'New vendors undergo verification before appearing in searches',
          'Premium vendors offer enhanced customer support and faster shipping',
        ],
      },
      transaction_processing: {
        title: 'Transaction Processing Failed',
        message: 'Unable to process marketplace transactions. Please check payment methods and try again.',
        suggestions: [
          'Verify your payment method is valid and has sufficient funds',
          'Check if payment gateway is accessible',
          'Try using a different payment method',
          'Verify your billing information is correct',
        ],
        troubleshooting: [
          'Some payment methods may be temporarily unavailable',
          'Check if transaction limits are affecting your purchase',
          'Verify your account has transaction permissions',
          'Contact your bank if payment is being declined',
        ],
        tips: [
          'Multiple payment methods are supported for flexibility',
          'Transaction processing typically completes within 30 seconds',
          'Large transactions may require additional verification',
          'Transaction history is available in your account dashboard',
        ],
      },
      payment_gateway: {
        title: 'Payment Gateway Error',
        message: 'Payment processing system is temporarily unavailable.',
        suggestions: [
          'Try again in a few minutes',
          'Use an alternative payment method',
          'Check if your bank is blocking the transaction',
          'Verify payment gateway servers are online',
        ],
        troubleshooting: [
          'Payment gateways can experience high traffic during peak hours',
          'Some regions may have temporary payment restrictions',
          'Check if your payment method is supported in your region',
          'Try smaller transaction amounts to test connectivity',
        ],
        tips: [
          'Multiple payment gateways ensure redundancy and reliability',
          'Payment processing is encrypted and secure',
          'Failed payments are automatically refunded within 24 hours',
          'Premium users get priority payment processing',
        ],
      },
      shipping_api: {
        title: 'Shipping API Error',
        message: 'Unable to connect to shipping and tracking services.',
        suggestions: [
          'Check shipping service availability in your region',
          'Verify shipping address format is correct',
          'Try selecting different shipping options',
          'Check if shipping carriers are operational',
        ],
        troubleshooting: [
          'Some shipping carriers may have service disruptions',
          'International shipping may have temporary restrictions',
          'Check if shipping API rate limits have been exceeded',
          'Try updating shipping information manually',
        ],
        tips: [
          'Real-time tracking updates every 15 minutes',
          'Multiple shipping carriers provide delivery options',
          'Express shipping offers faster delivery at higher cost',
          'Free shipping is available for orders above certain thresholds',
        ],
      },
      currency_exchange: {
        title: 'Currency Exchange Error',
        message: 'Unable to update currency exchange rates.',
        suggestions: [
          'Check if exchange rate services are accessible',
          'Verify your currency settings are correct',
          'Try manually refreshing exchange rates',
          'Check if your selected currency is supported',
        ],
        troubleshooting: [
          'Exchange rate APIs may experience temporary delays',
          'Some currencies may have limited trading hours',
          'Check if financial markets are open for rate updates',
          'Try using a different base currency temporarily',
        ],
        tips: [
          'Exchange rates update every 5 minutes during market hours',
          'Multiple currency providers ensure accurate rate information',
          'Currency conversion fees may apply to international transactions',
          'Historical exchange rate data is available for reporting',
        ],
      },
      inventory_sync: {
        title: 'Inventory Sync Failed',
        message: 'Unable to synchronize product inventory data.',
        suggestions: [
          'Check inventory management system connectivity',
          'Verify product stock levels are accessible',
          'Try manual inventory synchronization',
          'Check if vendor inventory data is available',
        ],
        troubleshooting: [
          'Inventory updates may be delayed during high sales periods',
          'Some vendors may have inventory system limitations',
          'Check if product variants are properly configured',
          'Verify warehouse management system is operational',
        ],
        tips: [
          'Real-time inventory updates prevent overselling',
          'Low stock alerts notify vendors to replenish products',
          'Inventory data syncs across all sales channels',
          'Historical inventory data helps with demand forecasting',
        ],
      },
      authentication: {
        title: 'Authentication Failed',
        message: 'Unable to authenticate with marketplace services.',
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
          'Two-factor authentication enhances account security',
          'Session timeouts protect against unauthorized access',
          'Account activity logs help monitor suspicious behavior',
          'Premium accounts have enhanced security features',
        ],
      },
      network: {
        title: 'Network Connection Failed',
        message: 'Unable to connect to global marketplace servers.',
        suggestions: [
          'Check your internet connection is stable',
          'Verify firewall settings allow marketplace access',
          'Try connecting from a different network',
          'Check if marketplace services are experiencing outages',
        ],
        troubleshooting: [
          'Global marketplace may have regional server maintenance',
          'Check service status pages for known outages',
          'Try using VPN if regional restrictions apply',
          'Contact your ISP if connection issues persist',
        ],
        tips: [
          'Global marketplace uses CDN for fast worldwide access',
          'Multiple server locations ensure high availability',
          'Automatic failover switches to backup servers during outages',
          'Network optimization improves loading speeds globally',
        ],
      },
      unknown: {
        title: 'Unexpected Error',
        message: 'An unexpected error occurred in the marketplace system.',
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
          'Regular system maintenance ensures optimal performance',
          'Error logs help developers identify and fix issues quickly',
          'Backup systems prevent data loss during failures',
          'User feedback helps improve marketplace reliability',
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

        {/* Marketplace Tips */}
        <Card style={styles.tipsCard}>
          <TouchableOpacity
            style={styles.sectionHeader}
            onPress={() => toggleSection('tips')}
          >
            <Text style={styles.sectionTitle}>🛍️ Marketplace Tips</Text>
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
              <Text style={styles.statusLabel}>Marketplace:</Text>
              <Badge text="Online" variant="success" />
            </View>
            <View style={styles.statusItem}>
              <Text style={styles.statusLabel}>Product Catalog:</Text>
              <Badge text="Operational" variant="success" />
            </View>
            <View style={styles.statusItem}>
              <Text style={styles.statusLabel}>Payment Gateway:</Text>
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
                Browse comprehensive marketplace guides and tutorials
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
                Contact our marketplace specialists for personalized help
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
                User Agent: Global Marketplace System v1.0
              </Text>
              <Text style={styles.detailText}>
                Session ID: MKT-{Math.random().toString(36).substr(2, 9).toUpperCase()}
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
