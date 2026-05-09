import { captureSilentFailure } from '../../../utils/silent-failure';
/**
 * StreakBrokenModal Component
 *
 * Appears on next app open after streak breaks.
 * Loss framing (not shame-based).
 * Shows what was lost, what remains, what's next.
 * Two CTAs: "Start fresh" and "Not now".
 *
 * PHASE 5.3 ENHANCEMENT:
 * - Emergency streak restore purchase option
 * - Cost scales: <7 days = 100 gems, 7-29 days = 200 gems, 30+ days = 500 gems
 * - Atomic wallet transaction via economyService.spend()
 * - StreakRestoreCeremony after successful purchase
 *
 * @phase 3C.2, 5.3
 */

import React from 'react';
import { Modal, Dimensions } from 'react-native';
import Animated, { FadeIn, FadeInUp, useAnimatedStyle, withSpring, withSequence, withTiming } from 'react-native-reanimated';

import { Box } from '../../../components/primitives/Box';
import { Text } from '../../../components/primitives/Text';
import { Button } from '../../../components/primitives/Button';
import { useTheme } from '../../../theme';
import { useState } from 'react';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export interface StreakBrokenModalProps {
  /** Visible state */ visible: boolean;
  /** Broken streak length */
  brokenStreakDays: number;
  /** Previous multiplier that was lost */
  lostMultiplier: number;
  /** User's longest streak (still intact) */
  longestStreak: number;
  /** Comeback bonus available */
  comebackBonus: {
    xpMultiplier: number;
    duration: number; // hours
  };
  /** AI coach message */
  coachMessage: string;
  /** Start fresh session */
  onStartFresh: () => void;
  /** Dismiss modal */
  onDismiss: () => void;
  /**
   * PHASE 5.3: Streak restore purchase
   */
  userId: string;
  /** Restore streak with gems (cost based on streak length) */
  onRestoreStreak?: (costGems: number) => Promise<boolean>;
  /** Current gem balance */
  gemsBalance?: number;
  /** Called when restore is in progress */
  onRestoreStart?: () => void;
}

/**
 * Loss stat card
 */
function LossStat({ emoji, value, label, isLoss = false }: { emoji: string; value: string; label: string; isLoss?: boolean }): JSX.Element {
  const { theme } = useTheme();

  return (
    <Box alignItems="center" gap="xs">
      <Text fontSize={32}>{emoji}</Text>
      <Text variant="h3" color={isLoss ? 'error.DEFAULT' : 'text.primary'} fontWeight="700">
        {value}
      </Text>
      <Text variant="caption" color="text.tertiary">
        {label}
      </Text>
    </Box>
  );
}

/**
 * What remains card
 */
function WhatRemains({ longestStreak }: { longestStreak: number }): JSX.Element {
  const { theme } = useTheme();

  return (
    <Box p="lg" borderRadius="xl" bg={`${theme.colors.success[500]}15`} borderWidth={1} borderColor="success.DEFAULT" alignItems="center" gap="sm">
      <Text fontSize={32}>🏆</Text>
      <Text variant="h4" color="text.primary">
        Your record stands
      </Text>
      <Text variant="body" color="text.secondary" textAlign="center">
        Longest streak: <Text fontWeight="700">{longestStreak} days</Text>
      </Text>
      <Text variant="caption" color="success.DEFAULT" fontWeight="600">
        Nothing can take that away!
      </Text>
    </Box>
  );
}

/**
 * Comeback bonus card
 */
function ComebackBonus({ bonus }: { bonus: StreakBrokenModalProps['comebackBonus'] }): JSX.Element {
  const { theme } = useTheme();

  return (
    <Box p="lg" borderRadius="xl" bg={`${theme.colors.accent.orange}15`} borderWidth={1} borderColor="accent.orange" alignItems="center" gap="sm">
      <Box flexDirection="row" alignItems="center" gap="sm">
        <Text fontSize={24}>⚡</Text>
        <Text variant="h4" color="accent.orange">
          Comeback Bonus Active
        </Text>
      </Box>
      <Text variant="body" color="text.secondary" textAlign="center">
        Complete sessions in the next {bonus.duration}h to earn{' '}
        <Text color="accent.orange" fontWeight="700">
          {bonus.xpMultiplier}× XP
        </Text>
      </Text>
    </Box>
  );
}

/**
 * Coach message
 */
function CoachMessage({ message }: { message: string }): JSX.Element {
  const { theme } = useTheme();

  return (
    <Box flexDirection="row" gap="md" p="md" borderRadius="lg" bg="background.secondary" alignItems="flex-start">
      <Box width={36} height={36} borderRadius="full" bg="accent.purple" justifyContent="center" alignItems="center">
        <Text fontSize={16}>🤖</Text>
      </Box>
      <Box flex={1}>
        <Text variant="caption" color="accent.purple" fontWeight="600" mb="xs">
          AI Coach
        </Text>
        <Text variant="body" color="text.secondary">
          {message}
        </Text>
      </Box>
    </Box>
  );
}

/**
 * Calculate restore cost based on streak length
 * <7 days = 100 gems, 7-29 days = 200 gems, 30+ days = 500 gems
 */
function calculateRestoreCost(streakDays: number): number {
  if (streakDays < 7) {
    return 100;
  }
  if (streakDays < 30) {
    return 200;
  }
  return 500;
}

/**
 * Streak restore option card
 */
function RestoreStreakCard({ brokenStreakDays, gemsBalance = 0, onRestore, isRestoring }: { brokenStreakDays: number; gemsBalance: number; onRestore: () => void; isRestoring: boolean }): JSX.Element | null {
  const { theme } = useTheme();
  const cost = calculateRestoreCost(brokenStreakDays);
  const canAfford = gemsBalance >= cost;

  return (
    <Box p="lg" borderRadius="xl" bg={`${theme.colors.primary[500]}15`} borderWidth={1} borderColor="primary.DEFAULT" gap="sm">
      <Box flexDirection="row" alignItems="center" gap="sm">
        <Text fontSize={24}>💎</Text>
        <Text variant="h4" color="primary.DEFAULT">
          Restore Your Streak
        </Text>
      </Box>
      <Text variant="body" color="text.secondary">
        Don't lose your {brokenStreakDays}-day progress!
      </Text>
      <Box flexDirection="row" alignItems="center" justifyContent="space-between" mt="sm">
        <Box>
          <Text variant="caption" color="text.tertiary">
            COST
          </Text>
          <Text variant="h4" color={canAfford ? 'primary.DEFAULT' : 'error.DEFAULT'}>
            {cost} 💎
          </Text>
        </Box>
        <Box alignItems="flex-end">
          <Text variant="caption" color="text.tertiary">
            BALANCE
          </Text>
          <Text variant="body" color={canAfford ? 'text.secondary' : 'error.DEFAULT'}>
            {gemsBalance} 💎
          </Text>
        </Box>
      </Box>
      <Button variant={canAfford ? 'primary' : 'secondary'} size="md" fullWidth onPress={onRestore} isLoading={isRestoring} disabled={!canAfford || isRestoring} style={{ marginTop: theme.spacing[2] }} accessibilityLabel="gems`} button" accessibilityRole="button" accessibilityHint="Activates this control">
        {canAfford ? '💎 Restore Streak' : `Need ${cost} gems`}
      </Button>
      {!canAfford && (
        <Text variant="caption" color="error.DEFAULT" textAlign="center">
          Not enough gems to restore
        </Text>
      )}
    </Box>
  );
}

/**
 * Streak broken modal
 */
export function StreakBrokenModal({ visible, brokenStreakDays, lostMultiplier, longestStreak, comebackBonus, coachMessage, onStartFresh, onDismiss, userId, onRestoreStreak, gemsBalance = 0, onRestoreStart }: StreakBrokenModalProps): JSX.Element {
  const { theme } = useTheme();
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
      captureSilentFailure(error, { feature: 'streaks', operation: 'network-fallback', type: 'network' });
      setRestoreError('An error occurred. Please try again.');
    } finally {
      setIsRestoring(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade" statusBarTranslucent>
      <Box flex={1} bg={`${theme.colors.background.primary}95`} justifyContent="center" alignItems="center" px="lg">
        <Animated.View
          entering={FadeIn.duration(300)}
          style={{
            width: SCREEN_WIDTH - 40,
            maxHeight: '80%',
          }}
        >
          <Box bg="background.secondary" borderRadius="2xl" borderWidth={1} borderColor="border.light" overflow="hidden">
            {/* Header */}
            <Box bg={`${theme.colors.error.DEFAULT}15`} p="xl" alignItems="center" gap="sm">
              <Text fontSize={48}>💨</Text>
              <Text variant="h2" color="text.primary" textAlign="center">
                Streak Ended
              </Text>
              <Text variant="body" color="text.secondary" textAlign="center">
                Your {brokenStreakDays}-day streak has been reset
              </Text>
            </Box>

            {/* Stats */}
            <Box p="xl" gap="lg">
              <Box flexDirection="row" justifyContent="space-around">
                <LossStat emoji="🔥" value={`${brokenStreakDays}`} label="Days lost" isLoss />
                <LossStat emoji="✨" value={`${lostMultiplier.toFixed(1)}×`} label="Multiplier" isLoss />
              </Box>

              {/* What remains */}
              <WhatRemains longestStreak={longestStreak} />

              {/* Comeback bonus */}
              <ComebackBonus bonus={comebackBonus} />

              {/* Coach message */}
              <CoachMessage message={coachMessage} />

              {/* PHASE 5.3: Streak Restore Option */}
              {onRestoreStreak && <RestoreStreakCard brokenStreakDays={brokenStreakDays} gemsBalance={gemsBalance} onRestore={handleRestore} isRestoring={isRestoring} />}
              {restoreError && (
                <Box p="md" bg={`${theme.colors.error.DEFAULT}15`} borderRadius="lg">
                  <Text color="error.DEFAULT" variant="body" textAlign="center">
                    {restoreError}
                  </Text>
                </Box>
              )}
            </Box>

            {/* CTAs */}
            <Box
              p="xl"
              gap="md"
              style={{
                borderTopWidth: 1,
                borderTopColor: theme.colors.border.light,
              }}
            >
              <Button variant="primary" size="lg" fullWidth onPress={onStartFresh} accessibilityLabel="🔥 Start Fresh button" accessibilityRole="button" accessibilityHint="Activates this control">
                🔥 Start Fresh
              </Button>
              <Button variant="ghost" size="md" fullWidth onPress={onDismiss} accessibilityLabel="Not now button" accessibilityRole="button" accessibilityHint="Activates this control">
                Not now
              </Button>
            </Box>
          </Box>
        </Animated.View>
      </Box>
    </Modal>
  );
}

export default StreakBrokenModal;
