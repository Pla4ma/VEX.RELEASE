/**
 * UnlockBanner Component
 *
 * Shows unlock progress toward full Study OS.
 * Day 0: "Complete 5 study blocks to unlock"
 * During first week: progress indicator
 * Unlocked: hidden
 */
import React from 'react';
import Animated, { FadeInUp } from 'react-native-reanimated';

import { Box } from '../../../components/primitives/Box';
import { Text } from '../../../components/primitives/Text';
import { useTheme } from '../../../theme';
import type { StudyOsUnlockGate } from '../schemas';

const UNLOCK_SESSIONS_TARGET = 5;

export interface UnlockBannerProps {
  gate: StudyOsUnlockGate;
  currentSessions: number;
}

export function UnlockBanner({
  gate,
  currentSessions,
}: UnlockBannerProps): JSX.Element {
  const { theme } = useTheme();
  if (gate.isUnlocked) {return <></>;}

  const remaining = Math.max(
    0,
    UNLOCK_SESSIONS_TARGET - gate.completedSessions,
  );
  const progress = Math.min(1, gate.completedSessions / UNLOCK_SESSIONS_TARGET);

  return (
    <Animated.View entering={FadeInUp.duration(300)}>
      <Box
        p={3}
        borderRadius="lg"
        style={{
          backgroundColor: theme.colors.surface.card,
          borderWidth: 1,
          borderColor: theme.colors.border.light,
        }}
      >
        <Text
          variant="label"
          color="semantic.primary"
          textTransform="uppercase"
        >
          Study OS unlocks soon
        </Text>
        <Text variant="bodySmall" color="text.secondary" mt={1}>
          {gate.isDayZero
            ? 'Complete your first study block to begin unlocking Study OS.'
            : `${remaining} more session${remaining !== 1 ? 's' : ''} to unlock full Study OS.`}
        </Text>

        <Box
          mt={2}
          height={4}
          borderRadius="sm"
          style={{
            backgroundColor: theme.colors.border.light,
            overflow: 'hidden',
          }}
        >
          <Box
            height={4}
            borderRadius="sm"
            style={{
              backgroundColor: theme.colors.semantic.primary,
              width: `${Math.round(progress * 100)}%`,
            }}
          />
        </Box>

        <Text variant="caption" color="text.muted" mt={1} textAlign="right">
          {gate.completedSessions} / {UNLOCK_SESSIONS_TARGET} sessions
        </Text>
      </Box>
    </Animated.View>
  );
}
