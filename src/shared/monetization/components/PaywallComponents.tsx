import React from 'react';
import { Pressable, View } from 'react-native';
import { Text } from '@/components/primitives/Text';
import { useTheme } from '@/theme';
import type { PaywallPlan } from './paywall-data';

interface PlanCardProps {
  plan: PaywallPlan;
  isSelected: boolean;
  priceString: string | undefined;
  onSelect: (plan: PaywallPlan) => void;
}

export function PlanCard({
  plan,
  isSelected,
  priceString,
  onSelect,
}: PlanCardProps): React.ReactNode {
  const { theme } = useTheme();
  const spacing = theme.spacing;
  const radius = theme.borderRadius;

  return (
    <Pressable
      onPress={() => onSelect(plan)}
      style={{
        minHeight: spacing[12],
        padding: spacing[4],
        borderRadius: radius.md,
        borderWidth: isSelected ? 2 : 1,
        borderColor: isSelected
          ? theme.colors.primary[500]
          : theme.colors.border.DEFAULT,
        backgroundColor: theme.colors.background.secondary,
      }}
      accessibilityLabel={`Choose ${plan} Premium plan`}
      accessibilityRole="button"
      accessibilityHint="Selects this subscription option."
    >
      <Text variant="h4" color="text.primary">
        {plan === 'annual' ? 'Annual Premium' : 'Monthly Premium'}
      </Text>
      <Text variant="bodySmall" color="text.secondary">
        {priceString ?? 'Live pricing loading'}
      </Text>
    </Pressable>
  );
}

interface BenefitListProps {
  benefits: ReadonlyArray<readonly [string, string]>;
}

export function BenefitList({ benefits }: BenefitListProps): React.ReactNode {
  const { theme } = useTheme();
  const spacing = theme.spacing;
  const radius = theme.borderRadius;

  return (
    <View style={{ gap: spacing[3] }}>
      {benefits.map(([title, description]) => (
        <View
          key={title}
          style={{
            padding: spacing[4],
            borderRadius: radius.md,
            backgroundColor: theme.colors.background.secondary,
          }}
        >
          <Text variant="h4" color="text.primary">
            {title}
          </Text>
          <Text variant="bodySmall" color="text.secondary">
            {description}
          </Text>
        </View>
      ))}
    </View>
  );
}
