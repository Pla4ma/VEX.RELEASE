/**
 * StreakInsuranceCard
 *
 * Purchase and status card for Streak Insurance.
 * Shows in StreakWidget when streak >= 7 days.
 * Deducts 500 gems on purchase, auto-restores streak on break.
 */

import React from 'react';
import { Pressable } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { Box } from '../../../components/primitives/Box';
import { Text } from '../../../components/primitives/Text';
import { useTheme } from '../../../theme';
import * as Haptics from '../../../utils/haptics';
import type { InsuranceStatus } from '../StreakInsurance';

interface StreakInsuranceCardProps {
  status: InsuranceStatus | null;
  isLoading: boolean;
  error: Error | null;
  currentStreakDays: number;
  gemBalance: number;
  onPurchase: () => void;
  isPurchasing: boolean;
  purchaseError: Error | null;
}

export function StreakInsuranceCard({
  status,
  isLoading,
  error,
  currentStreakDays,
  gemBalance,
  onPurchase,
  isPurchasing,
  purchaseError,
}: StreakInsuranceCardProps): JSX.Element | null {
  const { theme } = useTheme();

  // Only show for 7+ day streaks
  if (currentStreakDays < 7) {return null;}

  if (isLoading) {
    return (
      <Box
        mt="sm"
        padding="sm"
        borderRadius="lg"
        borderWidth={1}
        borderColor="border.subtle"
        bg="background.elevated"
        height={60}
      />
    );
  }

  if (error) {
    return null; // silent - insurance is enhancement, not critical
  }

  const canAfford = gemBalance >= 500;
  const isActive = status?.hasActiveInsurance ?? false;
  const daysRemaining = status?.daysRemaining ?? 0;

  return (
    <Animated.View entering={FadeIn.duration(300)}>
      <Box
        mt="sm"
        padding="sm"
        borderRadius="lg"
        borderWidth={1}
        borderColor={isActive ? 'success.500' : 'border.subtle'}
        bg={isActive ? 'success.50' : 'background.elevated'}
      >
        <Box flexDirection="row" alignItems="center" justifyContent="space-between">
          <Box flexDirection="row" alignItems="center" gap="xs">
            <Text fontSize={16}>🛡️</Text>
            <Box>
              <Text variant="label" weight="semibold">
                {isActive ? 'Streak Protected' : 'Streak Insurance'}
              </Text>
              <Text variant="caption" color="text.secondary">
                {isActive
                  ? `Active — ${daysRemaining} day${daysRemaining !== 1 ? 's' : ''} remaining`
                  : 'Miss a day without losing your streak'}
              </Text>
            </Box>
          </Box>

          {!isActive && (
            <Pressable
              onPress={() => {
                void Haptics.triggerHaptic('impactMedium');
                onPurchase();
              }}
              disabled={isPurchasing || !canAfford}
              style={{
                backgroundColor: canAfford
                  ? theme.colors.primary[500]
                  : theme.colors.background.tertiary,
                borderRadius: theme.borderRadius.md,
                paddingVertical: theme.spacing[2],
                paddingHorizontal: theme.spacing[3],
                opacity: isPurchasing ? 0.6 : 1,
              }}
              accessibilityLabel="Purchase streak insurance for 500 gems"
              accessibilityRole="button"
              accessibilityHint="Protects your streak if you miss one day"
            >
              <Text
                variant="caption"
                weight="semibold"
                color={canAfford ? 'background.primary' : 'text.tertiary'}
              >
                {isPurchasing ? '...' : '500 💎'}
              </Text>
            </Pressable>
          )}
        </Box>

        {purchaseError && (
          <Text variant="caption" color="error.500" mt="xs">
            Purchase failed — check your gem balance and try again.
          </Text>
        )}

        {!canAfford && !isActive && (
          <Text variant="caption" color="text.tertiary" mt="xs">
            Need 500 gems. You have {gemBalance}.
          </Text>
        )}
      </Box>
    </Animated.View>
  );
}
