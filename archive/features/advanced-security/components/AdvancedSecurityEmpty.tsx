/**
 * Advanced Security Empty Component
 * 
 * Empty state UI for advanced security features with dynamic messages,
 * action prompts, quick tips, feature highlights, supported security categories,
 * benefits, getting started guide, success metrics, and encouragement.
 */

import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { Card } from '../../../components/primitives/Card';
import { Button } from '../../../components/primitives/Button';
import { Badge } from '../../../components/primitives/Badge';

interface AdvancedSecurityEmptyProps {
  onStartSecurity?: () => void;
  onConfigureSettings?: () => void;
  onLearnMore?: () => void;
}

export function AdvancedSecurityEmpty({
  onStartSecurity,
  onConfigureSettings,
  onLearnMore,
}: AdvancedSecurityEmptyProps) {
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(50));
  const [pulseAnim] = useState(new Animated.Value(1));

  useEffect(() => {
    // Fade in animation
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();

    // Slide up animation
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 600,
      useNativeDriver: true,
    }).start();

    // Pulse animation for CTA button
    const pulseAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
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

    return () => {
      pulseAnimation.stop();
    };
  }, []);

  const emptyMessages = [
    'Start protecting your systems with advanced security monitoring',
    'Configure comprehensive security threat detection and response',
    'Set up vulnerability scanning and compliance monitoring',
    'Establish proactive security posture management',
  ];

  const quickTips = [
    '🛡️ Enable real-time threat detection for immediate alerts',
    '🔍 Schedule regular vulnerability scans to identify weaknesses',
    '📊 Monitor security metrics for proactive risk management',
    '📋 Configure compliance frameworks for regulatory adherence',
    '🚨 Set up automated incident response workflows',
    '🔧 Implement continuous security monitoring',
  ];

  const featureHighlights = [
    '🎯 Real-time threat detection and automated response',
    '🔍 Comprehensive vulnerability scanning and assessment',
    '📊 Advanced security analytics and reporting',
    '📋 Multi-framework compliance management',
    '🚨 Automated incident response workflows',
    '🔧 Continuous security monitoring and alerting',
    '📈 Risk assessment and mitigation strategies',
    '🛡️ Proactive security posture management',
  ];

  const supportedCategories = [
    { name: 'Threat Detection', icon: '🎯', description: 'Real-time monitoring and detection of security threats' },
    { name: 'Vulnerability Management', icon: '🔍', description: 'Comprehensive scanning and assessment of system vulnerabilities' },
    { name: 'Compliance Monitoring', icon: '📋', description: 'Automated tracking of compliance across multiple frameworks' },
    { name: 'Incident Response', icon: '🚨', description: 'Structured workflows for security incident handling' },
    { name: 'Security Analytics', icon: '📊', description: 'Advanced analytics and reporting for security insights' },
    { name: 'Risk Management', icon: '📈', description: 'Risk assessment and mitigation strategies' },
  ];

  const benefits = [
    '🎯 Real-time threat detection prevents security breaches',
    '🔍 Vulnerability scanning identifies weaknesses before exploitation',
    '📊 Security analytics provide actionable insights',
    '📋 Compliance monitoring ensures regulatory adherence',
    '🚨 Automated response reduces incident resolution time',
    '🔧 Continuous monitoring maintains security posture',
    '📈 Risk management prioritizes security investments',
    '🛡️ Proactive protection reduces attack surface',
  ];

  const gettingStartedSteps = [
    { step: 1, title: 'Configure Security Settings', description: 'Set up security policies and monitoring preferences' },
    { step: 2, title: 'Enable Threat Detection', description: 'Activate real-time threat monitoring and alerts' },
    { step: 3, title: 'Schedule Vulnerability Scans', description: 'Configure regular vulnerability assessments' },
    { step: 4, title: 'Set Up Compliance Frameworks', description: 'Configure compliance monitoring for relevant standards' },
    { step: 5, title: 'Establish Incident Response', description: 'Set up automated incident response workflows' },
  ];

  const successMetrics = [
    '🎯 10K+ threats detected and neutralized',
    '📊 50K+ vulnerabilities identified and patched',
    '📋 25K+ compliance requirements monitored',
    '🚨 5K+ security incidents resolved',
    '📈 95% reduction in security response time',
  ];

  const getRandomMessage = () => {
    return emptyMessages[Math.floor(Math.random() * emptyMessages.length)];
  };

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.contentContainer,
          { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
        ]}
      >
        {/* Main Empty State Card */}
        <Card style={styles.mainCard}>
          <View style={styles.header}>
            <Text style={styles.icon}>🛡️</Text>
            <Text style={styles.title}>Advanced Security</Text>
            <Text style={styles.subtitle}>{getRandomMessage()}</Text>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionContainer}>
            <Animated.View
              style={[{ transform: [{ scale: pulseAnim }] }]}
            >
              <Button
                title="Start Security Protection"
                onPress={onStartSecurity}
                variant="primary"
                style={styles.primaryButton}
              />
            </Animated.View>
            
            <View style={styles.secondaryActions}>
              <Button
                title="Configure Settings"
                onPress={onConfigureSettings}
                variant="secondary"
                style={styles.secondaryButton}
              />
              <Button
                title="Learn More"
                onPress={onLearnMore}
                variant="secondary"
                style={styles.secondaryButton}
              />
            </View>
          </View>
        </Card>

        {/* Quick Tips */}
        <Card style={styles.tipsCard}>
          <Text style={styles.tipsTitle}>💡 Security Tips</Text>
          <View style={styles.tipsList}>
            {quickTips.slice(0, 3).map((tip, index) => (
              <Text key={index} style={styles.tipText}>{tip}</Text>
            ))}
          </View>
        </Card>

        {/* Feature Highlights */}
        <Card style={styles.featuresCard}>
          <Text style={styles.featuresTitle}>✨ Available Features</Text>
          <View style={styles.featuresGrid}>
            {featureHighlights.slice(0, 4).map((feature, index) => (
              <View key={index} style={styles.featureItem}>
                <Text style={styles.featureText}>{feature}</Text>
              </View>
            ))}
          </View>
        </Card>

        {/* Supported Categories */}
        <Card style={styles.categoriesCard}>
          <Text style={styles.categoriesTitle}>📋 Security Categories</Text>
          <View style={styles.categoriesList}>
            {supportedCategories.map((category, index) => (
              <View key={index} style={styles.categoryItem}>
                <Text style={styles.categoryIcon}>{category.icon}</Text>
                <View style={styles.categoryContent}>
                  <Text style={styles.categoryName}>{category.name}</Text>
                  <Text style={styles.categoryDescription}>{category.description}</Text>
                </View>
              </View>
            ))}
          </View>
        </Card>

        {/* Benefits */}
        <Card style={styles.benefitsCard}>
          <Text style={styles.benefitsTitle}>🎯 Security Benefits</Text>
          <View style={styles.benefitsGrid}>
            {benefits.slice(0, 4).map((benefit, index) => (
              <Text key={index} style={styles.benefitText}>{benefit}</Text>
            ))}
          </View>
        </Card>

        {/* Getting Started */}
        <Card style={styles.gettingStartedCard}>
          <Text style={styles.gettingStartedTitle}>🚀 Getting Started</Text>
          <View style={styles.stepsList}>
            {gettingStartedSteps.map((step, index) => (
              <View key={index} style={styles.stepItem}>
                <View style={styles.stepNumber}>
                  <Text style={styles.stepNumberText}>{step.step}</Text>
                </View>
                <View style={styles.stepContent}>
                  <Text style={styles.stepTitle}>{step.title}</Text>
                  <Text style={styles.stepDescription}>{step.description}</Text>
                </View>
              </View>
            ))}
          </View>
        </Card>

        {/* Success Metrics */}
        <Card style={styles.successCard}>
          <Text style={styles.successTitle}>📊 Security Impact</Text>
          <View style={styles.successGrid}>
            {successMetrics.map((metric, index) => (
              <Text key={index} style={styles.successText}>{metric}</Text>
            ))}
          </View>
        </Card>

        {/* Encouragement */}
        <Card style={styles.encouragementCard}>
          <Text style={styles.encouragementTitle}>🛡️ Protect Your Systems</Text>
          <Text style={styles.encouragementText}>
            Start your advanced security journey with comprehensive threat detection,
            vulnerability management, and compliance monitoring. Protect your digital
            assets with enterprise-grade security solutions.
          </Text>
          <Button
            title="Begin Security Setup"
            onPress={onStartSecurity}
            variant="primary"
            style={styles.encouragementButton}
          />
        </Card>
      </Animated.View>
    </View>
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
    padding: 24,
    alignItems: 'center',
    marginBottom: 16,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  icon: {
    fontSize: 48,
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#7F8C8D',
    textAlign: 'center',
    lineHeight: 22,
  },
  actionContainer: {
    width: '100%',
    alignItems: 'center',
  },
  primaryButton: {
    width: '100%',
    maxWidth: 300,
    marginBottom: 16,
  },
  secondaryActions: {
    flexDirection: 'row',
    gap: 12,
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  secondaryButton: {
    paddingHorizontal: 20,
  },
  tipsCard: {
    padding: 16,
    marginBottom: 16,
  },
  tipsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#E74C3C',
    marginBottom: 12,
  },
  tipsList: {
    gap: 8,
  },
  tipText: {
    fontSize: 14,
    color: '#2C3E50',
    lineHeight: 20,
  },
  featuresCard: {
    padding: 16,
    marginBottom: 16,
  },
  featuresTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#3498DB',
    marginBottom: 12,
  },
  featuresGrid: {
    gap: 8,
  },
  featureItem: {
    padding: 8,
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
  },
  featureText: {
    fontSize: 14,
    color: '#2C3E50',
  },
  categoriesCard: {
    padding: 16,
    marginBottom: 16,
  },
  categoriesTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 12,
  },
  categoriesList: {
    gap: 12,
  },
  categoryItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    padding: 12,
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
  },
  categoryIcon: {
    fontSize: 20,
  },
  categoryContent: {
    flex: 1,
  },
  categoryName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 4,
  },
  categoryDescription: {
    fontSize: 14,
    color: '#7F8C8D',
    lineHeight: 18,
  },
  benefitsCard: {
    padding: 16,
    marginBottom: 16,
  },
  benefitsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#F39C12',
    marginBottom: 12,
  },
  benefitsGrid: {
    gap: 8,
  },
  benefitText: {
    fontSize: 14,
    color: '#2C3E50',
    lineHeight: 20,
  },
  gettingStartedCard: {
    padding: 16,
    marginBottom: 16,
  },
  gettingStartedTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#E74C3C',
    marginBottom: 12,
  },
  stepsList: {
    gap: 12,
  },
  stepItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  stepNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#E74C3C',
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepNumberText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 2,
  },
  stepDescription: {
    fontSize: 12,
    color: '#7F8C8D',
    lineHeight: 16,
  },
  successCard: {
    padding: 16,
    marginBottom: 16,
  },
  successTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#27AE60',
    marginBottom: 12,
  },
  successGrid: {
    gap: 8,
  },
  successText: {
    fontSize: 14,
    color: '#2C3E50',
    lineHeight: 20,
  },
  encouragementCard: {
    padding: 20,
    alignItems: 'center',
  },
  encouragementTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#E74C3C',
    marginBottom: 12,
    textAlign: 'center',
  },
  encouragementText: {
    fontSize: 14,
    color: '#2C3E50',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 20,
  },
  encouragementButton: {
    paddingHorizontal: 24,
  },
});
