import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, View } from 'react-native';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button } from '../../../components/primitives/Button';
import { Text } from '../../../components/primitives/Text';
import type { ExtendedRootStackParams } from '../../../navigation/types';
import { capture } from '../../analytics';
import { StatusBanner } from '../../ui/components/StatusFeedback';
import { useTheme } from '../../../theme';
import { PurchaseEvents, createPaywallProperties } from '../purchase-events';
import { usePaywall, usePremiumStatus } from '../use-revenuecat';

const VIP_BENEFITS = [
  ['Unlimited AI coach conversations', 'Ask for strategy, reflection, and next-session guidance whenever you need it.'],
  ['Monthly Focus Report', 'See your focus windows, session patterns, and what changed this month.'],
  ['Advanced analytics', 'Find when you focus best and which session types actually work for you.'],
  ['Premium companion cosmetics', 'Customize companion elements and visual themes.'],
  ['Cosmetic season track access', 'Earn premium seasonal looks while core progress stays free.'],
  ['Extra personal quests', 'Get more targeted quests based on your real focus history.'],
] as const;

type NavigationProp = NativeStackNavigationProp<ExtendedRootStackParams>;
type VipPaywallRouteProp = RouteProp<ExtendedRootStackParams, 'VipPaywall'>;

export function VipPaywallScreen(): JSX.Element {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<VipPaywallRouteProp>();
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const { offerings, packages, isLoading, error, purchase, restore, retry } = usePaywall();
  const { isPremium, isLoading: isLoadingPremium, refresh } = usePremiumStatus();
  const [selectedPlan, setSelectedPlan] = useState<'annual' | 'monthly'>('annual');
  const [statusMessage, setStatusMessage] = useState<{ title: string; body: string; tone: 'info' | 'warning' | 'celebration' } | null>(null);
  const source = route.params?.source ?? 'unknown';
  const spacing = theme.spacing;
  const radius = theme.borderRadius;

  const vipPackages = useMemo(() => ({
    annual: packages.find((item) => item.packageType.toUpperCase() === 'ANNUAL'),
    monthly: packages.find((item) => item.packageType.toUpperCase() === 'MONTHLY'),
  }), [packages]);

  useEffect(() => {
    capture(PurchaseEvents.PAYWALL_VIEWED, createPaywallProperties(
      offerings?.identifier ?? 'vip-offering',
      source,
      packages.map((item) => ({
        identifier: item.identifier,
        hasTrial: Boolean(item.product.introPrice),
      })),
    ));
  }, [offerings?.identifier, packages, source]);

  const handleClose = (): void => {
    capture(PurchaseEvents.PAYWALL_DISMISSED, {
      paywall_source: source,
      gated_feature: 'vip_subscription',
    });
    navigation.goBack();
  };

  const handlePurchase = async (): Promise<void> => {
    const selectedPackage = selectedPlan === 'annual' ? vipPackages.annual : vipPackages.monthly;
    if (!selectedPackage) {
      setStatusMessage({ tone: 'warning', title: 'Plans loading', body: 'VIP options are still loading. Please wait a moment.' });
      return;
    }

    const result = await purchase(selectedPackage);
    if (result.success) {
      await refresh();
      setStatusMessage({ tone: 'celebration', title: 'Welcome to VIP', body: 'Your coaching, reports, analytics, and personalization are active.' });
      navigation.goBack();
      return;
    }

    setStatusMessage({ tone: 'warning', title: 'Purchase not completed', body: "Purchase didn't go through. Your card was not charged." });
  };

  const handleRestore = async (): Promise<void> => {
    setStatusMessage({ tone: 'info', title: 'Restoring purchases', body: 'Checking for existing VIP subscription.' });
    const result = await restore();
    await refresh();
    setStatusMessage(result.success
      ? { tone: 'celebration', title: 'Purchases restored', body: isPremium ? 'Your VIP status is active.' : 'No active subscriptions found.' }
      : { tone: 'warning', title: 'Restore failed', body: 'Try again with a stronger connection.' });
  };

  const renderPlan = (plan: 'annual' | 'monthly'): JSX.Element => {
    const packageInfo = plan === 'annual' ? vipPackages.annual : vipPackages.monthly;
    const isSelected = selectedPlan === plan;
    return (
      <Pressable
        key={plan}
        onPress={() => setSelectedPlan(plan)}
        style={{
          minHeight: spacing[12],
          padding: spacing[4],
          borderRadius: radius.md,
          borderWidth: isSelected ? 2 : 1,
          borderColor: isSelected ? theme.colors.primary[500] : theme.colors.border.DEFAULT,
          backgroundColor: theme.colors.background.secondary,
        }}
        accessibilityLabel={`Choose ${plan} VIP plan`}
        accessibilityRole="button"
        accessibilityHint="Selects this subscription option."
      >
        <Text variant="h4" color="text.primary">{plan === 'annual' ? 'Annual VIP' : 'Monthly VIP'}</Text>
        <Text variant="bodySmall" color="text.secondary">
          {packageInfo?.product.priceString ?? 'Live pricing loading'}
        </Text>
      </Pressable>
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background.primary }}>
      <ScrollView contentContainerStyle={{ paddingTop: insets.top + spacing[5], paddingBottom: insets.bottom + spacing[8], paddingHorizontal: spacing[5], gap: spacing[4] }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: spacing[4] }}>
          <View style={{ flex: 1, gap: spacing[2] }}>
            <Text variant="caption" color="text.secondary">VEX VIP</Text>
            <Text variant="h1" color="text.primary">{isPremium ? 'You are VIP' : 'Unlock deeper insight'}</Text>
            <Text variant="body" color="text.secondary">
              {isPremium ? 'Your premium growth tools are active.' : 'Premium adds coaching, reports, analytics, and personalization. The free focus loop stays useful.'}
            </Text>
          </View>
          <Button variant="ghost" onPress={handleClose} size="sm" accessibilityLabel="Close VIP paywall" accessibilityRole="button" accessibilityHint="Closes this screen.">Close</Button>
        </View>

        {statusMessage ? <StatusBanner status={statusMessage.tone === 'warning' ? 'error' : statusMessage.tone === 'celebration' ? 'success' : 'loading'} message={statusMessage.title} description={statusMessage.body} onDismiss={() => setStatusMessage(null)} /> : null}

        {isLoading || isLoadingPremium ? (
          <View style={{ alignItems: 'center', paddingVertical: spacing[6], gap: spacing[3] }}>
            <ActivityIndicator color={theme.colors.primary[500]} size="large" />
            <Text variant="bodySmall" color="text.secondary">Loading VIP options...</Text>
          </View>
        ) : error ? (
          <StatusBanner status="error" message="Could not load VIP options" description="Pricing temporarily unavailable. Try again in a moment." onRetry={retry} />
        ) : (
          <View style={{ gap: spacing[3] }}>
            {!isPremium ? [renderPlan('annual'), renderPlan('monthly')] : null}
            <View style={{ gap: spacing[3] }}>
              {VIP_BENEFITS.map(([title, description]) => (
                <View key={title} style={{ padding: spacing[4], borderRadius: radius.md, backgroundColor: theme.colors.background.secondary }}>
                  <Text variant="h4" color="text.primary">{title}</Text>
                  <Text variant="bodySmall" color="text.secondary">{description}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        <Button variant="ghost" size="sm" onPress={handleRestore} accessibilityLabel="Restore purchases" accessibilityRole="button" accessibilityHint="Checks the app store for existing VEX VIP entitlements.">Restore purchases</Button>
        {!isPremium && !isLoading && !error ? <Button onPress={handlePurchase} variant="primary" size="lg" fullWidth accessibilityLabel="Subscribe to selected VIP plan" accessibilityRole="button" accessibilityHint="Starts the store purchase flow for the selected plan.">Subscribe {selectedPlan === 'annual' ? 'Annual' : 'Monthly'}</Button> : null}
      </ScrollView>
    </View>
  );
}

export default VipPaywallScreen;
