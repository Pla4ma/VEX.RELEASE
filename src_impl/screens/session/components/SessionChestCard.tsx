import React from 'react';
import { Box, Button, Text } from '../../../components/primitives';
import { getPremiumCardStyle } from '../../../components/premiumStyles';
import { ChestReveal } from '../../../features/rewards/components/chest-reveal';
import { PremiumChestEffects } from '../../../features/rewards/components/PremiumChestEffects';
import type { ChestResult } from '../../../features/rewards/chest-engine';
import { useTheme } from '../../../theme';

type SessionChestCardProps = {
  chestError: string | null;
  chestResult: ChestResult | null;
  chestTierColor?: string;
  chestTierLabel?: string;
  onChestOpen: () => void;
  onChestRetry: () => void;
  onRevealComplete: () => void;
  width: number;
};

export function SessionChestCard({
  chestError,
  chestResult,
  chestTierColor,
  chestTierLabel,
  onChestOpen,
  onChestRetry,
  onRevealComplete,
  width,
}: SessionChestCardProps) {
  const { theme } = useTheme();
  return (
    <Box width={width} px={24} pb={148} justifyContent="center">
      <Box flex={1} justifyContent="center">
        {chestResult ? <Box alignItems="center" gap={18}>
          <Text variant="label" color={chestTierColor}>{chestTierLabel}</Text>
          <PremiumChestEffects>
            <ChestReveal result={chestResult} onOpen={onChestOpen} onRevealComplete={onRevealComplete} />
          </PremiumChestEffects>
        </Box> : chestError ? <Box p={20} style={{ backgroundColor: theme.colors.background.secondary, borderWidth: 1, borderColor: theme.colors.error.DEFAULT, ...getPremiumCardStyle('large') }}>
          <Text variant="label" color={theme.colors.error.DEFAULT}>CHEST UNAVAILABLE</Text>
          <Text variant="body" color={theme.colors.text.primary} mt={10}>{chestError}</Text>
          <Box mt={16}><Button variant="outline" size="md" fullWidth onPress={onChestRetry}
  accessibilityLabel="Retry Chest button"
  accessibilityRole="button"
  accessibilityHint="Activates this control">Retry Chest</Button></Box>
        </Box> : <Box p={20} style={{ backgroundColor: theme.colors.background.secondary, borderWidth: 1, borderColor: theme.colors.border.light, ...getPremiumCardStyle('large') }}>
          <Text variant="body" color={theme.colors.text.secondary} textAlign="center">Your reward chest is loading in the background.</Text>
        </Box>}
      </Box>
    </Box>
  );
}
