/**
 * Global Marketplace Retry Component
 * 
 * Retry component for global marketplace operations with smart retry logic,
 * exponential backoff, retry progress, fallback options, alternative actions,
 * and marketplace-specific tips.
 */

import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { Card } from '../../../components/primitives/Card';
import { Button } from '../../../components/primitives/Button';
import { Badge } from '../../../components/primitives/Badge';
import { ProgressBar } from '../../../components/ProgressBar';

interface GlobalMarketplaceRetryProps {
  onRetry?: () => void;
  onDismiss?: () => void;
  errorType?: 'product_loading' | 'vendor_loading' | 'transaction_processing' | 'payment_gateway' | 'shipping_api' | 'currency_exchange' | 'inventory_sync' | 'authentication' | 'network' | 'unknown';
  retryCount?: number;
  maxRetries?: number;
  lastRetryTime?: Date;
  nextRetryTime?: Date;
  estimatedWaitTime?: number;
}

export function GlobalMarketplaceRetry({
  onRetry,
  onDismiss,
  errorType = 'unknown',
  retryCount = 0,
  maxRetries = 3,
  lastRetryTime,
  nextRetryTime,
  estimatedWaitTime = 5000,
}: GlobalMarketplaceRetryProps) {
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
      product_loading: {
        title: 'Retry Product Loading',
        message: 'Attempting to load product catalog with optimized parameters',
        fallbackActions: [
          { id: 'load_cache', title: 'Load Cached Products', description: 'Use locally cached product data' },
          { id: 'simplify_catalog', title: 'Simplify Catalog', description: 'Load basic product information only' },
          { id: 'change_region', title: 'Change Region', description: 'Try loading products from different region' },
        ],
        tips: [
          'Product catalogs can be large and may take time to load',
          'Cached products load faster but may not be up to date',
          'Regional servers may have different product availability',
          'Network speed affects catalog loading performance',
        ],
      },
      vendor_loading: {
        title: 'Retry Vendor Loading',
        message: 'Attempting to load vendor information with improved connectivity',
        fallbackActions: [
          { id: 'load_verified', title: 'Load Verified Vendors', description: 'Load only verified vendor profiles' },
          { id: 'basic_info', title: 'Basic Vendor Info', description: 'Load essential vendor details only' },
          { id: 'skip_ratings', title: 'Skip Ratings', description: 'Load vendor info without ratings' },
        ],
        tips: [
          'Vendor verification status affects loading speed',
          'Vendor ratings require additional API calls',
          'Basic vendor information loads faster than full profiles',
          'Vendor images may slow down loading on slow connections',
        ],
      },
      transaction_processing: {
        title: 'Retry Transaction Processing',
        message: 'Attempting to process transaction with enhanced security',
        fallbackActions: [
          { id: 'alternative_payment', title: 'Alternative Payment', description: 'Try different payment method' },
          { id: 'simplify_transaction', title: 'Simplify Transaction', description: 'Process with basic parameters' },
          { id: 'offline_mode', title: 'Offline Mode', description: 'Queue transaction for later processing' },
        ],
        tips: [
          'Transaction processing requires secure payment gateway connection',
          'Multiple payment methods provide backup options',
          'Transaction queuing ensures no data loss during outages',
          'Security verification adds processing time but protects data',
        ],
      },
      payment_gateway: {
        title: 'Retry Payment Gateway',
        message: 'Attempting to reconnect to payment processing services',
        fallbackActions: [
          { id: 'alternative_gateway', title: 'Alternative Gateway', description: 'Use backup payment processor' },
          { id: 'manual_payment', title: 'Manual Payment', description: 'Process payment manually' },
          { id: 'defer_payment', title: 'Defer Payment', description: 'Schedule payment for later' },
        ],
        tips: [
          'Payment gateways can experience high traffic during peak hours',
          'Multiple payment gateways ensure processing continuity',
          'Manual payment processing requires verification steps',
          'Payment deferral may affect order fulfillment timelines',
        ],
      },
      shipping_api: {
        title: 'Retry Shipping API',
        message: 'Attempting to reconnect to shipping and tracking services',
        fallbackActions: [
          { id: 'local_shipping', title: 'Local Shipping', description: 'Use domestic shipping providers' },
          { id: 'manual_tracking', title: 'Manual Tracking', description: 'Set up tracking manually' },
          { id: 'estimate_shipping', title: 'Estimate Only', description: 'Get shipping estimates only' },
        ],
        tips: [
          'Shipping APIs connect to multiple carrier services',
          'Local shipping providers may have better availability',
          'Manual tracking provides backup when automated systems fail',
          'Shipping estimates help customers understand delivery expectations',
        ],
      },
      currency_exchange: {
        title: 'Retry Currency Exchange',
        message: 'Attempting to update currency exchange rates from multiple sources',
        fallbackActions: [
          { id: 'cached_rates', title: 'Use Cached Rates', description: 'Use previously cached exchange rates' },
          { id: 'single_source', title: 'Single Source', description: 'Get rates from primary source only' },
          { id: 'manual_rates', title: 'Manual Rates', description: 'Set exchange rates manually' },
        ],
        tips: [
          'Exchange rates update frequently during market hours',
          'Multiple rate sources ensure accuracy and reliability',
          'Cached rates provide fallback when live data is unavailable',
          'Manual rate setting requires authorization and verification',
        ],
      },
      inventory_sync: {
        title: 'Retry Inventory Sync',
        message: 'Attempting to synchronize inventory data with enhanced reliability',
        fallbackActions: [
          { id: 'partial_sync', title: 'Partial Sync', description: 'Sync high-priority products only' },
          { id: 'manual_update', title: 'Manual Update', description: 'Update inventory manually' },
          { id: 'delayed_sync', title: 'Delayed Sync', description: 'Schedule sync for later' },
        ],
        tips: [
          'Inventory synchronization requires real-time data processing',
          'Partial sync ensures critical products remain available',
          'Manual inventory updates provide immediate control',
          'Delayed sync prevents system overload during peak periods',
        ],
      },
      authentication: {
        title: 'Retry Authentication',
        message: 'Attempting to authenticate with refreshed credentials',
        fallbackActions: [
          { id: 'refresh_token', title: 'Refresh Token', description: 'Generate new authentication token' },
          { id: 'alternative_auth', title: 'Alternative Auth', description: 'Use different authentication method' },
          { id: 'guest_mode', title: 'Guest Mode', description: 'Access limited features without authentication' },
        ],
        tips: [
          'Authentication tokens have expiration times for security',
          'Multiple authentication methods provide access flexibility',
          'Guest mode allows limited browsing without full access',
          'Security verification protects user data and accounts',
        ],
      },
      network: {
        title: 'Retry Network Connection',
        message: 'Attempting to reconnect to global marketplace servers',
        fallbackActions: [
          { id: 'offline_mode', title: 'Offline Mode', description: 'Work with cached data' },
          { id: 'alternative_server', title: 'Alternative Server', description: 'Connect to backup servers' },
          { id: 'reduced_data', title: 'Reduced Data', description: 'Load essential data only' },
        ],
        tips: [
          'Network connectivity affects all marketplace operations',
          'Offline mode provides limited functionality during outages',
          'Backup servers ensure service continuity',
          'Reduced data loading improves performance on poor connections',
        ],
      },
      unknown: {
        title: 'Retry Operation',
        message: 'Attempting to retry marketplace operation with default recovery strategy',
        fallbackActions: [
          { id: 'refresh_interface', title: 'Refresh Interface', description: 'Reload marketplace interface' },
          { id: 'check_status', title: 'Check Status', description: 'Verify system status' },
          { id: 'contact_support', title: 'Contact Support', description: 'Get help from support team' },
        ],
        tips: [
          'Marketplace systems can experience temporary issues',
          'System status pages provide real-time service information',
          'Interface refresh resolves many common issues',
          'Support teams can assist with persistent problems',
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
            color={canRetry ? '#9B59B6' : '#E74C3C'}
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
            <Text style={styles.statusLabel}>Marketplace:</Text>
            <Badge text="Online" variant="success" />
          </View>
          <View style={styles.statusItem}>
            <Text style={styles.statusLabel}>Payment Gateway:</Text>
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
    backgroundColor: '#9B59B6',
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
    color: '#9B59B6',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#7F8C8D',
    textAlign: 'center',
  },
});
