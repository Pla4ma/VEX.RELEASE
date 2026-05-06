/**
 * LiveFocusingWidget Component
 *
 * Shows real-time count of people focusing on session start screen.
 * "Social proof" widget - "1,248 people focusing right now"
 *
 * @phase 10.6
 */

import React, { useState, useEffect, useCallback } from "react";
import { Pressable } from "react-native";
import Animated, { useAnimatedStyle, withRepeat, withSequence, withTiming, withDelay, FadeIn } from "react-native-reanimated";

import { Box } from "../../../components/primitives/Box";
import { Text } from "../../../components/primitives/Text";
import { Avatar } from "../../../components/Avatar";
import { useTheme } from "../../../theme";

// ============================================================================
// Types
// ============================================================================

export interface LiveFocusingData {
  /** Total number of people currently focusing */
  totalCount: number;
  /** Number of friends currently focusing */
  friendsCount: number;
  /** Number of squad members currently focusing */
  squadCount: number;
  /** Sample of avatars to display */
  sampleAvatars?: Array<{ url?: string; initials: string }>;
  /** Trend: 'up' | 'down' | 'stable' */
  trend?: "up" | "down" | "stable";
  /** Percentage change from last hour */
  trendPercent?: number;
}

interface LiveFocusingWidgetProps {
  /** Live data from server/realtime connection */
  data: LiveFocusingData;
  /** On press - show detailed breakdown */
  onPress?: () => void;
  /** Compact mode for smaller screens */
  compact?: boolean;
  /** Is loading state */
  isLoading?: boolean;
}

// ============================================================================
// Components
// ============================================================================

/**
 * Pulsing dot animation for "live" indicator
 */
function PulsingLiveDot(): JSX.Element {
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      {
        scale: withRepeat(withSequence(withTiming(1, { duration: 1000 }), withTiming(1.5, { duration: 1000 })), -1, true),
      },
    ],
    opacity: withRepeat(withSequence(withTiming(1, { duration: 1000 }), withTiming(0.5, { duration: 1000 })), -1, true),
  }));

  return (
    <Animated.View
      style={[
        {
          width: 8,
          height: 8,
          borderRadius: 4,
          backgroundColor: "#22C55E",
        },
        animatedStyle,
      ]}
    />
  );
}

/**
 * Animated avatar stack
 */
function AvatarStack({ avatars, maxDisplay = 4 }: { avatars?: Array<{ url?: string; initials: string }>; maxDisplay?: number }): JSX.Element {
  const { theme } = useTheme();

  if (!avatars || avatars.length === 0) {
    return (
      <Box flexDirection="row" alignItems="center">
        <Box width={32} height={32} borderRadius="full" justifyContent="center" alignItems="center" style={{ backgroundColor: theme.colors.background.tertiary }}>
          <Text fontSize={14}>👤</Text>
        </Box>
      </Box>
    );
  }

  const displayAvatars = avatars.slice(0, maxDisplay);
  const remaining = avatars.length - maxDisplay;

  return (
    <Box flexDirection="row" alignItems="center">
      {displayAvatars.map((avatar, index) => {
        const offset = index * -8; // Overlap effect
        return (
          <Box
            key={index}
            style={{
              marginLeft: index === 0 ? 0 : -8,
              zIndex: displayAvatars.length - index,
            }}
          >
            <Box width={32} height={32} borderRadius="full" borderWidth={2} borderColor="background.primary" style={{ overflow: "hidden" }}>
              <Avatar size="sm" source={avatar.url ? { uri: avatar.url } : undefined} name={avatar.initials} />
            </Box>
          </Box>
        );
      })}

      {remaining > 0 && (
        <Box
          width={32}
          height={32}
          borderRadius="full"
          justifyContent="center"
          alignItems="center"
          style={{
            marginLeft: -8,
            backgroundColor: theme.colors.background.tertiary,
            borderWidth: 2,
            borderColor: theme.colors.background.primary,
          }}
        >
          <Text variant="caption" color="text.primary" fontWeight="600">
            +{remaining}
          </Text>
        </Box>
      )}
    </Box>
  );
}

/**
 * Count up animation helper
 */
function useCountUp(target: number, duration: number = 1000): number {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const startTime = Date.now();
    const startValue = count;

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Easing function (ease-out)
      const easeOut = 1 - Math.pow(1 - progress, 3);
      const current = Math.floor(startValue + (target - startValue) * easeOut);

      setCount(current);

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [target, duration]);

  return count;
}

/**
 * Format number with commas
 */
function formatNumber(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + "M";
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + "K";
  }
  return num.toLocaleString();
}

/**
 * Trend indicator
 */
function TrendIndicator({ trend, percent }: { trend: "up" | "down" | "stable"; percent?: number }): JSX.Element {
  const icons = {
    up: "📈",
    down: "📉",
    stable: "➡️",
  };

  const colors = {
    up: "#22C55E",
    down: "#EF4444",
    stable: "#94A3B8",
  };

  return (
    <Box flexDirection="row" alignItems="center" gap="xs">
      <Text fontSize={12}>{icons[trend]}</Text>
      {percent !== undefined && percent > 0 && (
        <Text fontSize={12} color={trend === "up" ? "success.DEFAULT" : trend === "down" ? "error.DEFAULT" : "text.tertiary"}>
          {trend === "up" ? "+" : ""}
          {percent}%
        </Text>
      )}
    </Box>
  );
}

// ============================================================================
// Main Component
// ============================================================================

/**
 * Live Focusing Widget - Social proof on session start
 */
export function LiveFocusingWidget({ data, onPress, compact = false, isLoading = false }: LiveFocusingWidgetProps): JSX.Element {
  const { theme } = useTheme();
  const animatedCount = useCountUp(data.totalCount);

  if (compact) {
    return (
      <Pressable onPress={onPress} accessibilityLabel="Interactive control" accessibilityRole="button" accessibilityHint="Activates this control">
        <Box flexDirection="row" alignItems="center" gap="md" p="md" borderRadius="lg" bg="background.secondary">
          <PulsingLiveDot />
          <Box flex={1}>
            <Text variant="body" color="text.primary" fontWeight="600">
              {formatNumber(animatedCount)} people focusing
            </Text>
            <Text variant="caption" color="text.secondary">
              {data.friendsCount > 0 && `${data.friendsCount} friends • `}
              {data.squadCount > 0 && `${data.squadCount} squad `}
              Join them!
            </Text>
          </Box>
          <AvatarStack avatars={data.sampleAvatars} maxDisplay={3} />
        </Box>
      </Pressable>
    );
  }

  return (
    <Animated.View entering={FadeIn.duration(400)}>
      <Pressable onPress={onPress} accessibilityLabel="Interactive control" accessibilityRole="button" accessibilityHint="Activates this control">
        <Box
          p="xl"
          borderRadius="xl"
          bg="background.secondary"
          borderWidth={1}
          borderColor="border.light"
          gap="lg"
          style={{
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.05,
            shadowRadius: 4,
            elevation: 2,
          }}
        >
          {/* Header */}
          <Box flexDirection="row" alignItems="center" justifyContent="space-between">
            <Box flexDirection="row" alignItems="center" gap="sm">
              <PulsingLiveDot />
              <Text variant="caption" color="success.DEFAULT" fontWeight="600">
                LIVE NOW
              </Text>
            </Box>
            {data.trend && <TrendIndicator trend={data.trend} percent={data.trendPercent} />}
          </Box>

          {/* Main Count */}
          <Box alignItems="center" gap="sm">
            <Box flexDirection="row" alignItems="center" gap="sm">
              <AvatarStack avatars={data.sampleAvatars} maxDisplay={4} />
            </Box>

            <Text fontSize={48} fontWeight="900" color="text.primary" textAlign="center">
              {formatNumber(animatedCount)}
            </Text>

            <Text variant="h3" color="text.primary" textAlign="center">
              people focusing right now
            </Text>

            <Text variant="body" color="text.secondary" textAlign="center">
              You're not alone in this journey
            </Text>
          </Box>

          {/* Breakdown */}
          <Box flexDirection="row" justifyContent="space-between" p="md" borderRadius="lg" bg="background.tertiary">
            <Box alignItems="center">
              <Text fontSize={20} fontWeight="700" color="primary.500">
                {data.friendsCount}
              </Text>
              <Text variant="caption" color="text.tertiary">
                Friends
              </Text>
            </Box>

            <Box width={1} height={40} bg="border.light" />

            <Box alignItems="center">
              <Text fontSize={20} fontWeight="700" color="accent.purple">
                {data.squadCount}
              </Text>
              <Text variant="caption" color="text.tertiary">
                Squad
              </Text>
            </Box>

            <Box width={1} height={40} bg="border.light" />

            <Box alignItems="center">
              <Text fontSize={20} fontWeight="700" color="text.primary">
                {formatNumber(data.totalCount - data.friendsCount - data.squadCount)}
              </Text>
              <Text variant="caption" color="text.tertiary">
                Global
              </Text>
            </Box>
          </Box>

          {/* CTA */}
          <Box alignItems="center">
            <Text variant="caption" color="primary.500" fontWeight="600">
              Tap to see who's focusing →
            </Text>
          </Box>
        </Box>
      </Pressable>
    </Animated.View>
  );
}

/**
 * Skeleton loader for live focusing widget
 */
export function LiveFocusingSkeleton({ compact = false }: { compact?: boolean }): JSX.Element {
  const { theme } = useTheme();

  if (compact) {
    return (
      <Box flexDirection="row" alignItems="center" gap="md" p="md" borderRadius="lg" bg="background.secondary">
        <Box width={8} height={8} borderRadius="full" bg="background.tertiary" />
        <Box flex={1} gap="xs">
          <Box width={150} height={16} borderRadius="sm" bg="background.tertiary" />
          <Box width={100} height={12} borderRadius="sm" bg="background.tertiary" />
        </Box>
        <Box flexDirection="row">
          {[1, 2, 3].map((i) => (
            <Box key={i} width={32} height={32} borderRadius="full" bg="background.tertiary" style={{ marginLeft: i === 1 ? 0 : -8 }} />
          ))}
        </Box>
      </Box>
    );
  }

  return (
    <Box p="xl" borderRadius="xl" bg="background.secondary" borderWidth={1} borderColor="border.light" gap="lg">
      <Box flexDirection="row" justifyContent="space-between">
        <Box width={80} height={16} borderRadius="sm" bg="background.tertiary" />
        <Box width={60} height={16} borderRadius="sm" bg="background.tertiary" />
      </Box>

      <Box alignItems="center" gap="sm">
        <Box flexDirection="row" gap="sm">
          {[1, 2, 3, 4].map((i) => (
            <Box key={i} width={40} height={40} borderRadius="full" bg="background.tertiary" />
          ))}
        </Box>
        <Box width={120} height={48} borderRadius="sm" bg="background.tertiary" />
        <Box width={200} height={24} borderRadius="sm" bg="background.tertiary" />
        <Box width={180} height={16} borderRadius="sm" bg="background.tertiary" />
      </Box>

      <Box flexDirection="row" justifyContent="space-between" p="md" borderRadius="lg" bg="background.tertiary">
        {[1, 2, 3].map((i) => (
          <Box key={i} alignItems="center" gap="xs">
            <Box width={30} height={24} borderRadius="sm" bg="background.secondary" />
            <Box width={50} height={12} borderRadius="sm" bg="background.secondary" />
          </Box>
        ))}
      </Box>
    </Box>
  );
}

export default LiveFocusingWidget;
