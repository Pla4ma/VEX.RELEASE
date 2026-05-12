import React, { useEffect, useMemo, useState } from 'react';
import { ScrollView, View } from 'react-native';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import type { ExtendedRootStackParams } from '../../navigation/types';
import { capture } from '../../shared/analytics';
import { usePaywall, usePremiumStatus, type PurchasesPackageDisplayInfo } from '../../shared/monetization';
import { PurchaseEvents, createPaywallProperties } from '../../shared/monetization/purchase-events';
import { StaggeredEnter } from '../../shared/ui/components/EnterAnimation';
import { useTheme } from '../../theme';
import { PaywallHero } from './PaywallHero';
import { PaywallFooterActions, PaywallPlanList } from './PaywallPlans';
import {
  PaywallErrorState,
  PaywallLoadingState,
  PaywallStatusMessageBanner,
  PaywallUnavailableState,
  type PaywallStatusMessage,
} from './PaywallStates';
import {
  FEATURE_HIGHLIGHT_MAP,
  buildPackageSelection,
  type PaywallPlanSelection,
} from './paywall-copy';
import { paywallStyles as styles } from './paywall-styles';
import { withScreenErrorBoundary } from '../../shared/ui/components/ScreenErrorBoundary';

type NavigationProp = NativeStackNavigationProp<ExtendedRootStackParams>;
type PaywallRouteProp = RouteProp<ExtendedRootStackParams, 'Paywall'>;

function isPlanSelection(
  value: PaywallPlanSelection | PurchasesPackageDisplayInfo | undefined,
): value is PaywallPlanSelection {
  return Boolean(value && 'packageInfo' in value);
}

export const PaywallScreen = withScreenErrorBoundary(function _PaywallScreen(): JSX.Element {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<PaywallRouteProp>();
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const { offerings, packages, isLoading, error, purchase, restore, retry } = usePaywall();
  const { isPremium, refresh } = usePremiumStatus();
  const [statusMessage, setStatusMessage] = useState<PaywallStatusMessage | null>(null);

  const source = route.params?.source ?? 'unknown';
  const gatedFeature = route.params?.gatedFeature ?? 'premium_access';
  const featureHighlight = FEATURE_HIGHLIGHT_MAP[gatedFeature];
  const hasLivePackages = packages.length > 0;
  const packageSelection = useMemo(() => buildPackageSelection(packages), [packages]);

  useEffect(() => {
    capture(
      PurchaseEvents.PAYWALL_VIEWED,
      createPaywallProperties(
        offerings?.identifier ?? 'fallback-offering',
        source,
        packages.map((item) => ({
          identifier: item.identifier,
          hasTrial: Boolean(item.product.introPrice),
        })),
      ),
    );
  }, [offerings?.identifier, packages, source]);

  const handleClose = (): void => {
    capture(PurchaseEvents.PAYWALL_DISMISSED, {
      paywall_source: source,
      gated_feature: gatedFeature,
    });
    navigation.goBack();
  };

  const handlePurchase = async (
    planOrPackage: PaywallPlanSelection | PurchasesPackageDisplayInfo | undefined,
  ): Promise<void> => {
    setStatusMessage(null);
    const packageInfo = isPlanSelection(planOrPackage) ? planOrPackage.packageInfo : planOrPackage;

    if (!packageInfo) {
      setStatusMessage({
        tone: 'warning',
        title: 'Plans are still loading',
        body: 'Live purchase options are still being prepared. Give it a moment, then try again.',
      });
      return;
    }

    const result = await purchase(packageInfo);
    if (result.success) {
      await refresh();
      setStatusMessage({
        tone: 'celebration',
        title: 'Premium is active',
        body: 'Your strongest coaching, continuity support, and deeper insights are ready.',
      });
      navigation.goBack();
      return;
    }

    setStatusMessage({
      tone: 'warning',
      title: 'Purchase did not go through',
      body: 'Nothing was charged here in VEX. Please try again, or restore if you already subscribed.',
    });
  };

  const handleRestore = async (): Promise<void> => {
    setStatusMessage({
      tone: 'info',
      title: 'Checking your purchases',
      body: 'We are refreshing your entitlements now.',
    });
    const result = await restore();
    await refresh();
    setStatusMessage(
      result.success
        ? {
            tone: 'celebration',
            title: 'Purchases restored',
            body: 'Your premium entitlements have been refreshed on this device.',
          }
        : {
            tone: 'warning',
            title: 'Restore did not complete',
            body: 'If you already subscribed, try again on a stronger connection or sign in with the same store account.',
          },
    );
  };

  return (
    <View style={[styles.screen, { backgroundColor: theme.colors.background.primary }]}>
      <ScrollView
        contentContainerStyle={{ paddingTop: insets.top + 20, paddingBottom: insets.bottom + 32 }}
        showsVerticalScrollIndicator={false}
      >
        <StaggeredEnter direction="up" speed="normal" staggerDelay={80} containerStyle={styles.content}>
          <PaywallHero
            featureHighlight={featureHighlight}
            isPremium={isPremium}
            showBoundary={!isLoading && !error}
            theme={theme}
            onClose={handleClose}
          />

          {statusMessage ? (
            <PaywallStatusMessageBanner
              statusMessage={statusMessage}
              onDismiss={() => setStatusMessage(null)}
            />
          ) : null}

          {isLoading ? (
            <PaywallLoadingState />
          ) : error ? (
            <PaywallErrorState theme={theme} onRestore={handleRestore} onRetry={retry} />
          ) : !hasLivePackages ? (
            <PaywallUnavailableState onRestore={handleRestore} onRetry={retry} />
          ) : (
            <PaywallPlanList plans={packageSelection} theme={theme} onPurchase={handlePurchase} />
          )}

          <PaywallFooterActions
            hasLivePackages={hasLivePackages}
            isLoading={isLoading}
            isPremium={isPremium}
            plans={packageSelection}
            onPurchase={handlePurchase}
            onRestore={handleRestore}
          />
        </StaggeredEnter>
      </ScrollView>
    </View>
  );
}, 'Paywall');

export default PaywallScreen;
