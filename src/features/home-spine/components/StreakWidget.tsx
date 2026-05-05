import React from 'react';
import { Pressable } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

import { Box } from '../../../components/primitives/Box';
import { Text } from '../../../components/primitives/Text';
import { useTheme } from '../../../theme';
import { AnimatedCounter } from '../../../shared/ui/components/AnimatedCounter';
import { StreakInsuranceCard } from '../../economy/components/StreakInsuranceCard';
import type { InsuranceStatus } from '../../economy/StreakInsurance';
import {
  FlameIcon,
  MultiplierBadge,
  RiskBanner,
  StreakWidgetSkeleton,
  WagerSection,
} from './StreakWidget.parts';
import type { ActiveStreakWager } from './streak-widget-types';

export interface StreakWidgetProps {
  currentDays: number;
  multiplier: number;
  hoursRemaining: number | null;
  riskLevel: 'NONE' | 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  longestStreak: number;
  onPress?: () => void;
  isLoading?: boolean;
  userId?: string;
  onWagerPress?: () => void;
  activeWager?: ActiveStreakWager | null;
  /** Streak Insurance - Phase 3 */
  insuranceStatus?: InsuranceStatus | null;
  insuranceIsLoading?: boolean;
  insuranceError?: Error | null;
  gemBalance?: number;
  onPurchaseInsurance?: () => void;
  isPurchasingInsurance?: boolean;
  purchaseInsuranceError?: Error | null;
}

export function StreakWidget({
  currentDays,
  multiplier,
  hoursRemaining,
  riskLevel,
  longestStreak,
  onPress,
  isLoading = false,
  onWagerPress,
  activeWager,
  userId,
  insuranceStatus,
  insuranceIsLoading,
  insuranceError,
  gemBalance,
  onPurchaseInsurance,
  isPurchasingInsurance,
  purchaseInsuranceError,
}: StreakWidgetProps): JSX.Element {
  const { theme } = useTheme();

  if (isLoading) {return <StreakWidgetSkeleton />;}

  const isEmpty = currentDays === 0;
  const isUrgent = riskLevel === 'CRITICAL' || riskLevel === 'HIGH';

  return (
    <Pressable
      onPress={onPress}
      accessibilityLabel="Open streak details"
      accessibilityRole="button"
      accessibilityHint="Shows streak status, rewards, and protection options"
    >
      <Animated.View entering={FadeIn.duration(400)}>
        <Box
          m="lg"
          p="lg"
          borderRadius="xl"
          bg={theme.colors.background.secondary}
          borderWidth={isUrgent ? 2 : 1}
          borderColor={isUrgent ? theme.colors.error.DEFAULT : theme.colors.border.DEFAULT}
        >
          <Box flexDirection="row" alignItems="center" gap="md">
            <Box
              width={64}
              height={64}
              borderRadius="full"
              bg={isUrgent ? `${theme.colors.error[500]}20` : theme.colors.background.tertiary}
              justifyContent="center"
              alignItems="center"
            >
              <FlameIcon riskLevel={riskLevel} currentDays={currentDays} size={32} />
            </Box>

            <Box flex={1} gap="xs">
              <Box flexDirection="row" alignItems="center" gap="sm">
                {isEmpty ? (
                  <Text variant="h3" color="text.primary">No streak yet</Text>
                ) : (
                  <Box flexDirection="row" alignItems="center" gap="xs">
                    <AnimatedCounter
                      value={currentDays}
                      size="lg"
                      color={theme.colors.text.primary}
                      duration={800}
                    />
                    <Text variant="h3" color="text.primary">-day streak</Text>
                  </Box>
                )}
              </Box>

              <Box flexDirection="row" alignItems="center" gap="sm">
                {isEmpty ? (
                  <Text variant="bodySmall" color="text.secondary">Start your streak today.</Text>
                ) : (
                  <>
                    <MultiplierBadge multiplier={multiplier} />
                    {longestStreak > currentDays && (
                      <Box flexDirection="row" alignItems="center" gap="xs">
                        <Text variant="caption" color="text.tertiary">Best:</Text>
                        <AnimatedCounter
                          value={longestStreak}
                          size="sm"
                          color={theme.colors.text.tertiary}
                          duration={600}
                        />
                      </Box>
                    )}
                  </>
                )}
              </Box>
            </Box>

            <Text fontSize={20} color={theme.colors.text.tertiary}>{'>'}</Text>
          </Box>

          <RiskBanner riskLevel={riskLevel} hoursRemaining={hoursRemaining} />
          <WagerSection
            currentDays={currentDays}
            activeWager={activeWager}
            onWagerPress={onWagerPress}
          />
          {currentDays >= 7 && userId && (
            <StreakInsuranceCard
              status={insuranceStatus ?? null}
              isLoading={insuranceIsLoading ?? false}
              error={insuranceError ?? null}
              currentStreakDays={currentDays}
              gemBalance={gemBalance ?? 0}
              onPurchase={onPurchaseInsurance ?? (() => {})}
              isPurchasing={isPurchasingInsurance ?? false}
              purchaseError={purchaseInsuranceError ?? null}
            />
          )}
        </Box>
      </Animated.View>
    </Pressable>
  );
}

export default StreakWidget;
