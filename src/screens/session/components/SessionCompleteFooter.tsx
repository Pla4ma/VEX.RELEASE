import React from 'react';

import Animated, { FadeInUp } from 'react-native-reanimated';

import { Box, Button } from '../../../components/primitives';
import type { Theme } from '../../../theme/types';

export function SessionCompleteFooter({
  bottomInset,
  homeCtaLabel,
  nextSessionLabel,
  onOpenReflection,
  onStartNextSession,
  onShare,
  showCtas,
  theme,
}: {
  bottomInset: number;
  homeCtaLabel: string;
  nextSessionLabel: string;
  onOpenReflection: () => void;
  onStartNextSession: () => void;
  onShare?: () => void;
  showCtas: boolean;
  theme: Theme;
}) {
  if (!showCtas) {
    return null;
  }

  return (
    <Animated.View entering={FadeInUp.delay(120).duration(320)}>
      <Box
        position="absolute"
        left={0}
        right={0}
        bottom={0}
        px={6}
        pt={4}
        pb={bottomInset}
        style={{
          backgroundColor: `${theme.colors.background.primary}F2`,
          borderTopColor: theme.colors.border.light,
          borderTopWidth: 1,
        }}
      >
        {/* PHASE 17.2: Share Button */}
        {onShare && (
          <Box mb={3}>
            <Button variant="ghost" size="md" fullWidth onPress={onShare}
  accessibilityLabel="Share Your Session button"
  accessibilityRole="button"
  accessibilityHint="Activates this control">
              Share Your Session
            </Button>
          </Box>
        )}
        <Box flexDirection="row" gap={3}>
          <Box flex={1}>
            <Button variant="outline" size="lg" fullWidth onPress={onStartNextSession}
  accessibilityLabel="Action button"
  accessibilityRole="button"
  accessibilityHint="Activates this control">
              {nextSessionLabel}
            </Button>
          </Box>
          <Box flex={1}>
            <Button size="lg" fullWidth onPress={onOpenReflection}
  accessibilityLabel="Action button"
  accessibilityRole="button"
  accessibilityHint="Activates this control">
              {homeCtaLabel}
            </Button>
          </Box>
        </Box>
      </Box>
    </Animated.View>
  );
}
