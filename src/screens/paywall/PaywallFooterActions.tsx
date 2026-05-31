import React from 'react';
import { View } from 'react-native';

import { Button } from '../../components/primitives/Button';
import type { PaywallPlanSelection } from './paywall-copy';
import { paywallStyles as styles } from './paywall-styles';

type PaywallFooterActionsProps = {
  hasLivePackages: boolean;
  isLoading: boolean;
  isPremium: boolean;
  primaryCtaLabel?: string;
  plans: readonly PaywallPlanSelection[];
  onPurchase: (plan: PaywallPlanSelection | undefined) => void;
  onRestore: () => void;
};

export function PaywallFooterActions({
  hasLivePackages,
  isLoading,
  isPremium,
  primaryCtaLabel,
  plans,
  onPurchase,
  onRestore,
}: PaywallFooterActionsProps): JSX.Element {
  const annual = plans[0];
  const introPrice = annual?.packageInfo?.product.introPrice;
  const ctaLabel = introPrice
    ? `Try Free for ${introPrice.periodNumberOfUnits} ${introPrice.periodUnit?.toLowerCase() === 'day' ? 'Days' : introPrice.periodUnit}`
    : 'Continue with Annual';
  const primaryLabel = primaryCtaLabel ?? ctaLabel;

  return (
    <View style={styles.footerActions}>
      {!isLoading && !isPremium && hasLivePackages ? (
        <Button
          onPress={() => onPurchase(annual)}
          fullWidth
          size="lg"
          accessibilityLabel="Continue with Annual Premium"
          accessibilityRole="button"
          accessibilityHint="Starts the store purchase flow for the annual plan."
        >
          {primaryLabel}
        </Button>
      ) : null}
      {isPremium ? (
        <Button
          variant="secondary"
          size="lg"
          fullWidth
          isDisabled
          accessibilityLabel="Already Premium"
          accessibilityRole="button"
          accessibilityHint="Confirms this account already has VEX Premium."
        >
          Already Premium
        </Button>
      ) : null}
      <Button
        variant="ghost"
        size="sm"
        onPress={onRestore}
        accessibilityLabel="Restore purchases"
        accessibilityRole="button"
        accessibilityHint="Checks the app store for existing VEX Premium entitlements."
      >
        Restore Purchases
      </Button>
    </View>
  );
}
