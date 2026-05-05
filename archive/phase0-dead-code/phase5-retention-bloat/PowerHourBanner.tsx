/**
 * PowerHourBanner Component
 *
 * Golden banner on Home screen showing Power Hour countdown.
 * Shows countdown before and during the event.
 *
 * @phase 11.2
 */

import React, { useEffect, useState } from 'react';
import { Pressable } from 'react-native';
import Animated, {
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

import { Box } from '../../../components/primitives/Box';
import { Text } from '../../../components/primitives/Text';
import { Button } from '../../../components/primitives/Button';
import { useTheme } from '../../../theme';
import {
  type PowerHourStatus,
  formatPowerHourTime,
} from '../../liveops/PowerHourEvent';

export interface PowerHourBannerProps {
  /** Power Hour status */
  status: PowerHourStatus;
  /** Boss name */
  bossName: string;
  /** On press - navigate to session start */
  onPress: () => void;
  /** Compact mode */
  compact?: boolean;
}

/**
 * Golden shimmer animation
 */
function useGoldenShimmer(): ReturnType<typeof useAnimatedStyle> {
  return useAnimatedStyle(() => ({
    opacity: withRepeat(
      withSequence(
        withTiming(0.8, { duration: 1500 }),
        withTiming(1, { duration: 1500 })
      ),
      -1,
      true
    ),
    transform: [
      {
        scale: withRepeat(
          withSequence(
            withTiming(1, { duration: 2000 }),
            withTiming(1.01, { duration: 2000 })
          ),
          -1,
          true
        ),
      },
    ],
  }));
}

/**
 * Star sparkle animation
 */
function StarAnimation(): JSX.Element {
  const animatedStyle = useAnimatedStyle(() => ({
    opacity: withRepeat(
      withSequence(
        withTiming(0.3, { duration: 800 }),
        withTiming(1, { duration: 800 })
      ),
      -1,
      true
    ),
    transform: [
      {
        rotate: withRepeat(
          withSequence(
            withTiming('0deg', { duration: 2000 }),
            withTiming('180deg', { duration: 2000 })
          ),
          -1,
          true
        ),
      },
    ],
  }));

  return (
    <Animated.View style={animatedStyle}>
      <Text fontSize={24}>✨</Text>
    </Animated.View>
  );
}

/**
 * Power Hour Banner - Active state (golden)
 */
export function PowerHourBanner({
  status,
  onPress,
  compact = false,
}: PowerHourBannerProps): JSX.Element {
  const { theme } = useTheme();
  const shimmerStyle = useGoldenShimmer();
  const [displayTime, setDisplayTime] = useState(status.timeRemainingMinutes);

  useEffect(() => {
    setDisplayTime(status.timeRemainingMinutes);
    const interval = setInterval(() => {
      setDisplayTime((prev) => Math.max(0, prev - 1));
    }, 60000);
    return () => clearInterval(interval);
  }, [status.timeRemainingMinutes]);

  if (!status.isActive && !status.isPreAnnouncement) {
    return <React.Fragment />;
  }

  if (compact) {
    return (
      <Pressable onPress={onPress}
  accessibilityLabel="Interactive control"
  accessibilityRole="button"
  accessibilityHint="Activates this control">
        <Animated.View style={shimmerStyle}>
          <Box
            flexDirection="row"
            alignItems="center"
            gap="md"
            p="md"
            borderRadius="lg"
            style={{
              backgroundColor: '#F59E0B', // Amber/gold
              shadowColor: '#F59E0B',
              shadowOffset: { width: 0, height: 0 },
              shadowOpacity: 0.4,
              shadowRadius: 12,
              elevation: 8,
            }}
          >
            <StarAnimation />
            <Box flex={1}>
              <Text variant="caption" color="white" fontWeight="800">
                🌟 {status.isActive ? 'POWER HOUR LIVE' : 'POWER HOUR SOON'}
              </Text>
              <Text variant="body" color="white" fontWeight="600">
                {status.isActive
                  ? `${formatPowerHourTime(displayTime, true)} • 3× XP active`
                  : `${formatPowerHourTime(displayTime, false)} until 3× XP`}
              </Text>
            </Box>
            <Text fontSize={20}>→</Text>
          </Box>
        </Animated.View>
      </Pressable>
    );
  }

  return (
    <Pressable onPress={onPress}
  accessibilityLabel="Interactive control"
  accessibilityRole="button"
  accessibilityHint="Activates this control">
      <Animated.View style={shimmerStyle}>
        <Box
          p="xl"
          borderRadius="xl"
          style={{
            backgroundColor: status.isActive ? '#F59E0B' : '#1E293B',
            shadowColor: status.isActive ? '#F59E0B' : '#6366F1',
            shadowOffset: { width: 0, height: 0 },
            shadowOpacity: 0.3,
            shadowRadius: 20,
            elevation: 10,
          }}
        >
          {/* Header */}
          <Box flexDirection="row" alignItems="center" justifyContent="space-between" mb="md">
            <Box flexDirection="row" alignItems="center" gap="sm">
              <StarAnimation />
              <Text variant="caption" color={status.isActive ? 'white' : 'primary.500'} fontWeight="800">
                {status.isActive ? '🌟 POWER HOUR LIVE' : '⏰ POWER HOUR STARTING SOON'}
              </Text>
            </Box>
            <Box
              px="md"
              py="xs"
              borderRadius="full"
              style={{
                backgroundColor: status.isActive
                  ? 'rgba(255,255,255,0.3)'
                  : `${theme.colors.primary[500]}30`,
              }}
            >
              <Text variant="caption" color={status.isActive ? 'white' : 'primary.500'} fontWeight="700">
                {status.xpMultiplier}× XP
              </Text>
            </Box>
          </Box>

          {/* Main Content */}
          <Box alignItems="center" gap="sm" mb="lg">
            <Text
              variant="h2"
              color={status.isActive ? 'white' : 'text.primary'}
              fontWeight="900"
              textAlign="center"
            >
              {status.isActive ? 'Triple XP Active!' : 'Triple XP Coming'}
            </Text>

            <Text
              variant="body"
              color={status.isActive ? 'white' : 'text.secondary'}
              textAlign="center"
            >
              {status.isActive
                ? 'All sessions earn 3× XP for the next hour'
                : 'Mark your calendar — this is worth showing up for'}
            </Text>
          </Box>

          {/* Countdown */}
          <Box
            flexDirection="row"
            alignItems="center"
            justifyContent="center"
            gap="sm"
            mb="lg"
            p="md"
            borderRadius="lg"
            style={{
              backgroundColor: status.isActive
                ? 'rgba(0,0,0,0.2)'
                : theme.colors.background.tertiary,
            }}
          >
            <Text fontSize={28}>⏱️</Text>
            <Text
              fontSize={40}
              fontWeight="900"
              color={status.isActive ? 'white' : 'primary.500'}
            >
              {formatPowerHourTime(displayTime, status.isActive)}
            </Text>
            <Text variant="body" color={status.isActive ? 'white' : 'text.secondary'}>
              {status.isActive ? 'remaining' : 'until start'}
            </Text>
          </Box>

          {/* Participants (only when active) */}
          {status.isActive && status.participantsSoFar > 0 && (
            <Box alignItems="center" mb="lg">
              <Text variant="caption" color="white">
                {status.participantsSoFar} users already focusing this Power Hour
              </Text>
            </Box>
          )}

          {/* CTA Button */}
          <Button
            variant={status.isActive ? 'secondary' : 'primary'}
            size="lg"
            onPress={onPress}
            fullWidth

          accessibilityLabel="Action button"
          accessibilityRole="button"
          accessibilityHint="Activates this control">
            {status.isActive ? '⚡ Start Session — 3× XP!' : '👀 Preview Session Setup'}
          </Button>
        </Box>
      </Animated.View>
    </Pressable>
  );
}

/**
 * Power Hour post-event stat card
 * Shows after Power Hour ends: "X VEX users focused during Power Hour"
 */
export function PowerHourPostEventCard({
  participants,
}: {
  participants: number;
}): JSX.Element {
  const { theme } = useTheme();

  return (
    <Box
      p="lg"
      borderRadius="xl"
      bg="background.secondary"
      style={{
        borderLeftWidth: 4,
        borderLeftColor: '#F59E0B',
      }}
    >
      <Box flexDirection="row" alignItems="center" gap="md">
        <Text fontSize={32}>🌟</Text>
        <Box flex={1}>
          <Text variant="body" color="text.primary" fontWeight="600">
            Power Hour Complete!
          </Text>
          <Text variant="caption" color="text.secondary">
            {participants.toLocaleString()} VEX users focused this hour
          </Text>
        </Box>
      </Box>
    </Box>
  );
}

export default PowerHourBanner;
