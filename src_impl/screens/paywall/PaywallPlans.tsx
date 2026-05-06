import React from 'react';
import { Pressable, View } from 'react-native';

import { Button } from '../../components/primitives/Button';
import { Text } from '../../components/primitives/Text';
import { CardEnterAnimation } from '../../shared/ui/components/EnterAnimation';
import type { Theme } from '../../theme';
import type { PaywallPlanSelection } from './paywall-copy';
import { paywallStyles as styles } from './paywall-styles';

type PaywallPlanListProps = {
  plans: readonly PaywallPlanSelection[];
  theme: Theme;
  onPurchase: (plan: PaywallPlanSelection) => void;
};

export function PaywallPlanList({
  plans,
  theme,
  onPurchase,
}: PaywallPlanListProps): JSX.Element {
  return (
    <View style={styles.planList}>
      {plans.map((plan) => (
        <CardEnterAnimation key={plan.id}>
          <PaywallPlanCard plan={plan} theme={theme} onPurchase={onPurchase} />
        </CardEnterAnimation>
      ))}
    </View>
  );
}

type PaywallPlanCardProps = {
  plan: PaywallPlanSelection;
  theme: Theme;
  onPurchase: (plan: PaywallPlanSelection) => void;
};

function PaywallPlanCard({ plan, theme, onPurchase }: PaywallPlanCardProps): JSX.Element {
  const hasTrial = Boolean(plan.packageInfo?.product.introPrice);

  return (
    <Pressable
      onPress={() => onPurchase(plan)}
      style={[
        styles.planCard,
        {
          backgroundColor: theme.colors.background.secondary,
          borderColor: plan.id === 'annual' ? theme.colors.primary[500] : theme.colors.border.DEFAULT,
          borderWidth: plan.id === 'annual' ? 2 : 1,
        },
      ]}
      accessibilityLabel={`Choose ${plan.title} Premium plan`}
      accessibilityRole="button"
      accessibilityHint="Starts the store purchase flow for this plan."
    >
      <View style={styles.planHeader}>
        <View>
          <Text style={[styles.planTitle, { color: theme.colors.text.primary }]}>{plan.title}</Text>
          <Text style={[styles.planSubtitle, { color: theme.colors.text.secondary }]}>
            {plan.subtitle}
          </Text>
        </View>
        <View style={styles.badgeContainer}>
          {hasTrial ? <TrialBadge theme={theme} /> : null}
          <View
            style={[
              styles.planBadge,
              {
                backgroundColor:
                  plan.id === 'annual'
                    ? theme.colors.primary[500]
                    : theme.colors.background.tertiary,
              },
            ]}
          >
            <Text
              style={[
                styles.planBadgeText,
                {
                  color:
                    plan.id === 'annual'
                      ? theme.colors.text.inverse
                      : theme.colors.text.secondary,
                },
              ]}
            >
              {plan.badge}
            </Text>
          </View>
        </View>
      </View>
      <Text style={[styles.planPrice, { color: theme.colors.text.primary }]}>
        {plan.displayPrice}
      </Text>
      {hasTrial && plan.packageInfo?.product.introPrice ? (
        <Text style={[styles.trialText, { color: theme.colors.success[500] }]}>
          {plan.packageInfo.product.introPrice.periodNumberOfUnits}{' '}
          {plan.packageInfo.product.introPrice.periodUnit?.toLowerCase()} free, then{' '}
          {plan.displayPrice.toLowerCase()}
        </Text>
      ) : null}
    </Pressable>
  );
}

function TrialBadge({ theme }: { theme: Theme }): JSX.Element {
  return (
    <View style={[styles.trialBadge, { backgroundColor: theme.colors.success[500] }]}>
      <Text style={[styles.trialBadgeText, { color: theme.colors.text.inverse }]}>Free trial</Text>
    </View>
  );
}

type PaywallFooterActionsProps = {
  hasLivePackages: boolean;
  isLoading: boolean;
  isPremium: boolean;
  plans: readonly PaywallPlanSelection[];
  onPurchase: (plan: PaywallPlanSelection | undefined) => void;
  onRestore: () => void;
};

export function PaywallFooterActions({
  hasLivePackages,
  isLoading,
  isPremium,
  plans,
  onPurchase,
  onRestore,
}: PaywallFooterActionsProps): JSX.Element {
  const annual = plans[0];
  const introPrice = annual?.packageInfo?.product.introPrice;
  const ctaLabel = introPrice
    ? `Try Free for ${introPrice.periodNumberOfUnits} ${introPrice.periodUnit?.toLowerCase() === 'day' ? 'Days' : introPrice.periodUnit}`
    : 'Continue with Annual';

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
          {ctaLabel}
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
