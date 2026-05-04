/**
 * Global Marketplace Empty Component
 * 
 * Empty state UI for global marketplace features with dynamic messages,
 * action prompts, quick tips, feature highlights, supported marketplace categories,
 * benefits, getting started guide, success metrics, and encouragement.
 */

import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { Card } from '../../../components/primitives/Card';
import { Button } from '../../../components/primitives/Button';
import { Badge } from '../../../components/primitives/Badge';

interface GlobalMarketplaceEmptyProps {
  onCreateProduct?: () => void;
  onCreateVendor?: () => void;
  onBrowseProducts?: () => void;
  onSearchVendors?: () => void;
  onLearnMore?: () => void;
}

export function GlobalMarketplaceEmpty({
  onCreateProduct,
  onCreateVendor,
  onBrowseProducts,
  onSearchVendors,
  onLearnMore,
}: GlobalMarketplaceEmptyProps) {
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
    'Start exploring products from vendors worldwide',
    'Create your vendor profile and reach global customers',
    'Browse millions of products across multiple categories',
    'Set up your marketplace store and start selling globally',
  ];

  const quickTips = [
    '🛍️ Browse products by category, price, or vendor rating',
    '🏪 Become a verified vendor to build trust with customers',
    '💰 Set competitive pricing with currency conversion support',
    '📊 Track sales analytics and customer insights in real-time',
    '🚀 Offer fast shipping options to improve customer satisfaction',
  ];

  const featureHighlights = [
    '🌍 Global marketplace with 50+ countries supported',
    '🏪 Verified vendor network with trust badges',
    '💳 Multi-currency payment processing',
    '📈 Real-time sales analytics and insights',
    '🚀 Fast global shipping and tracking',
    '⭐ Customer rating and review system',
    '🔍 Advanced product search and filtering',
    '📱 Mobile-optimized marketplace experience',
  ];

  const supportedCategories = [
    { name: 'Electronics', icon: '📱', description: 'Smartphones, laptops, gadgets, and accessories' },
    { name: 'Fashion', icon: '👗', description: 'Clothing, shoes, accessories, and beauty products' },
    { name: 'Home & Garden', icon: '🏠', description: 'Furniture, decor, tools, and outdoor equipment' },
    { name: 'Sports & Outdoors', icon: '⚽', description: 'Athletic gear, fitness equipment, and outdoor gear' },
    { name: 'Books & Media', icon: '📚', description: 'Books, movies, music, and digital content' },
    { name: 'Food & Beverages', icon: '🍕', description: 'Gourmet foods, beverages, and cooking supplies' },
  ];

  const benefits = [
    '🌍 Reach customers in over 50 countries',
    '💰 Accept payments in multiple currencies',
    '📊 Access detailed sales analytics and insights',
    '🚀 Fast and reliable global shipping',
    '⭐ Build trust with verified vendor badges',
    '📱 Mobile-optimized shopping experience',
    '🔍 Advanced search and discovery features',
    '💬 Direct customer communication tools',
  ];

  const gettingStartedSteps = [
    { step: 1, title: 'Create Your Account', description: 'Sign up and complete your profile' },
    { step: 2, title: 'Choose Your Role', description: 'Browse as customer or sell as vendor' },
    { step: 3, title: 'Set Up Preferences', description: 'Configure language, currency, and shipping' },
    { step: 4, title: 'Explore Products', description: 'Browse or list your first products' },
    { step: 5, title: 'Start Trading', description: 'Make purchases or begin selling globally' },
  ];

  const successMetrics = [
    '🎯 2M+ active customers worldwide',
    '📊 100K+ verified vendors',
    '🛍️ 10M+ products available',
    '🌍 50+ countries supported',
    '⭐ 4.8/5 average customer rating',
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
            <Text style={styles.title}>Welcome to Global Marketplace</Text>
            <Text style={styles.subtitle}>{getRandomMessage()}</Text>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionContainer}>
            <Animated.View
              style={[{ transform: [{ scale: pulseAnim }] }]}
            >
              <Button
                title="Browse Products"
                onPress={onBrowseProducts}
                variant="primary"
                style={styles.primaryButton}
              />
            </Animated.View>
            
            <View style={styles.secondaryActions}>
              <Button
                title="Become Vendor"
                onPress={onCreateVendor}
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
          <Text style={styles.categoriesTitle}>📋 Popular Categories</Text>
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
          <Text style={styles.benefitsTitle}>🎯 Marketplace Benefits</Text>
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
          <Text style={styles.successTitle}>📊 Marketplace Stats</Text>
          <View style={styles.successGrid}>
            {successMetrics.map((metric, index) => (
              <Text key={index} style={styles.successText}>{metric}</Text>
            ))}
          </View>
        </Card>

        {/* Encouragement */}
        <Card style={styles.encouragementCard}>
          <Text style={styles.encouragementTitle}>🌍 Join Global Commerce</Text>
          <Text style={styles.encouragementText}>
            Connect with millions of customers and vendors worldwide. Start your global commerce journey today and discover products from every corner of the globe.
          </Text>
          <Button
            title="Start Exploring"
            onPress={onBrowseProducts}
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
