/**
 * VIP Paywall Screen
 *
 * Premium subscription tier with RevenueCat integration.
 * Shows VIP benefits with social proof and clear value proposition.
 *
 * Passes the test: "Would a free user feel like they're missing out?"
 */

import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  View,
} from 'react-native';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  FadeInDown,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

import { Button } from '../../../components/primitives/Button';
import { Text } from '../../../components/primitives/Text';
import type { ExtendedRootStackParams } from '../../../navigation/types';
import { capture } from '../../analytics';
import {
  usePaywall,
  usePremiumStatus,
} from '../use-revenuecat';
import { PurchaseEvents, createPaywallProperties, createPurchaseProperties } from '../purchase-events';
import { CardEnterAnimation } from '../../ui/components/EnterAnimation';
import { StatusBanner } from '../../ui/components/StatusFeedback';
import { useTheme } from '../../../theme';
import { styles } from './VipPaywallScreen.styles';

// VIP Benefits Configuration
const VIP_BENEFITS = [
  {
    icon: '💎',
    title: 'Daily Gem Drop',
    value: '10 gems/day',
    description: '300 gems every month — worth 3 premium chests',
    highlight: true,
  },
  {
    icon: '🎁',
    title: '2x Mystery Chests',
    value: 'Double drops',
    description: 'Every chest drop has 2x chance — rare items come faster',
    highlight: true,
  },
  {
    icon: '⚡',
    title: 'Boss Rush',
    value: '50% faster cooldowns',
    description: 'Challenge bosses more often, earn rewards faster',
    highlight: false,
  },
  {
    icon: '🤖',
    title: 'Priority Coach',
    value: 'Instant responses',
    description: 'Your AI coach replies first — no waiting in line',
    highlight: false,
  },
  {
    icon: '🏆',
    title: 'VIP-Only Challenges',
    value: 'Exclusive quests',
    description: 'Higher reward challenges only VIPs can access',
    highlight: true,
  },
  {
    icon: '👑',
    title: 'VIP Badge',
    value: 'Visible prestige',
    description: 'Exclusive crown badge shown on your profile to everyone',
    highlight: false,
  },
] as const;

// VIP Gradient Colors
const VIP_GRADIENT = ['#FFD700', '#FFA500', '#FF6B35'] as const;
const VIP_ACCENT = '#FFD700';

// Mock social proof — replace with real data from Supabase
const SOCIAL_PROOF = {
  vipCount: 1247,
  newThisMonth: 89,
};

// VIP Price calculation
const calculateSavings = (monthlyPrice: number, annualPrice: number): number => {
  const monthlyCost = monthlyPrice * 12;
  const savings = ((monthlyCost - annualPrice) / monthlyCost) * 100;
  return Math.round(savings);
};

type NavigationProp = NativeStackNavigationProp<ExtendedRootStackParams>;
type VipPaywallRouteProp = RouteProp<ExtendedRootStackParams, 'VipPaywall'>;

export function VipPaywallScreen(): JSX.Element {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<VipPaywallRouteProp>();
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const { colors } = theme;

  const { offerings, packages, isLoading, error, purchase, restore, retry } = usePaywall();
  const { isPremium, isLoading: isLoadingPremium, refresh } = usePremiumStatus();

  const [selectedPlan, setSelectedPlan] = useState<'annual' | 'monthly'>('annual');
  const [statusMessage, setStatusMessage] = useState<{
    tone: 'info' | 'warning' | 'celebration';
    title: string;
    body: string;
  } | null>(null);

  const source = route.params?.source ?? 'unknown';

  // Pulsing animation for VIP crown
  const pulseScale = useSharedValue(1);
  useEffect(() => {
    pulseScale.value = withRepeat(
      withSequence(
        withTiming(1.05, { duration: 1000 }),
        withTiming(1, { duration: 1000 })
      ),
      -1,
      true
    );
  }, [pulseScale]);

  const crownAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }],
  }));

  // Package selection with VIP pricing
  const vipPackages = useMemo(() => {
    const annual = packages.find((p) => p.packageType.toUpperCase() === 'ANNUAL');
    const monthly = packages.find((p) => p.packageType.toUpperCase() === 'MONTHLY');

    const annualPrice = annual?.product.price ?? 49.99;
    const monthlyPrice = monthly?.product.price ?? 6.99;
    const savings = calculateSavings(monthlyPrice, annualPrice);

    return {
      annual: {
        id: 'annual',
        title: 'Annual VIP',
        subtitle: 'Best value for serious players',
        price: annual?.product.priceString ?? '$49.99 / year',
        priceValue: annualPrice,
        badge: `Save ${savings}%`,
        packageInfo: annual,
        trialText: annual?.product.introPrice
          ? `${annual.product.introPrice.period} free trial`
          : null,
      },
      monthly: {
        id: 'monthly',
        title: 'Monthly VIP',
        subtitle: 'Flexible commitment',
        price: monthly?.product.priceString ?? '$6.99 / month',
        priceValue: monthlyPrice,
        badge: 'Most flexible',
        packageInfo: monthly,
        trialText: monthly?.product.introPrice
          ? `${monthly.product.introPrice.period} free trial`
          : null,
      },
    };
  }, [packages]);

  // Analytics tracking
  useEffect(() => {
    capture(
      PurchaseEvents.PAYWALL_VIEWED,
      createPaywallProperties(
        offerings?.identifier ?? 'vip-offering',
        source,
        packages.map((p) => ({
          identifier: p.identifier,
          hasTrial: Boolean(p.product.introPrice),
        }))
      )
    );
  }, [offerings?.identifier, packages, source]);

  const handleClose = () => {
    capture(PurchaseEvents.PAYWALL_DISMISSED, {
      paywall_source: source,
      gated_feature: 'vip_subscription',
    });
    navigation.goBack();
  };

  const handlePurchase = async () => {
    setStatusMessage(null);

    const selectedPackage =
      selectedPlan === 'annual'
        ? vipPackages.annual.packageInfo
        : vipPackages.monthly.packageInfo;

    if (!selectedPackage) {
      setStatusMessage({
        tone: 'warning',
        title: 'Plans loading...',
        body: 'VIP options are still loading. Please wait a moment.',
      });
      return;
    }

    capture(
      PurchaseEvents.PURCHASE_STARTED,
      createPurchaseProperties({
        packageId: selectedPackage.identifier,
        offeringId: offerings?.identifier ?? 'vip-offering',
        productId: selectedPackage.product.identifier,
        price: selectedPackage.product.price,
        currency: selectedPackage.product.currencyCode,
        isRestore: false,
        introPrice: selectedPackage.product.introPrice?.price,
        success: false,
      })
    );

    const result = await purchase(selectedPackage);

    if (result.success) {
      await refresh();
      capture(
        PurchaseEvents.PURCHASE_COMPLETED,
        createPurchaseProperties({
          packageId: selectedPackage.identifier,
          offeringId: offerings?.identifier ?? 'vip-offering',
          productId: selectedPackage.product.identifier,
          price: selectedPackage.product.price,
          currency: selectedPackage.product.currencyCode,
          isRestore: false,
          introPrice: selectedPackage.product.introPrice?.price,
          success: true,
        })
      );

      setStatusMessage({
        tone: 'celebration',
        title: 'Welcome to VIP!',
        body: 'Your daily gems, 2x chests, and exclusive badge are now active.',
      });

      // Delay navigation for celebration
      setTimeout(() => {
        navigation.goBack();
      }, 2000);
      return;
    }

    capture(
      result.errorCode === 'PURCHASE_CANCELLED'
        ? PurchaseEvents.PURCHASE_CANCELLED
        : PurchaseEvents.PURCHASE_FAILED,
      createPurchaseProperties({
        packageId: selectedPackage.identifier,
        offeringId: offerings?.identifier ?? 'vip-offering',
        productId: selectedPackage.product.identifier,
        price: selectedPackage.product.price,
        currency: selectedPackage.product.currencyCode,
        isRestore: false,
        introPrice: selectedPackage.product.introPrice?.price,
        success: false,
        errorCode: result.errorCode,
        errorMessage: result.error?.message,
      })
    );

    setStatusMessage({
      tone: 'warning',
      title: 'Purchase not completed',
      body: 'Nothing was charged. Try again or check your payment method.',
    });
  };

  const handleRestore = async () => {
    setStatusMessage({
      tone: 'info',
      title: 'Restoring purchases...',
      body: 'Checking for existing VIP subscription...',
    });

    const result = await restore();
    await refresh();

    capture(
      result.success ? PurchaseEvents.RESTORE_COMPLETED : PurchaseEvents.RESTORE_FAILED,
      {
        found_entitlements: result.success && isPremium,
        entitlement_count: isPremium ? 1 : 0,
        success: result.success,
        error_code: result.errorCode,
        error_message: result.error?.message,
      }
    );

    setStatusMessage(
      result.success
        ? {
            tone: 'celebration',
            title: 'Purchases restored',
            body: isPremium
              ? 'Your VIP status is active!'
              : 'No active subscriptions found.',
          }
        : {
            tone: 'warning',
            title: 'Restore failed',
            body: 'Try again with a stronger connection.',
          }
    );
  };

  // Render VIP benefit card
  function BenefitCard({ benefit, index }: { benefit: typeof VIP_BENEFITS[number]; index: number }): JSX.Element {
      const scale = useSharedValue(1);

      const handlePressIn = () => {
        scale.value = withSpring(0.96, { damping: 15, stiffness: 300 });
      };

      const handlePressOut = () => {
        scale.value = withSpring(1, { damping: 15, stiffness: 300 });
      };

      const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
      }));

      return (
        <Animated.View entering={FadeInDown.duration(350).delay(index * 80)} style={animatedStyle}>
          <Pressable
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            style={[
              styles.benefitCard,
              {
                backgroundColor: benefit.highlight
                  ? 'rgba(255, 215, 0, 0.08)'
                  : colors.background.secondary,
                borderColor: benefit.highlight ? VIP_ACCENT : colors.border.DEFAULT,
                borderWidth: benefit.highlight ? 2 : 1,
              },
            ]}

          accessibilityLabel="Interactive control"
          accessibilityRole="button"
          accessibilityHint="Activates this control">
            <View style={styles.benefitRow}>
              <Text style={styles.benefitIcon}>{benefit.icon}</Text>
              <View style={styles.benefitContent}>
                <View style={styles.benefitHeader}>
                  <Text
                    variant="h4"
                    fontSize={16}
                    color={benefit.highlight ? 'text.primary' : 'text.primary'}
                  >
                    {benefit.title}
                  </Text>
                  {benefit.highlight && (
                    <View style={[styles.highlightBadge, { backgroundColor: VIP_ACCENT }]}>
                      <Text style={styles.highlightBadgeText}>VIP EXCLUSIVE</Text>
                    </View>
                  )}
                </View>
                <Text
                  variant="bodySmall"
                  fontWeight="700"
                  color={benefit.highlight ? VIP_ACCENT : colors.primary[500]}
                >
                  {benefit.value}
                </Text>
                <Text variant="bodySmall" color="text.secondary" style={{ marginTop: 4 }}>
                  {benefit.description}
                </Text>
              </View>
            </View>
          </Pressable>
        </Animated.View>
      );
  }

  return (
    <View style={[styles.screen, { backgroundColor: colors.background.primary }]}>
      <ScrollView
        contentContainerStyle={{
          paddingTop: insets.top + 16,
          paddingBottom: insets.bottom + 32,
        }}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>
          {/* Header */}
          <View style={styles.headerRow}>
            <View style={styles.headerCopy}>
              <Animated.View entering={FadeInDown.duration(300)} style={crownAnimatedStyle}>
                <LinearGradient
                  colors={[...VIP_GRADIENT]}
                  style={styles.crownBadge}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <Text style={styles.crownIcon}>👑</Text>
                </LinearGradient>
              </Animated.View>
              <Text style={[styles.eyebrow, { color: VIP_ACCENT }]}>VEX VIP</Text>
              <Text variant="h1" fontSize={32} color="text.primary" style={styles.title}>
                {isPremium ? 'You are VIP' : 'Unlock VIP Status'}
              </Text>
              <Text variant="body" color="text.secondary" style={styles.subtitle}>
                {isPremium
                  ? 'Your exclusive benefits are active. Enjoy daily gems, 2x chests, and priority coach access.'
                  : `Join ${SOCIAL_PROOF.vipCount.toLocaleString()} VIP members. Daily gems, 2x chests, exclusive challenges.`}
              </Text>
            </View>
            <Button variant="ghost" onPress={handleClose} size="sm"
  accessibilityLabel="Close button"
  accessibilityRole="button"
  accessibilityHint="Activates this control">
              Close
            </Button>
          </View>

          {/* Social Proof Banner */}
          {!isPremium && (
            <Animated.View entering={FadeInDown.duration(350).delay(100)}>
              <LinearGradient
                colors={['rgba(255, 215, 0, 0.15)', 'rgba(255, 215, 0, 0.05)']}
                style={styles.socialProofBanner}
              >
                <Text style={styles.socialProofIcon}>🔥</Text>
                <Text variant="bodySmall" color="text.primary">
                  <Text fontWeight="700">{SOCIAL_PROOF.newThisMonth}</Text> new VIPs this month
                </Text>
              </LinearGradient>
            </Animated.View>
          )}

          {/* Gem Value Preview */}
          {!isPremium && (
            <CardEnterAnimation>
              <LinearGradient colors={[...VIP_GRADIENT]} style={styles.valueCard}>
                <Text style={styles.valueTitle}>💎 Your VIP Year Includes:</Text>
                <View style={styles.valueGrid}>
                  <View style={styles.valueItem}>
                    <Text style={styles.valueNumber}>3,650</Text>
                    <Text style={styles.valueLabel}>Gems</Text>
                  </View>
                  <View style={styles.valueDivider} />
                  <View style={styles.valueItem}>
                    <Text style={styles.valueNumber}>36</Text>
                    <Text style={styles.valueLabel}>Premium Chests</Text>
                  </View>
                  <View style={styles.valueDivider} />
                  <View style={styles.valueItem}>
                    <Text style={styles.valueNumber}>∞</Text>
                    <Text style={styles.valueLabel}>VIP Challenges</Text>
                  </View>
                </View>
                <Text style={styles.valueFootnote}>Plus 2x chest drops on every mystery chest</Text>
              </LinearGradient>
            </CardEnterAnimation>
          )}

          {/* Status Messages */}
          {statusMessage && (
            <StatusBanner
              status={
                statusMessage.tone === 'celebration'
                  ? 'success'
                  : statusMessage.tone === 'warning'
                    ? 'error'
                    : 'loading'
              }
              message={statusMessage.title}
              description={statusMessage.body}
              onDismiss={() => setStatusMessage(null)}
            />
          )}

          {/* Loading State */}
          {isLoading || isLoadingPremium ? (
            <View style={styles.centered}>
              <ActivityIndicator color={VIP_ACCENT} size="large" />
              <Text variant="bodySmall" color="text.secondary" style={{ marginTop: 16 }}>
                Loading VIP options...
              </Text>
            </View>
          ) : error ? (
            <StatusBanner
              status="error"
              message="Could not load VIP options"
              description="Pricing temporarily unavailable. Try again in a moment."
              onRetry={retry}
            />
          ) : (
            <>
              {/* Plan Selection */}
              {!isPremium && (
                <View style={styles.planSection}>
                  <Text variant="h4" color="text.primary" style={styles.planSectionTitle}>
                    Choose Your Plan
                  </Text>

                  {/* Annual Plan */}
                  <Pressable
                    onPress={() => setSelectedPlan('annual')}
                    style={[
                      styles.planCard,
                      {
                        backgroundColor:
                          selectedPlan === 'annual'
                            ? 'rgba(255, 215, 0, 0.12)'
                            : colors.background.secondary,
                        borderColor: selectedPlan === 'annual' ? VIP_ACCENT : colors.border.DEFAULT,
                        borderWidth: selectedPlan === 'annual' ? 3 : 1,
                      },
                    ]}

                  accessibilityLabel="Interactive control"
                  accessibilityRole="button"
                  accessibilityHint="Activates this control">
                    <View style={styles.planHeader}>
                      <View>
                        <View style={styles.planTitleRow}>
                          <Text variant="h3" fontSize={20} color="text.primary">
                            {vipPackages.annual.title}
                          </Text>
                          <View style={[styles.bestValueBadge, { backgroundColor: VIP_ACCENT }]}>
                            <Text style={styles.bestValueText}>{vipPackages.annual.badge}</Text>
                          </View>
                        </View>
                        <Text variant="bodySmall" color="text.secondary">
                          {vipPackages.annual.subtitle}
                        </Text>
                      </View>
                    </View>
                    <Text variant="hero" fontSize={28} color="text.primary" style={{ marginTop: 12 }}>
                      {vipPackages.annual.price}
                    </Text>
                    {vipPackages.annual.trialText && (
                      <Text style={[styles.trialText, { color: colors.success.DEFAULT }]}>
                        ✓ {vipPackages.annual.trialText}
                      </Text>
                    )}
                  </Pressable>

                  {/* Monthly Plan */}
                  <Pressable
                    onPress={() => setSelectedPlan('monthly')}
                    style={[
                      styles.planCard,
                      {
                        backgroundColor:
                          selectedPlan === 'monthly'
                            ? 'rgba(255, 215, 0, 0.08)'
                            : colors.background.secondary,
                        borderColor:
                          selectedPlan === 'monthly' ? VIP_ACCENT : colors.border.DEFAULT,
                        borderWidth: selectedPlan === 'monthly' ? 2 : 1,
                      },
                    ]}

                  accessibilityLabel="Interactive control"
                  accessibilityRole="button"
                  accessibilityHint="Activates this control">
                    <View style={styles.planHeader}>
                      <View>
                        <View style={styles.planTitleRow}>
                          <Text variant="h3" fontSize={20} color="text.primary">
                            {vipPackages.monthly.title}
                          </Text>
                          <View
                            style={[
                              styles.flexibleBadge,
                              { backgroundColor: colors.background.tertiary },
                            ]}
                          >
                            <Text style={[styles.flexibleText, { color: colors.text.secondary }]}>
                              {vipPackages.monthly.badge}
                            </Text>
                          </View>
                        </View>
                        <Text variant="bodySmall" color="text.secondary">
                          {vipPackages.monthly.subtitle}
                        </Text>
                      </View>
                    </View>
                    <Text variant="hero" fontSize={28} color="text.primary" style={{ marginTop: 12 }}>
                      {vipPackages.monthly.price}
                    </Text>
                    {vipPackages.monthly.trialText && (
                      <Text style={[styles.trialText, { color: colors.success.DEFAULT }]}>
                        ✓ {vipPackages.monthly.trialText}
                      </Text>
                    )}
                  </Pressable>
                </View>
              )}

              {/* Benefits List */}
              <View style={styles.benefitsSection}>
                <Text variant="h4" color="text.primary" style={styles.benefitsSectionTitle}>
                  {isPremium ? 'Your Active Benefits' : 'VIP Benefits'}
                </Text>
                {VIP_BENEFITS.map((benefit, index) => (
                  <BenefitCard key={benefit.title} benefit={benefit} index={index} />
                ))}
              </View>

              {/* Action Buttons */}
              <View style={styles.footerActions}>
                <Button variant="ghost" size="sm" onPress={handleRestore}
  accessibilityLabel="Restore purchases button"
  accessibilityRole="button"
  accessibilityHint="Activates this control">
                  Restore purchases
                </Button>

                {!isLoading && !error && !isPremium && (
                  <Button
                    onPress={handlePurchase}
                    variant="primary"
                    size="lg"
                    fullWidth
                    haptic="success"
                    style={{
                      backgroundColor: VIP_ACCENT,
                    }}

                  accessibilityLabel="`} button"
                  accessibilityRole="button"
                  accessibilityHint="Activates this control">
                    {selectedPlan === 'annual' && vipPackages.annual.trialText
                      ? 'Start Free Trial'
                      : selectedPlan === 'monthly' && vipPackages.monthly.trialText
                        ? 'Start Free Trial'
                        : `Subscribe ${selectedPlan === 'annual' ? 'Annual' : 'Monthly'}`}
                  </Button>
                )}

                {isPremium && (
                  <Button variant="secondary" size="lg" fullWidth isDisabled
  accessibilityLabel="VIP Active 👑 button"
  accessibilityRole="button"
  accessibilityHint="Activates this control">
                    VIP Active 👑
                  </Button>
                )}
              </View>

              {/* Terms */}
              {!isPremium && (
                <Text variant="caption" color="text.tertiary" style={styles.terms}>
                  Subscriptions auto-renew. Cancel anytime in your device settings.{' '}
                  {vipPackages[selectedPlan].trialText
                    ? 'Free trial converts to paid subscription unless cancelled.'
                    : ''}
                </Text>
              )}
            </>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

export default VipPaywallScreen;
