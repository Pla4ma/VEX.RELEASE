import React from 'react';
import { Pressable } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { useReducedMotion } from '../../../hooks/useReducedMotion';
import { Box } from '../../../components/primitives/Box';
import { Text } from '../../../components/primitives/Text';
import { useTheme } from '../../../theme/ThemeContext';
import * as Haptics from '../../../utils/haptics';
import type { BossPreviewCardProps } from './BossPreviewCard.types';
import { BossPreviewSkeleton, HealthBar, EscapeTimer } from './BossPreviewCard.subcomponents';
import {
  TierBadge,
  BossTauntBubble,
  DefeatIndicator,
  FinalStrikeIndicator,
} from './BossPreviewCard.indicators';

export type { BossPreviewCardProps } from './BossPreviewCard.types';

export function BossPreviewCard({
  bossName,
  healthPercent,
  hoursRemaining,
  estimatedDamage,
  tier,
  wouldDefeat,
  onPress,
  isLoading = false,
  isFinalStrike = false,
  taunt,
  activeBountyCount,
  maxBounties = 4,
  onPlaceBounty,
  isPlacingBounty = false,
  bountyError = null,
  coinBalance,
  BOUNTY_COST = 50,
}: BossPreviewCardProps): React.ReactNode {
  const { theme } = useTheme();
  const { isReducedMotion } = useReducedMotion();
  if (isLoading) {
    return <BossPreviewSkeleton />;
  }
  const isNearDeath = healthPercent <= 15;
  const showFinalStrike = isFinalStrike || (isNearDeath && !wouldDefeat);
  return (
    <Pressable
      onPress={onPress}
      accessibilityLabel={`Boss ${bossName}, ${Math.round(healthPercent)} percent health`}
      accessibilityRole="button"
      accessibilityHint="Double tap to view boss details"
    >
      <Animated.View entering={isReducedMotion ? undefined : FadeIn.duration(400).delay(200)}>
        <Box
          m="lg"
          p="lg"
          borderRadius="xl"
          bg={theme.colors.background.secondary}
          borderWidth={showFinalStrike ? 3 : isNearDeath ? 2 : 1}
          borderColor={
            showFinalStrike
              ? theme.colors.error[500]
              : wouldDefeat
                ? theme.colors.success[500]
                : theme.colors.border.DEFAULT
          }
          style={
            showFinalStrike
              ? {
                  shadowColor: theme.colors.error[500],
                  shadowOffset: { width: 0, height: 0 },
                  shadowOpacity: 0.5,
                  shadowRadius: 10,
                  elevation: 8,
                }
              : undefined
          }
        >
          {}
          {taunt && <BossTauntBubble taunt={taunt} />}
          {}
          <Box flexDirection="row" alignItems="center" gap="md" mb="md">
            {}
            <Box
              width={56}
              height={56}
              borderRadius="lg"
              bg={theme.colors.background.tertiary}
              justifyContent="center"
              alignItems="center"
              borderWidth={showFinalStrike ? 2 : 1}
              borderColor={
                showFinalStrike
                  ? theme.colors.error[500]
                  : theme.colors.border.DEFAULT
              }
            >
              <Text fontSize={28} />
            </Box>
            <Box flex={1} gap="xs">
              <Box flexDirection="row" alignItems="center" gap="sm">
                <Text variant="h4" color="text.primary" numberOfLines={1}>
                  {bossName}
                </Text>
              </Box>
              <TierBadge tier={tier} />
            </Box>
            {showFinalStrike && <FinalStrikeIndicator />}
            {!showFinalStrike && wouldDefeat && <DefeatIndicator />}
          </Box>
          {}
          <HealthBar healthPercent={healthPercent} />
          {}
          <Box
            flexDirection="row"
            justifyContent="space-between"
            alignItems="center"
            mt="md"
          >
            <EscapeTimer hoursRemaining={hoursRemaining} />
            {estimatedDamage && estimatedDamage > 0 && (
              <Box flexDirection="row" alignItems="center" gap="xs">
                <Text fontSize={12} />
                <Text variant="caption" color="text.secondary">
                  ~{estimatedDamage} dmg this session
                </Text>
              </Box>
            )}
          </Box>
          {}
          {onPlaceBounty && (
            <Box
              mt="sm"
              pt="sm"
              borderTopWidth={1}
              borderTopColor="border.subtle"
              flexDirection="row"
              alignItems="center"
              justifyContent="space-between"
            >
              <Box>
                <Text variant="caption" color="text.secondary">
                  Boss Bounty
                </Text>
                {activeBountyCount !== undefined && activeBountyCount > 0 ? (
                  <Text variant="caption" color="warning.500" fontWeight="600">
                    {activeBountyCount}× active — 2× loot next session
                  </Text>
                ) : (
                  <Text variant="caption" color="text.tertiary">
                    50 coins for 2× loot chance
                  </Text>
                )}
              </Box>
              <Pressable
                onPress={() => {
                  Haptics.triggerHaptic('impactLight');
                  onPlaceBounty?.();
                }}
                disabled={
                  isPlacingBounty ||
                  (coinBalance !== undefined && coinBalance < BOUNTY_COST) ||
                  (activeBountyCount !== undefined &&
                    activeBountyCount >= maxBounties)
                }
                style={{
                  backgroundColor: theme.colors.warning[500],
                  borderRadius: theme.borderRadius.md,
                  paddingVertical: theme.spacing[2],
                  paddingHorizontal: theme.spacing[3],
                  opacity: isPlacingBounty ? 0.6 : 1,
                }}
                accessibilityLabel="Place boss bounty for 50 coins"
                accessibilityRole="button"
                accessibilityHint="Doubles your loot chance from the next session that damages this boss"
              >
                <Text
                  variant="caption"
                  fontWeight="600"
                  color="background.primary"
                >
                  {isPlacingBounty ? '...' : '50 coins'}
                </Text>
              </Pressable>
            </Box>
          )}
          {bountyError && (
            <Text variant="caption" color="error.500" mt="xs">
              {bountyError}
            </Text>
          )}
        </Box>
      </Animated.View>
    </Pressable>
  );
}