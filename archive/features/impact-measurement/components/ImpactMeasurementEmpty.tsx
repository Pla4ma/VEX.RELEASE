/**
 * Impact Measurement Empty Component
 * 
 * Empty state UI for impact measurement features with dynamic messages,
 * action prompts, quick tips, feature highlights, supported impact categories,
 * benefits, getting started guide, success metrics, and encouragement.
 */

import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { Card } from '../../../components/primitives/Card';
import { Button } from '../../../components/primitives/Button';
import { Badge } from '../../../components/primitives/Badge';

interface ImpactMeasurementEmptyProps {
  onCreateMetric?: () => void;
  onCreateReport?: () => void;
  onCreateGoal?: () => void;
  onImportData?: () => void;
  onLearnMore?: () => void;
}

export function ImpactMeasurementEmpty({
  onCreateMetric,
  onCreateReport,
  onCreateGoal,
  onImportData,
  onLearnMore,
}: ImpactMeasurementEmptyProps) {
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
    'Start tracking your environmental, social, and economic impact',
    'Measure your sustainability progress and carbon footprint',
    'Set goals and monitor your impact over time',
    'Generate comprehensive impact reports',
  ];

  const quickTips = [
    '🌱 Begin with environmental metrics like energy usage and carbon emissions',
    '👥 Track social impact through employee satisfaction and community engagement',
    '💰 Monitor economic sustainability with cost savings and revenue metrics',
    '🎯 Set realistic sustainability goals with clear targets and deadlines',
    '📊 Generate regular reports to track progress and identify trends',
  ];

  const featureHighlights = [
    '📈 Real-time impact monitoring and analytics',
    '🎯 Sustainability goal tracking and management',
    '🌍 Carbon footprint calculation and reporting',
    '📋 Comprehensive impact reporting system',
    '🚨 Automated alerts and notifications',
    '📱 Mobile-optimized impact tracking',
    '🔄 Data synchronization across platforms',
    '📊 Trend analysis and predictive insights',
  ];

  const supportedCategories = [
    { name: 'Environmental', icon: '🌍', description: 'Carbon emissions, energy usage, water consumption' },
    { name: 'Social', icon: '👥', description: 'Employee satisfaction, community engagement, diversity' },
    { name: 'Economic', icon: '💰', description: 'Cost savings, revenue growth, ROI analysis' },
    { name: 'Sustainability', icon: '🌱', description: 'Waste reduction, recycling, sustainable practices' },
  ];

  const benefits = [
    '📊 Data-driven sustainability decisions',
    '💰 Identify cost-saving opportunities',
    '🌍 Reduce environmental impact',
    '👥 Improve social responsibility',
    '📈 Track progress over time',
    '🎯 Achieve sustainability goals',
    '📋 Generate compliance reports',
    '🚀 Enhance brand reputation',
  ];

  const gettingStartedSteps = [
    { step: 1, title: 'Set Up Your Profile', description: 'Configure your organization and impact categories' },
    { step: 2, title: 'Import Existing Data', description: 'Upload historical data or connect data sources' },
    { step: 3, title: 'Create Metrics', description: 'Define key performance indicators for each category' },
    { step: 4, title: 'Set Goals', description: 'Establish sustainability targets and deadlines' },
    { step: 5, title: 'Start Tracking', description: 'Begin monitoring and analyzing your impact' },
  ];

  const successMetrics = [
    '🎯 85% average goal achievement rate',
    '📊 40% reduction in carbon emissions',
    '💰 $250K average cost savings',
    '🌍 100+ organizations using impact measurement',
    '📈 92% user satisfaction rate',
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
            <Text style={styles.icon}>🌍</Text>
            <Text style={styles.title}>Start Measuring Your Impact</Text>
            <Text style={styles.subtitle}>{getRandomMessage()}</Text>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionContainer}>
            <Animated.View
              style={[{ transform: [{ scale: pulseAnim }] }]}
            >
              <Button
                title="Create First Metric"
                onPress={onCreateMetric}
                variant="primary"
                style={styles.primaryButton}
              />
            </Animated.View>
            
            <View style={styles.secondaryActions}>
              <Button
                title="Import Data"
                onPress={onImportData}
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
          <Text style={styles.tipsTitle}>💡 Quick Tips</Text>
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
          <Text style={styles.categoriesTitle}>📋 Supported Impact Categories</Text>
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
          <Text style={styles.benefitsTitle}>🎯 Benefits of Impact Measurement</Text>
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
          <Text style={styles.successTitle}>📊 Success Metrics</Text>
          <View style={styles.successGrid}>
            {successMetrics.map((metric, index) => (
              <Text key={index} style={styles.successText}>{metric}</Text>
            ))}
          </View>
        </Card>

        {/* Encouragement */}
        <Card style={styles.encouragementCard}>
          <Text style={styles.encouragementTitle}>🌱 Make a Difference</Text>
          <Text style={styles.encouragementText}>
            Every organization's impact matters. Start tracking today and join thousands of companies making a positive environmental and social difference through data-driven sustainability practices.
          </Text>
          <Button
            title="Start Your Journey"
            onPress={onCreateMetric}
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
    color: '#27AE60',
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
    color: '#9B59B6',
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
    backgroundColor: '#9B59B6',
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
    color: '#27AE60',
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
