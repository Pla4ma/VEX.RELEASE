import React from 'react';
import Animated, { FadeInUp } from 'react-native-reanimated';

import { Box, Button, Text } from '../../../components/primitives';
import { getPremiumCardStyle } from '../../../components/premiumStyles';
import { buildPremiumCompletionReward } from '../../../features/session-completion/premium-completion-reward';
import type { ChestResult } from '../../../features/rewards/chest-engine';
import type { SessionSummary } from '../../../session/types';
import { useTheme } from '../../../theme';

type SessionPremiumChestCardProps = {
  chestResult: ChestResult | null;
  summary: SessionSummary;
  onOpenPaywall?: () => void;
};

export function SessionPremiumChestCard({
  chestResult,
  summary,
  onOpenPaywall,
}: SessionPremiumChestCardProps): JSX.Element {
  const { theme } = useTheme();
  const reward = buildPremiumCompletionReward({ chestResult, summary });

  return (
    <Animated.View entering={FadeInUp.duration(360)}>
      <Box
        mx={6}
        mt={5}
        p={5}
        borderRadius={theme.borderRadius.lg}
        style={{
          backgroundColor: theme.colors.background.secondary,
          borderColor: theme.colors.primary[500],
          borderWidth: 1,
          ...getPremiumCardStyle('medium'),
        }}
      >
        <Text variant="label" color={theme.colors.primary[400]}>
          PREMIUM INSIGHT
        </Text>
        <Text variant="h3" color={theme.colors.text.primary} mt={2}>
          {reward.title}
        </Text>
        <Text variant="body" color={theme.colors.text.secondary} mt={2}>
          {reward.description}
        </Text>
        {onOpenPaywall ? (
          <Box mt={4}>
            <Button
              accessibilityHint="Opens premium plans only when live billing is available"
              accessibilityLabel={reward.cta}
              accessibilityRole="button"
              onPress={onOpenPaywall}
            >
              {reward.cta}
            </Button>
          </Box>
        ) : null}
      </Box>
    </Animated.View>
  );
}
