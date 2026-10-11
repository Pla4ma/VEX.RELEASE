import React from 'react';
import { Pressable, View } from 'react-native';

import { Text } from '../../components/primitives/Text';
import { CardEnterAnimation } from '../../shared/ui/components/EnterAnimation';
import type { Theme } from '../../theme';
import { vexFire } from '../../theme/tokens/vex-fire';
import type { PaywallPlanSelection } from './paywall-copy';
import { paywallStyles as styles } from './paywall-styles';
export { PaywallFooterActions } from './PaywallFooterActions';

type PaywallPlanListProps = {
  plans: readonly PaywallPlanSelection[];
  theme: Theme;
  onPurchase: (plan: PaywallPlanSelection) => void;
};

export function PaywallPlanList({
  plans,
  theme,
  onPurchase,
}: PaywallPlanListProps): React.ReactNode {
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

function PaywallPlanCard({
  plan,
  theme,
  onPurchase,
}: PaywallPlanCardProps): React.ReactNode {
  const hasTrial = Boolean(plan.packageInfo?.product.introPrice);

  return (
    <Pressable
      onPress={() => onPurchase(plan)}
      style={[
        styles.planCard,
        {
          backgroundColor: vexFire.panel,
          borderColor:
            plan.id === 'annual'
              ? vexFire.ember
              : vexFire.border,
          borderWidth: plan.id === 'annual' ? 2 : 1,
        },
      ]}
      accessibilityLabel={`Choose ${plan.title} Premium plan`}
      accessibilityRole="button"
      accessibilityHint="Starts the store purchase flow for this plan."
    >
      <View style={styles.planHeader}>
        <View>
          <Text
            style={[styles.planTitle, { color: vexFire.cream }]}
          >
            {plan.title}
          </Text>
          <Text
            style={[
              styles.planSubtitle,
              { color: vexFire.textSecondary },
            ]}
          >
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
                    ? vexFire.ember
                    : vexFire.backgroundSoft,
              },
            ]}
          >
            <Text
              style={[
                styles.planBadgeText,
                {
                  color:
                    plan.id === 'annual'
                      ? vexFire.cream
                      : vexFire.textSecondary,
                },
              ]}
            >
              {plan.badge}
            </Text>
          </View>
        </View>
      </View>
      <Text style={[styles.planPrice, { color: vexFire.cream }]}>
        {plan.displayPrice}
      </Text>
      {hasTrial && plan.packageInfo?.product.introPrice ? (
        <Text style={[styles.trialText, { color: vexFire.success }]}>
          {plan.packageInfo.product.introPrice.periodNumberOfUnits}{' '}
          {plan.packageInfo.product.introPrice.periodUnit?.toLowerCase()} free,
          then {plan.displayPrice.toLowerCase()}
        </Text>
      ) : null}
    </Pressable>
  );
}

function TrialBadge({ theme: _theme }: { theme: Theme }): React.ReactNode {
  return (
    <View
      style={[
        styles.trialBadge,
        { backgroundColor: vexFire.success },
      ]}
    >
      <Text
        style={[styles.trialBadgeText, { color: vexFire.cream }]}
      >
        Free trial
      </Text>
    </View>
  );
}
