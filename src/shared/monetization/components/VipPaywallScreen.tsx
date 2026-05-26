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

const PREMIUM_BENEFITS = [
  ['Deep Coach Memory', 'VEX remembers patterns, comeback style, best focus windows, and preferred push style.'],
  ['Monthly Focus Report', 'See rhythm, focus risk, recovery plans, and what changed this month.'],
  ['Progress Intelligence', 'Find when you focus best and which session types actually work for you.'],
  ['Advanced Study / Deep Work OS', 'Turn study, learning, and projects into review loops and smart next actions.'],
  ['Visual Identity', 'Shape companion forms, focus worlds, atmospheres, and premium animations.'],
  ['Premium Session Modes', 'Use Exam Sprint, Deep Work, Calm Reset, Boss Focus, Comeback, and Review modes.'],
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

  const premiumPackages = useMemo(() => ({
    annual: packages.find((item) => item.packageType.toUpperCase() === 'ANNUAL'),
    monthly: packages.find((item) => item.packageType.toUpperCase() === 'MONTHLY'),
  }), [packages]);

  useEffect(() => {
    capture(PurchaseEvents.PAYWALL_VIEWED, createPaywallProperties(
      offerings?.identifier ?? 'premium-offering',
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
      gated_feature: 'premium_subscription',
    });
    navigation.goBack();
  };

  const handlePurchase = async (): Promise<void> => {
    const selectedPackage = selectedPlan === 'annual' ? premiumPackages.annual : premiumPackages.monthly;
    if (!selectedPackage) {
      setStatusMessage({ tone: 'warning', title: 'Plans loading', body: 'Premium options are still loading. Please wait a moment.' });
      return;
    }

    const result = await purchase(selectedPackage);
    if (result.success) {
      await refresh();
      setStatusMessage({ tone: 'celebration', title: 'Premium is active', body: 'Deeper coach memory, reports, and progress intelligence are active.' });
      navigation.goBack();
      return;
    }

    setStatusMessage({ tone: 'warning', title: 'Purchase not completed', body: "Purchase didn't go through. Your card was not charged." });
  };

  const handleRestore = async (): Promise<void> => {
    setStatusMessage({ tone: 'info', title: 'Restoring purchases', body: 'Checking for existing Premium subscription.' });
    const result = await restore();
    await refresh();
    setStatusMessage(result.success
      ? { tone: 'celebration', title: 'Purchases restored', body: isPremium ? 'Your Premium status is active.' : 'No active subscriptions found.' }
      : { tone: 'warning', title: 'Restore failed', body: 'Try again with a stronger connection.' });
  };

  const renderPlan = (plan: 'annual' | 'monthly'): JSX.Element => {
    const packageInfo = plan === 'annual' ? premiumPackages.annual : premiumPackages.monthly;
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
        accessibilityLabel={`Choose ${plan} Premium plan`}
        accessibilityRole="button"
        accessibilityHint="Selects this subscription option."
      >
        <Text variant="h4" color="text.primary">{plan === 'annual' ? 'Annual Premium' : 'Monthly Premium'}</Text>
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
            <Text variant="caption" color="text.secondary">VEX Premium</Text>
            <Text variant="h1" color="text.primary">{isPremium ? 'Premium is active' : 'Turn sessions into a system'}</Text>
            <Text variant="body" color="text.secondary">
              {isPremium ? 'Your deeper execution tools are active.' : 'Premium adds deeper coach memory, progress intelligence, and advanced work systems. The free focus loop stays useful.'}
            </Text>
          </View>
          <Button variant="ghost" onPress={handleClose} size="sm" accessibilityLabel="Close Premium paywall" accessibilityRole="button" accessibilityHint="Closes this screen.">Close</Button>
        </View>

        {statusMessage ? <StatusBanner status={statusMessage.tone === 'warning' ? 'error' : statusMessage.tone === 'celebration' ? 'success' : 'loading'} message={statusMessage.title} description={statusMessage.body} onDismiss={() => setStatusMessage(null)} /> : null}

        {isLoading || isLoadingPremium ? (
          <View style={{ alignItems: 'center', paddingVertical: spacing[6], gap: spacing[3] }}>
            <ActivityIndicator color={theme.colors.primary[500]} size="large" />
            <Text variant="bodySmall" color="text.secondary">Loading Premium options...</Text>
          </View>
        ) : error ? (
          <StatusBanner status="error" message="Could not load Premium options" description="Pricing temporarily unavailable. Try again in a moment." onRetry={retry} />
        ) : (
          <View style={{ gap: spacing[3] }}>
            {!isPremium ? [renderPlan('annual'), renderPlan('monthly')] : null}
            <View style={{ gap: spacing[3] }}>
              {PREMIUM_BENEFITS.map(([title, description]) => (
                <View key={title} style={{ padding: spacing[4], borderRadius: radius.md, backgroundColor: theme.colors.background.secondary }}>
                  <Text variant="h4" color="text.primary">{title}</Text>
                  <Text variant="bodySmall" color="text.secondary">{description}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        <Button variant="ghost" size="sm" onPress={handleRestore} accessibilityLabel="Restore purchases" accessibilityRole="button" accessibilityHint="Checks the app store for existing VEX Premium entitlements.">Restore purchases</Button>
        {!isPremium && !isLoading && !error ? <Button onPress={handlePurchase} variant="primary" size="lg" fullWidth accessibilityLabel="Subscribe to selected Premium plan" accessibilityRole="button" accessibilityHint="Starts the store purchase flow for the selected plan.">Subscribe {selectedPlan === 'annual' ? 'Annual' : 'Monthly'}</Button> : null}
      </ScrollView>
    </View>
  );
}

export default VipPaywallScreen;
