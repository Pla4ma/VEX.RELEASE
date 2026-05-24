import React, { useCallback, useState } from 'react';
import Animated, { FadeInUp } from 'react-native-reanimated';

import { Box, Button, Text } from '../../../components/primitives';
import { getPremiumCardStyle } from '../../../components/premiumStyles';
import { buildPremiumCompletionReward } from '../../../features/session-completion/premium-completion-reward';
import type { ChestResult } from '../../../features/rewards/chest-engine';
import type { SessionSummary } from '../../../session/types';
import { useTheme } from '../../../theme';

type SessionPremiumChestCardProps = {
  chestResult: ChestResult | null;
  isOpened: boolean;
  summary: SessionSummary;
  onOpen: () => void;
  onOpenInventory?: () => void;
  onOpenShop?: () => void;
};

export function SessionPremiumChestCard({
  chestResult,
  isOpened,
  summary,
  onOpen,
  onOpenInventory,
  onOpenShop,
}: SessionPremiumChestCardProps): JSX.Element {
  const { theme } = useTheme();
  const [opened, setOpened] = useState(isOpened);
  const reward = buildPremiumCompletionReward({ chestResult, summary });

  const handleOpen = useCallback((): void => {
    if (opened) {
      return;
    }
    setOpened(true);
    onOpen();
  }, [onOpen, opened]);

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
          PREMIUM CHEST
        </Text>
        <Text variant="h3" color={theme.colors.text.primary} mt={2}>
          {opened ? reward.title : 'A premium win is ready'}
        </Text>
        <Text variant="body" color={theme.colors.text.secondary} mt={2}>
          {opened
            ? `+${reward.xp} XP. Your Focus Credits reflect deep work quality.`
            : 'Open your session reward. Progress Intelligence tracks every strong session.'}
        </Text>
        {opened && reward.cosmeticLabel ? (
          <Text variant="label" color={theme.colors.success.DEFAULT} mt={3}>
            {reward.cosmeticLabel} unlocked for your Visual Identity.
          </Text>
        ) : null}
        {!opened ? (
          <Box mt={4}>
            <Button
              accessibilityHint="Opens your premium completion chest"
              accessibilityLabel="Open premium completion chest"
              accessibilityRole="button"
              onPress={handleOpen}
            >
              Open chest
            </Button>
          </Box>
        ) : onOpenInventory || onOpenShop ? (
          <Box mt={4} flexDirection="row" gap={3}>
            {onOpenInventory ? (
              <Box flex={1}>
                <Button
                  accessibilityHint="Opens your lightweight owned rewards collection"
                  accessibilityLabel="View collection"
                  accessibilityRole="button"
                  onPress={onOpenInventory}
                  variant="outline"
                >
                  Collection
                </Button>
              </Box>
            ) : null}
            {onOpenShop ? (
              <Box flex={1}>
                <Button
                  accessibilityHint="Opens the curated premium shop"
                  accessibilityLabel="Open curated shop"
                  accessibilityRole="button"
                  onPress={onOpenShop}
                  variant="ghost"
                >
                  Shop
                </Button>
              </Box>
            ) : null}
          </Box>
        ) : null}
      </Box>
    </Animated.View>
  );
}
