import React, { useEffect, useMemo, useState } from 'react';
import { ScrollView, View } from 'react-native';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button } from '../../../components/primitives/Button';
import { Text } from '../../../components/primitives/Text';
import type { ExtendedRootStackParams } from '../../../navigation/types';
import { capture } from '../../analytics/analytics-service';
import { StatusBanner } from '../../ui/components/StatusFeedback';
import { useTheme } from '../../../theme/ThemeContext';
import { PurchaseEvents, createPaywallProperties } from '../purchase-events';
import { usePaywall, usePremiumStatus } from '../use-revenuecat';
import { PREMIUM_BENEFITS, type PaywallPlan } from './paywall-data';
import { PlanCard, BenefitList } from './PaywallComponents';
import { usePaywallActions } from './usePaywallActions';
import { VipPaywallSkeleton } from './VipPaywallSkeleton';
import { Text as VexText } from '../../../components/primitives/Text';

type NavigationProp = NativeStackNavigationProp<ExtendedRootStackParams>;
type VipPaywallRouteProp = RouteProp<ExtendedRootStackParams, 'VipPaywall'>;

export function VipPaywallScreen(): React.ReactNode {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<VipPaywallRouteProp>();
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const { offerings, packages, isLoading, error, purchase, restore, retry } =
    usePaywall();
  const { isPremium, isLoading: isLoadingPremium, refresh } = usePremiumStatus();
  const [selectedPlan, setSelectedPlan] = useState<PaywallPlan>('annual');
  const source = route.params?.source ?? 'unknown';
  const spacing = theme.spacing;

  const premiumPackages = useMemo(
    () => ({
      annual: packages.find(
        (item) => item.packageType.toUpperCase() === 'ANNUAL',
      ),
      monthly: packages.find(
        (item) => item.packageType.toUpperCase() === 'MONTHLY',
      ),
    }),
    [packages],
  );

  const { statusMessage, setStatusMessage, handleClose, handlePurchase, handleRestore } = usePaywallActions({
    navigation,
    source,
    isPremium,
    selectedPlan,
    premiumPackages,
    purchase,
    restore,
    refresh,
  });

  useEffect(() => {
    capture(
      PurchaseEvents.PAYWALL_VIEWED,
      createPaywallProperties(
        offerings?.identifier ?? 'premium-offering',
        source,
        packages.map((item) => ({
          identifier: item.identifier,
          hasTrial: Boolean(item.product.introPrice),
        })),
      ),
    );
  }, [offerings?.identifier, packages, source]);

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background.primary }}>
      <ScrollView contentContainerStyle={{
          paddingTop: insets.top + spacing[5],
          paddingBottom: insets.bottom + spacing[8],
          paddingHorizontal: spacing[5],
          gap: spacing[4],
        }}
      >
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: spacing[4] }}>
          <View style={{ flex: 1, gap: spacing[2] }}>
            <Text variant="caption" color="text.secondary">
              VEX Premium
            </Text>
            <Text variant="h1" color="text.primary">
              {isPremium ? 'Premium is active' : 'Turn sessions into a system'}
            </Text>
            <Text variant="body" color="text.secondary">
              {isPremium
                ? 'Your deeper execution tools are active.'
                : 'Premium adds deeper coach memory, progress intelligence, and advanced work systems. The free focus loop stays useful.'}
            </Text>
          </View>
          <Button variant="ghost"
            onPress={handleClose}
            size="sm"
            accessibilityLabel="Close Premium paywall"
            accessibilityRole="button"
            accessibilityHint="Closes this screen."
          >
            <VexText>Close</VexText>
          </Button>
        </View>

        {statusMessage ? (
          <StatusBanner
            status={
              statusMessage.tone === 'warning'
                ? 'error'
                : statusMessage.tone === 'celebration'
                  ? 'success'
                  : 'loading'
            }
            message={statusMessage.title}
            description={statusMessage.body}
            onDismiss={() => setStatusMessage(null)}
          />
        ) : null}

        {isLoading || isLoadingPremium ? (
          <VipPaywallSkeleton />
        ) : error ? (
          <StatusBanner
            status="error"
            message="Could not load Premium options"
            description="Pricing temporarily unavailable. Try again in a moment."
            onRetry={retry}
          />
        ) : (
          <View style={{ gap: spacing[3] }}>
            {!isPremium ? (
              <>
                <PlanCard
                  plan="annual"
                  isSelected={selectedPlan === 'annual'}
                  priceString={premiumPackages.annual?.product.priceString}
                  onSelect={setSelectedPlan}
                />
                <PlanCard
                  plan="monthly"
                  isSelected={selectedPlan === 'monthly'}
                  priceString={premiumPackages.monthly?.product.priceString}
                  onSelect={setSelectedPlan}
                />
              </>
            ) : null}
            <BenefitList benefits={PREMIUM_BENEFITS} />
          </View>
        )}

        <Button variant="ghost"
          size="sm"
          onPress={handleRestore}
          accessibilityLabel="Restore purchases"
          accessibilityRole="button"
          accessibilityHint="Checks the app store for existing VEX Premium entitlements."
        >
          <VexText>Restore purchases</VexText>
        </Button>
        {!isPremium && !isLoading && !error ? (
          <Button
            onPress={handlePurchase}
            variant="primary"
            size="lg"
            fullWidth
            accessibilityLabel="Subscribe to selected Premium plan"
            accessibilityRole="button"
            accessibilityHint="Starts the store purchase flow for the selected plan."
          >
            <VexText>Subscribe {selectedPlan === 'annual' ? 'Annual' : 'Monthly'}</VexText>
          </Button>
        ) : null}
      </ScrollView>
    </View>
  );
}

export { VipPaywallScreen as default };
