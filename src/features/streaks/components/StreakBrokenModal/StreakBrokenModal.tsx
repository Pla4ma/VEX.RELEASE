import { captureSilentFailure } from '../../../../utils/silent-failure';
import React from 'react';
import { Modal, useWindowDimensions } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { useReducedMotion } from '../../../../hooks/useReducedMotion';
import { Box } from '../../../../components/primitives/Box';
import { Text } from '../../../../components/primitives/Text';
import { Button } from '../../../../components/primitives/Button';
import { useTheme } from '../../../../theme/ThemeContext';
import { useState } from 'react';
import type { StreakBrokenModalProps } from './types';
import { calculateRestoreCost } from './helpers';
import {
  LossStat,
  WhatRemains,
  ComebackBonus,
  CoachMessage,
} from './Subcomponents';
import { RestoreStreakCard } from './RestoreStreakCard';
import { Text as VexText } from '../../../../components/primitives/Text';

export function StreakBrokenModal({
  visible,
  brokenStreakDays,
  lostMultiplier,
  longestStreak,
  comebackBonus,
  coachMessage,
  onStartFresh,
  onDismiss,
  userId: _userId,
  onRestoreStreak,
  gemsBalance = 0,
  onRestoreStart,
}: StreakBrokenModalProps): React.ReactNode {
  const { theme } = useTheme();
  const { isReducedMotion } = useReducedMotion();
  const { width: SCREEN_WIDTH } = useWindowDimensions();
  const [isRestoring, setIsRestoring] = useState(false);
  const [restoreError, setRestoreError] = useState<string | null>(null);

  const handleRestore = async () => {
    if (!onRestoreStreak) {
      return;
    }
    const cost = calculateRestoreCost(brokenStreakDays);
    setIsRestoring(true);
    setRestoreError(null);
    onRestoreStart?.();
    try {
      const success = await onRestoreStreak(cost);
      if (success) {
        onDismiss();
      } else {
        setRestoreError('Failed to restore streak. Please try again.');
      }
    } catch (error) {
      captureSilentFailure(error, {
        feature: 'streaks',
        operation: 'network-fallback',
        type: 'network',
      });
      setRestoreError('An error occurred. Please try again.');
    } finally {
      setIsRestoring(false);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
    >
      <Box
        flex={1}
        bg={`${theme.colors.background.primary}95`}
        justifyContent="center"
        alignItems="center"
        px="lg"
      >
        <Animated.View
          entering={isReducedMotion ? undefined : FadeIn.duration(300)}
          style={{ width: SCREEN_WIDTH - 40, maxHeight: '80%' }}
        >
          <Box
            bg="background.secondary"
            borderRadius="2xl"
            borderWidth={1}
            borderColor="border.light"
            overflow="hidden"
          >
            {/* Header */}
            <Box
              bg={`${theme.colors.error.DEFAULT}15`}
              p="xl"
              alignItems="center"
              gap="sm"
            >
              <Text fontSize={48}>💨</Text>
              <Text variant="h2" color="text.primary" textAlign="center">
                Streak Ended
              </Text>
              <Text variant="body" color="text.secondary" textAlign="center">
                Your {brokenStreakDays}-day streak has been reset
              </Text>
            </Box>

            {/* Body */}
            <Box p="xl" gap="lg">
              <Box flexDirection="row" justifyContent="space-around">
                <LossStat
                  emoji="🔥"
                  value={`${brokenStreakDays}`}
                  label="Days lost"
                  isLoss
                />
                <LossStat
                  emoji="✨"
                  value={`${lostMultiplier.toFixed(1)}×`}
                  label="Multiplier"
                  isLoss
                />
              </Box>

              <WhatRemains longestStreak={longestStreak} />

              <ComebackBonus bonus={comebackBonus} />

              <CoachMessage message={coachMessage} />

              {onRestoreStreak && (
                <RestoreStreakCard
                  brokenStreakDays={brokenStreakDays}
                  gemsBalance={gemsBalance}
                  onRestore={handleRestore}
                  isRestoring={isRestoring}
                />
              )}
              {restoreError && (
                <Box
                  p="md"
                  bg={`${theme.colors.error.DEFAULT}15`}
                  borderRadius="lg"
                >
                  <Text color="error.DEFAULT" variant="body" textAlign="center">
                    {restoreError}
                  </Text>
                </Box>
              )}
            </Box>

            {/* Footer */}
            <Box
              p="xl"
              gap="md"
              style={{
                borderTopWidth: 1,
                borderTopColor: theme.colors.border.light,
              }}
            >
              <Button variant="primary"
                size="lg"
                fullWidth
                onPress={onStartFresh}
                accessibilityLabel="Start fresh streak"
                accessibilityRole="button"
                accessibilityHint="Double tap to activate"
              >
                <VexText>🔥 Start Fresh</VexText>
              </Button>
              <Button variant="ghost"
                size="md"
                fullWidth
                onPress={onDismiss}
                accessibilityLabel="Dismiss streak recovery"
                accessibilityRole="button"
                accessibilityHint="Double tap to activate"
              >
                <VexText>Not now</VexText>
              </Button>
            </Box>
          </Box>
        </Animated.View>
      </Box>
    </Modal>
  );
}

export default StreakBrokenModal;
