/**
 * RivalWidget Component
 *
 * Home screen widget showing rival comparison.
 * "You: 240 min vs [Rival]: 210 min — YOU'RE AHEAD 🔥"
 * Real-time updates via Supabase subscription.
 *
 * @phase 4A.3
 */

import React, { useEffect } from 'react';
import { Pressable } from 'react-native';
import Animated, {
  useAnimatedStyle,
  withSpring,
  withRepeat,
  withSequence,
  withTiming,
  FadeIn,
} from 'react-native-reanimated';

import { Box } from '../../../components/primitives/Box';
import { Text } from '../../../components/primitives/Text';
import { useTheme } from '../../../theme';
import type { CurrentRival } from '../schemas';
import { useRivalStatus } from '../store';
import { getRivalStatusMessage, formatFocusMinutes } from '../service';

export interface RivalWidgetProps {
  /** Current rival data */
  rival: CurrentRival;
  /** Navigate to rival detail screen */
  onPress?: () => void;
  /** Loading state */
  isLoading?: boolean;
}

/**
 * Score bar showing comparison
 */
function ScoreBar({
  myScore,
  theirScore,
}: {
  myScore: number;
  theirScore: number;
}): JSX.Element {
  const { theme } = useTheme();
  const total = Math.max(myScore + theirScore, 1); // Avoid division by zero
  const myPercent = (myScore / total) * 100;
  const theirPercent = (theirScore / total) * 100;

  return (
    <Box height={8} borderRadius="full" bg="background.tertiary" overflow="hidden">
      <Box flexDirection="row" height="100%">
        {/* My score */}
        <Animated.View
          style={{
            height: '100%',
            backgroundColor: theme.colors.primary[500],
            borderTopLeftRadius: 4,
            borderBottomLeftRadius: 4,
            width: `${Math.max(myPercent, 5)}%`,
          }}
        />
        {/* Their score */}
        <Animated.View
          style={{
            height: '100%',
            backgroundColor: theme.colors.accent.purple,
            borderTopRightRadius: 4,
            borderBottomRightRadius: 4,
            width: `${Math.max(theirPercent, 5)}%`,
          }}
        />
      </Box>
    </Box>
  );
}

/**
 * Rival avatar with status indicator
 */
function RivalAvatar({
  name,
  avatarUrl,
  isWinning,
}: {
  name: string;
  avatarUrl?: string;
  isWinning: boolean;
}): JSX.Element {
  const { theme } = useTheme();

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [
      {
        scale: isWinning
          ? 1
          : withRepeat(
              withSequence(
                withTiming(1, { duration: 1500 }),
                withTiming(1.05, { duration: 1500 })
              ),
              -1,
              true
            ),
      },
    ],
  }));

  const initial = name.charAt(0).toUpperCase();

  return (
    <Animated.View style={pulseStyle}>
      <Box
        width={48}
        height={48}
        borderRadius="full"
        bg={isWinning ? 'background.tertiary' : 'accent.orange'}
        justifyContent="center"
        alignItems="center"
        borderWidth={2}
        borderColor={isWinning ? 'border.light' : 'accent.orange'}
      >
        {avatarUrl ? (
          <Box
            width={44}
            height={44}
            borderRadius="full"
            bg="primary.500"
          />
        ) : (
          <Text fontSize={20} color={isWinning ? 'text.tertiary' : 'text.inverse'} fontWeight="600">
            {initial}
          </Text>
        )}

        {/* Status indicator */}
        <Box
          position="absolute"
          bottom={-2}
          right={-2}
          width={20}
          height={20}
          borderRadius="full"
          bg={isWinning ? 'success.DEFAULT' : 'error.DEFAULT'}
          borderWidth={2}
          borderColor="background.primary"
          justifyContent="center"
          alignItems="center"
        >
          <Text fontSize={10}>{isWinning ? '↑' : '↓'}</Text>
        </Box>
      </Box>
    </Animated.View>
  );
}

/**
 * Rival widget component
 */
export function RivalWidget({ rival, onPress, isLoading = false }: RivalWidgetProps): JSX.Element {
  const { theme } = useTheme();
  const myScore = rival.weeklyScore.mine;
  const theirScore = rival.weeklyScore.theirs;
  const isAhead = myScore > theirScore;
  const isTied = myScore === theirScore;

  const status = getRivalStatusMessage(myScore, theirScore, rival.profile.name);

  return (
    <Animated.View entering={FadeIn.duration(400)}>
      <Pressable onPress={onPress}
  accessibilityLabel="Interactive control"
  accessibilityRole="button"
  accessibilityHint="Activates this control">
        <Box
          m="lg"
          p="lg"
          borderRadius="xl"
          bg="background.secondary"
          borderWidth={2}
          borderColor={isTied ? 'warning.DEFAULT' : isAhead ? 'success.DEFAULT' : 'error.DEFAULT'}
        >
          {/* Header */}
          <Box flexDirection="row" justifyContent="space-between" alignItems="center" mb="md">
            <Box flexDirection="row" alignItems="center" gap="sm">
              <Text fontSize={16}>⚔️</Text>
              <Text variant="label" color="text.tertiary">
                WEEKLY RIVALRY
              </Text>
            </Box>
            <Box
              px="sm"
              py="xs"
              borderRadius="full"
              bg={`${theme.colors.background.tertiary}`}
            >
              <Text variant="caption" color="text.tertiary">
                {rival.daysRemaining} days left
              </Text>
            </Box>
          </Box>

          {/* Rivals comparison */}
          <Box flexDirection="row" alignItems="center" gap="md" mb="md">
            {/* Me */}
            <Box alignItems="center" flex={1}>
              <Box
                width={48}
                height={48}
                borderRadius="full"
                bg="primary.500"
                justifyContent="center"
                alignItems="center"
              >
                <Text fontSize={16} color="text.inverse" fontWeight="700">
                  You
                </Text>
              </Box>
              <Text variant="h4" color="text.primary" fontWeight="700" mt="sm">
                {formatFocusMinutes(myScore)}
              </Text>
            </Box>

            {/* VS */}
            <Box alignItems="center">
              <Text
                variant="caption"
                color="text.tertiary"
                fontWeight="700"
                letterSpacing={2}
              >
                VS
              </Text>
            </Box>

            {/* Rival */}
            <Box alignItems="center" flex={1}>
              <RivalAvatar
                name={rival.profile.name}
                avatarUrl={rival.profile.avatarUrl}
                isWinning={!isAhead && !isTied}
              />
              <Text variant="h4" color="text.primary" fontWeight="700" mt="sm">
                {formatFocusMinutes(theirScore)}
              </Text>
              <Text variant="caption" color="text.tertiary">
                {rival.profile.name}
              </Text>
            </Box>
          </Box>

          {/* Score bar */}
          <ScoreBar myScore={myScore} theirScore={theirScore} />

          {/* Status message */}
          <Box
            mt="md"
            p="sm"
            borderRadius="lg"
            bg={
              status.tone === 'positive'
                ? `${theme.colors.success[500]}15`
                : status.tone === 'urgent'
                ? `${theme.colors.error[500]}15`
                : `${theme.colors.warning[500]}15`
            }
            alignItems="center"
          >
            <Text
              variant="bodySmall"
              color={
                status.tone === 'positive'
                  ? 'success.DEFAULT'
                  : status.tone === 'urgent'
                  ? 'error.DEFAULT'
                  : 'warning.DEFAULT'
              }
              fontWeight="600"
              textAlign="center"
            >
              {status.emoji} {status.message}
            </Text>
          </Box>

          {/* CTA hint */}
          <Box mt="sm" alignItems="center">
            <Text variant="caption" color="text.tertiary">
              Tap for details ›
            </Text>
          </Box>
        </Box>
      </Pressable>
    </Animated.View>
  );
}

/**
 * Empty state when no rival
 */
export function EmptyRivalWidget({
  onFindRival,
}: {
  onFindRival: () => void;
}): JSX.Element {
  const { theme } = useTheme();

  return (
    <Pressable onPress={onFindRival}
  accessibilityLabel="Interactive control"
  accessibilityRole="button"
  accessibilityHint="Activates this control">
      <Box
        m="lg"
        p="lg"
        borderRadius="xl"
        bg="background.tertiary"
        style={{
          borderWidth: 2,
          borderColor: theme.colors.border.light,
          borderStyle: 'dashed',
        }}
        alignItems="center"
        gap="md"
      >
        <Text fontSize={32}>⚔️</Text>
        <Text variant="h4" color="text.secondary" textAlign="center">
          Find Your Rival
        </Text>
        <Text variant="body" color="text.tertiary" textAlign="center">
          Compete weekly with someone at your level. Beat them with focus time!
        </Text>
        <Box
          px="md"
          py="sm"
          borderRadius="lg"
          bg="primary.500"
        >
          <Text variant="bodySmall" color="text.inverse" fontWeight="600">
            Find a Rival →
          </Text>
        </Box>
      </Box>
    </Pressable>
  );
}

export default RivalWidget;
