/**
 * Enterprise Analytics Empty Component
 * 
 * Empty state component for enterprise analytics when no data is available,
 * with helpful guidance and action prompts.
 */

import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { Button } from '../../../components/primitives/Button';

interface EnterpriseAnalyticsEmptyProps {
  type?: 'overview' | 'teams' | 'departments' | 'reports' | 'insights' | 'all';
  onAction?: () => void;
  customMessage?: string;
  customIcon?: string;
}

export function EnterpriseAnalyticsEmpty({ 
  type = 'all', 
  onAction,
  customMessage,
  customIcon 
}: EnterpriseAnalyticsEmptyProps) {
  const getEmptyState = () => {
    switch (type) {
      case 'overview':
        return {
          icon: customIcon || '📊',
          title: 'No Analytics Data Yet',
          message: customMessage || 'Connect your data sources to start getting comprehensive business intelligence.',
          actionText: 'Connect Data Sources',
          tips: [
            'Connect HR systems',
            'Link CRM platforms',
            'Import financial data',
            'Set up data synchronization',
          ],
        };
      case 'teams':
        return {
          icon: customIcon || '👥',
          title: 'No Team Analytics',
          message: customMessage || 'Team performance metrics will appear once HR data is connected and processed.',
          actionText: 'Connect HR Data',
          tips: [
            'Import employee data',
            'Set up team structures',
            'Configure performance metrics',
            'Enable team tracking',
          ],
        };
      case 'departments':
        return {
          icon: customIcon || '🏢',
          title: 'No Department Analytics',
          message: customMessage || 'Department metrics will be available once organizational structure is defined.',
          actionText: 'Set Up Departments',
          tips: [
            'Define department hierarchy',
            'Assign department heads',
            'Set department budgets',
            'Configure department KPIs',
          ],
        };
      case 'reports':
        return {
          icon: customIcon || '📈',
          title: 'No Reports Generated',
          message: customMessage || 'Generate your first analytics report to get insights into your organization.',
          actionText: 'Generate Report',
          tips: [
            'Choose report type',
            'Select time period',
            'Configure metrics',
            'Generate insights',
          ],
        };
      case 'insights':
        return {
          icon: customIcon || '💡',
          title: 'No Insights Available',
          message: customMessage || 'Business intelligence insights will appear once sufficient data is collected.',
          actionText: 'Collect Data',
          tips: [
            'Gather historical data',
            'Enable real-time monitoring',
            'Set up KPI tracking',
            'Configure analysis parameters',
          ],
        };
      default:
        return {
          icon: customIcon || '📊',
          title: 'Welcome to Enterprise Analytics',
          message: customMessage || 'Get comprehensive business intelligence and organizational insights.',
          actionText: 'Get Started',
          tips: [
            'Connect data sources',
            'Set up organization structure',
            'Configure analytics',
            'Generate first report',
          ],
        };
    }
  };

  const emptyState = getEmptyState();

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {/* Icon */}
        <View style={styles.iconContainer}>
          <Text style={styles.icon}>{emptyState.icon}</Text>
        </View>

        {/* Title and Message */}
        <Text style={styles.title}>{emptyState.title}</Text>
        <Text style={styles.message}>{emptyState.message}</Text>

        {/* Action Button */}
        <View style={styles.actionContainer}>
          <Button
            title={emptyState.actionText}
            onPress={onAction || (() => {})}
            style={styles.actionButton}
          />
        </View>

        {/* Tips */}
        <View style={styles.tipsContainer}>
          <Text style={styles.tipsTitle}>Quick Tips:</Text>
          {emptyState.tips.map((tip, index) => (
            <View key={index} style={styles.tipItem}>
              <Text style={styles.tipBullet}>•</Text>
              <Text style={styles.tipText}>{tip}</Text>
            </View>
          ))}
        </View>

        {/* Feature Highlights */}
        <View style={styles.featuresContainer}>
          <Text style={styles.featuresTitle}>Enterprise Features:</Text>
          <View style={styles.featureGrid}>
            <View style={styles.featureItem}>
              <Text style={styles.featureIcon}>📈</Text>
              <Text style={styles.featureName}>Business Intelligence</Text>
              <Text style={styles.featureDescription}>Comprehensive insights</Text>
            </View>
            <View style={styles.featureItem}>
              <Text style={styles.featureIcon}>👥</Text>
              <Text style={styles.featureName}>Team Analytics</Text>
              <Text style={styles.featureDescription}>Performance tracking</Text>
            </View>
            <View style={styles.featureItem}>
              <Text style={styles.featureIcon}>🏢</Text>
              <Text style={styles.featureName}>Department Metrics</Text>
              <Text style={styles.featureDescription}>Organizational insights</Text>
            </View>
            <View style={styles.featureItem}>
              <Text style={styles.featureIcon}>📊</Text>
              <Text style={styles.featureName}>Performance Dashboard</Text>
              <Text style={styles.featureDescription}>Real-time monitoring</Text>
            </View>
          </View>
        </View>

        {/* Data Sources */}
        <View style={styles.dataSourceContainer}>
          <Text style={styles.dataSourceTitle}>Supported Data Sources:</Text>
          <View style={styles.dataSourceList}>
            <View style={styles.dataSourceItem}>
              <Text style={styles.dataSourceIcon}>💼</Text>
              <View style={styles.dataSourceInfo}>
                <Text style={styles.dataSourceName}>HR Systems</Text>
                <Text style={styles.dataSourceDesc}>Employee & team data</Text>
              </View>
            </View>
            <View style={styles.dataSourceItem}>
              <Text style={styles.dataSourceIcon}>🤝</Text>
              <View style={styles.dataSourceInfo}>
                <Text style={styles.dataSourceName}>CRM Platforms</Text>
                <Text style={styles.dataSourceDesc}>Customer relationships</Text>
              </View>
            </View>
            <View style={styles.dataSourceItem}>
              <Text style={styles.dataSourceIcon}>💰</Text>
              <View style={styles.dataSourceInfo}>
                <Text style={styles.dataSourceName}>Financial Systems</Text>
                <Text style={styles.dataSourceDesc}>Revenue & costs</Text>
              </View>
            </View>
            <View style={styles.dataSourceItem}>
              <Text style={styles.dataSourceIcon}>⚙️</Text>
              <View style={styles.dataSourceInfo}>
                <Text style={styles.dataSourceName}>ERP Systems</Text>
                <Text style={styles.dataSourceDesc}>Operations data</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Benefits */}
        <View style={styles.benefitsContainer}>
          <Text style={styles.benefitsTitle}>Why Enterprise Analytics?</Text>
          <View style={styles.benefitsList}>
            <Text style={styles.benefitItem}>• Data-driven decision making</Text>
            <Text style={styles.benefitItem}>• Real-time performance monitoring</Text>
            <Text style={styles.benefitItem}>• Predictive analytics and forecasting</Text>
            <Text style={styles.benefitItem}>• Comprehensive KPI tracking</Text>
            <Text style={styles.benefitItem}>• Strategic business intelligence</Text>
          </View>
        </View>

        {/* Getting Started */}
        <View style={styles.gettingStartedContainer}>
          <Text style={styles.gettingStartedTitle}>Getting Started:</Text>
          <View style={styles.gettingStartedSteps}>
            <View style={styles.stepItem}>
              <Text style={styles.stepNumber}>1</Text>
              <Text style={styles.stepText}>Connect data sources</Text>
            </View>
            <View style={styles.stepItem}>
              <Text style={styles.stepNumber}>2</Text>
              <Text style={styles.stepText}>Configure organization</Text>
            </View>
            <View style={styles.stepItem}>
              <Text style={styles.stepNumber}>3</Text>
              <Text style={styles.stepText}>Set up analytics</Text>
            </View>
            <View style={styles.stepItem}>
              <Text style={styles.stepNumber}>4</Text>
              <Text style={styles.stepText}>Generate insights</Text>
            </View>
          </View>
        </View>

        {/* Analytics Capabilities */}
        <View style={styles.capabilitiesContainer}>
          <Text style={styles.capabilitiesTitle}>Analytics Capabilities:</Text>
          <Text style={styles.capabilitiesText}>
            Enterprise Analytics provides comprehensive business intelligence through advanced data processing, 
            real-time monitoring, predictive modeling, and strategic insights. Transform your organizational data 
            into actionable business intelligence.
          </Text>
        </View>

        {/* Security & Compliance */}
        <View style={styles.securityContainer}>
          <Text style={styles.securityTitle}>Security & Compliance:</Text>
          <View style={styles.securityPoints}>
            <Text style={styles.securityPoint}>• Enterprise-grade data encryption</Text>
            <Text style={styles.securityPoint}>• Role-based access control</Text>
            <Text style={styles.securityPoint}>• GDPR and SOC2 compliance</Text>
            <Text style={styles.securityPoint}>• Comprehensive audit trails</Text>
          </View>
        </View>

        {/* Integration Support */}
        <View style={styles.integrationContainer}>
          <Text style={styles.integrationTitle}>Integration Support:</Text>
          <View style={styles.integrationItems}>
            <View style={styles.integrationItem}>
              <Text style={styles.integrationLabel}>API Integration:</Text>
              <Text style={styles.integrationValue}>REST & GraphQL</Text>
            </View>
            <View style={styles.integrationItem}>
              <Text style={styles.integrationLabel}>Real-time Sync:</Text>
              <Text style={styles.integrationValue}>Webhooks & streaming</Text>
            </View>
            <View style={styles.integrationItem}>
              <Text style={styles.integrationLabel}>Data Formats:</Text>
              <Text style={styles.integrationValue}>JSON, CSV, XML</Text>
            </View>
            <View style={styles.integrationItem}>
              <Text style={styles.integrationLabel}>Authentication:</Text>
              <Text style={styles.integrationValue}>OAuth 2.0, SAML</Text>
            </View>
          </View>
        </View>

        {/* Success Metrics */}
        <View style={styles.metricsContainer}>
          <Text style={styles.metricsTitle}>Success Metrics:</Text>
          <View style={styles.metricsList}>
            <Text style={styles.metricsItem}>• 95% data accuracy rate</Text>
            <Text style={styles.metricsItem}>• Real-time processing under 100ms</Text>
            <Text style={styles.metricsItem}>• 99.9% system uptime</Text>
            <Text style={styles.metricsItem}>• Enterprise-grade security</Text>
          </View>
        </View>

        {/* Encouragement */}
        <View style={styles.encouragementContainer}>
          <Text style={styles.encouragementText}>
            Transform your organization with data-driven insights. Enterprise Analytics empowers you to make 
            informed decisions, optimize performance, and drive strategic growth through comprehensive business intelligence.
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    padding: 20,
  },
  content: {
    alignItems: 'center',
    maxWidth: 400,
  },
  iconContainer: {
    marginBottom: 24,
  },
  icon: {
    fontSize: 64,
    textAlign: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2C3E50',
    textAlign: 'center',
    marginBottom: 12,
  },
  message: {
    fontSize: 16,
    color: '#7F8C8D',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  actionContainer: {
    marginBottom: 32,
  },
  actionButton: {
    paddingHorizontal: 32,
  },
  tipsContainer: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E1E8ED',
    marginBottom: 32,
    width: '100%',
  },
  tipsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 12,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  tipBullet: {
    fontSize: 14,
    color: '#3498DB',
    marginRight: 8,
    marginTop: 2,
  },
  tipText: {
    fontSize: 14,
    color: '#7F8C8D',
    lineHeight: 20,
    flex: 1,
  },
  featuresContainer: {
    marginBottom: 32,
    width: '100%',
  },
  featuresTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
    textAlign: 'center',
    marginBottom: 16,
  },
  featureGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  featureItem: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E1E8ED',
    alignItems: 'center',
    marginBottom: 12,
  },
  featureIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  featureName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2C3E50',
    textAlign: 'center',
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 12,
    color: '#7F8C8D',
    textAlign: 'center',
    lineHeight: 16,
  },
  dataSourceContainer: {
    marginBottom: 32,
    width: '100%',
  },
  dataSourceTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 16,
  },
  dataSourceList: {
    gap: 12,
  },
  dataSourceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E1E8ED',
  },
  dataSourceIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  dataSourceInfo: {
    flex: 1,
  },
  dataSourceName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 2,
  },
  dataSourceDesc: {
    fontSize: 12,
    color: '#7F8C8D',
  },
  benefitsContainer: {
    marginBottom: 32,
    width: '100%',
  },
  benefitsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 12,
  },
  benefitsList: {
    gap: 8,
  },
  benefitItem: {
    fontSize: 14,
    color: '#7F8C8D',
    lineHeight: 20,
  },
  gettingStartedContainer: {
    backgroundColor: '#E3F2FD',
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#BBDEFB',
    marginBottom: 32,
    width: '100%',
  },
  gettingStartedTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 16,
  },
  gettingStartedSteps: {
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
  capabilitiesContainer: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E1E8ED',
    marginBottom: 32,
    width: '100%',
  },
  capabilitiesTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 12,
  },
  capabilitiesText: {
    fontSize: 14,
    color: '#7F8C8D',
    lineHeight: 20,
  },
  securityContainer: {
    backgroundColor: '#E8F5E8',
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#C3E6CB',
    marginBottom: 32,
    width: '100%',
  },
  securityTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 12,
  },
  securityPoints: {
    gap: 8,
  },
  securityPoint: {
    fontSize: 14,
    color: '#27AE60',
    lineHeight: 20,
  },
  integrationContainer: {
    backgroundColor: '#FFF3E0',
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FFE0B2',
    marginBottom: 32,
    width: '100%',
  },
  integrationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 16,
  },
  integrationItems: {
    gap: 8,
  },
  integrationItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  integrationLabel: {
    fontSize: 12,
    color: '#7F8C8D',
  },
  integrationValue: {
    fontSize: 12,
    color: '#F39C12',
    fontWeight: '600',
  },
  metricsContainer: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E1E8ED',
    marginBottom: 32,
    width: '100%',
  },
  metricsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 12,
  },
  metricsList: {
    gap: 8,
  },
  metricsItem: {
    fontSize: 14,
    color: '#7F8C8D',
    lineHeight: 20,
  },
  encouragementContainer: {
    backgroundColor: '#F3E5F5',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D2B4DE',
    width: '100%',
  },
  encouragementText: {
    fontSize: 14,
    color: '#2C3E50',
    textAlign: 'center',
    lineHeight: 20,
  },
});
