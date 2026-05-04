/**
 * Life Simulation Empty Component
 * 
 * Empty state UI for life simulation features with dynamic messages,
 * action prompts, quick tips, feature highlights, supported simulation categories,
 * benefits, getting started guide, success metrics, and encouragement.
 */

import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { Card } from '../../../components/primitives/Card';
import { Button } from '../../../components/primitives/Button';
import { Badge } from '../../../components/primitives/Badge';

interface LifeSimulationEmptyProps {
  onCreateAvatar?: () => void;
  onStartSimulation?: () => void;
  onLearnMore?: () => void;
}

export function LifeSimulationEmpty({
  onCreateAvatar,
  onStartSimulation,
  onLearnMore,
}: LifeSimulationEmptyProps) {
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
    'Create your avatar and begin your life journey',
    'Start a new life simulation with unique experiences',
    'Build your virtual life from birth to success',
    'Experience life events and make meaningful choices',
  ];

  const quickTips = [
    '👤 Customize your avatar appearance and personality',
    '💼 Choose a career path that matches your interests',
    '👥 Build relationships with family and friends',
    '🎯 Make strategic choices in life events',
    '📊 Monitor your life statistics for optimal balance',
    '🏆 Complete achievements to unlock rewards',
  ];

  const featureHighlights = [
    '🎭 Dynamic avatar creation with personality traits',
    '💼 Multiple career paths with progression systems',
    '👥 Relationship management with social dynamics',
    '🎯 Interactive life events with meaningful choices',
    '📊 Real-time life statistics tracking',
    '🏆 Achievement system with unlockable rewards',
    '💰 Financial management and budget tracking',
    '📈 Skill development and personal growth',
  ];

  const supportedCategories = [
    { name: 'Avatar Creation', icon: '👤', description: 'Customize appearance, personality, and skills' },
    { name: 'Career Development', icon: '💼', description: 'Choose and advance through various career paths' },
    { name: 'Relationship Building', icon: '👥', description: 'Form and maintain social connections' },
    { name: 'Life Events', icon: '🎯', description: 'Experience random and story-driven events' },
    { name: 'Achievement System', icon: '🏆', description: 'Unlock rewards and track progress' },
    { name: 'Statistics Tracking', icon: '📊', description: 'Monitor health, happiness, and life metrics' },
  ];

  const benefits = [
    '🎭 Create unique avatars with customizable personalities',
    '💼 Explore multiple career paths with realistic progression',
    '👥 Build meaningful relationships with social dynamics',
    '🎯 Experience dynamic life events with real consequences',
    '📊 Track comprehensive life statistics in real-time',
    '🏆 Unlock achievements and earn rewards for milestones',
    '💰 Manage finances and make economic decisions',
    '📈 Develop skills and grow your capabilities',
  ];

  const gettingStartedSteps = [
    { step: 1, title: 'Create Your Avatar', description: 'Design your unique character with appearance and personality' },
    { step: 2, title: 'Choose Your Path', description: 'Select a career and set life goals' },
    { step: 3, title: 'Experience Life', description: 'Navigate through life events and make choices' },
    { step: 4, title: 'Build Relationships', description: 'Form connections with other characters' },
    { step: 5, title: 'Track Progress', description: 'Monitor your life statistics and achievements' },
  ];

  const successMetrics = [
    '🎯 10K+ active life simulations',
    '📊 50K+ avatars created',
    '👥 100K+ relationships formed',
    '💼 25K+ career paths explored',
    '🏆 75K+ achievements unlocked',
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
            <Text style={styles.icon}>🎭</Text>
            <Text style={styles.title}>Life Simulation</Text>
            <Text style={styles.subtitle}>{getRandomMessage()}</Text>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionContainer}>
            <Animated.View
              style={[{ transform: [{ scale: pulseAnim }] }]}
            >
              <Button
                title="Create Avatar"
                onPress={onCreateAvatar}
                variant="primary"
                style={styles.primaryButton}
              />
            </Animated.View>
            
            <View style={styles.secondaryActions}>
              <Button
                title="Learn More"
                onPress={onLearnMore}
                variant="secondary"
                style={styles.secondaryButton}
              />
              <Button
                title="Start Tutorial"
                onPress={onStartSimulation}
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
          <Text style={styles.categoriesTitle}>📋 Simulation Categories</Text>
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
          <Text style={styles.benefitsTitle}>🎯 Simulation Benefits</Text>
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
          <Text style={styles.successTitle}>📊 Community Stats</Text>
          <View style={styles.successGrid}>
            {successMetrics.map((metric, index) => (
              <Text key={index} style={styles.successText}>{metric}</Text>
            ))}
          </View>
        </Card>

        {/* Encouragement */}
        <Card style={styles.encouragementCard}>
          <Text style={styles.encouragementTitle}>🎭 Start Your Life Journey</Text>
          <Text style={styles.encouragementText}>
            Create your avatar and experience a unique life simulation with endless possibilities.
            Make choices that matter, build relationships, and achieve your dreams in this virtual world.
          </Text>
          <Button
            title="Begin Your Story"
            onPress={onCreateAvatar}
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
    color: '#9B59B6',
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
    color: '#9B59B6',
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
