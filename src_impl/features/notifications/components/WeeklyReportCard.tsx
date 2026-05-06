/**
 * WeeklyReportCard Component
 *
 * In-app card showing weekly focus summary.
 * Triggered by Sunday evening push notification.
 *
 * @phase 11.6
 */

import React from "react";
import { Pressable } from "react-native";
import Animated, { FadeInUp } from "react-native-reanimated";

import { Box } from "../../../components/primitives/Box";
import { Text } from "../../../components/primitives/Text";
import { Button } from "../../../components/primitives/Button";
import { useTheme } from "../../../theme";

interface WeeklyReportCardProps {
  /** Total focus minutes this week */
  totalMinutes: number;
  /** Sessions completed */
  sessionsCompleted: number;
  /** XP earned */
  xpEarned: number;
  /** Streak days */
  streakDays: number;
  /** Boss damage dealt */
  bossDamageDealt: number;
  /** Best session details */
  bestSession: {
    duration: number;
    grade: string;
  } | null;
  /** Comparison to previous week */
  comparison: {
    changeMinutes: number;
    changePercent: number;
    percentile: number;
  };
  /** On view analytics pressed */
  onViewAnalytics: () => void;
  /** On share pressed */
  onShare?: () => void;
}

/**
 * Format large numbers
 */
function formatNumber(num: number): string {
  if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}K`;
  }
  return num.toString();
}

/**
 * Weekly Report Card
 */
export function WeeklyReportCard({ totalMinutes, sessionsCompleted, xpEarned, streakDays, bossDamageDealt, bestSession, comparison, onViewAnalytics, onShare }: WeeklyReportCardProps): JSX.Element {
  const { theme } = useTheme();

  const isImprovement = comparison.changePercent >= 0;
  const trendEmoji = isImprovement ? "📈" : "📉";

  return (
    <Animated.View entering={FadeInUp.duration(400)}>
      <Box
        p="xl"
        borderRadius="xl"
        bg="background.secondary"
        gap="lg"
        style={{
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.05,
          shadowRadius: 8,
          elevation: 2,
        }}
      >
        {/* Header */}
        <Box alignItems="center" gap="sm">
          <Text fontSize={32}>📊</Text>
          <Text variant="h3" color="text.primary" textAlign="center">
            Your Week in Focus
          </Text>
          <Text variant="caption" color="text.secondary">
            {new Date().toLocaleDateString("en-US", { month: "long", day: "numeric" })} - Weekly Report
          </Text>
        </Box>

        {/* Main Stat */}
        <Box alignItems="center" p="lg" borderRadius="lg" bg="background.tertiary">
          <Text fontSize={48} fontWeight="900" color="primary.500">
            {formatNumber(totalMinutes)}
          </Text>
          <Text variant="body" color="text.secondary">
            minutes focused this week
          </Text>
        </Box>

        {/* Comparison */}
        <Box
          flexDirection="row"
          alignItems="center"
          justifyContent="center"
          gap="md"
          p="md"
          borderRadius="lg"
          style={{
            backgroundColor: isImprovement ? `${theme.colors.success.DEFAULT}15` : `${theme.colors.warning.DEFAULT}15`,
          }}
        >
          <Text fontSize={24}>{trendEmoji}</Text>
          <Box>
            <Text variant="body" color={isImprovement ? "success.DEFAULT" : "warning.DEFAULT"} fontWeight="700">
              {isImprovement ? "+" : ""}
              {comparison.changePercent}% vs last week
            </Text>
            <Text variant="caption" color="text.secondary">
              {Math.abs(comparison.changeMinutes)} minutes {isImprovement ? "more" : "less"}
            </Text>
          </Box>
        </Box>

        {/* Percentile */}
        <Box alignItems="center">
          <Text variant="body" color="text.primary" fontWeight="600">
            🏆 You focused more than {comparison.percentile}% of VEX users this week
          </Text>
        </Box>

        {/* Stats Grid */}
        <Box flexDirection="row" flexWrap="wrap" justifyContent="space-between" p="md" borderRadius="lg" bg="background.tertiary" gap="md">
          <Box flex={1} minWidth={80} alignItems="center">
            <Text fontSize={24} fontWeight="800" color="text.primary">
              {sessionsCompleted}
            </Text>
            <Text variant="caption" color="text.tertiary">
              Sessions
            </Text>
          </Box>

          <Box flex={1} minWidth={80} alignItems="center">
            <Text fontSize={24} fontWeight="800" color="success.DEFAULT">
              +{formatNumber(xpEarned)}
            </Text>
            <Text variant="caption" color="text.tertiary">
              XP Earned
            </Text>
          </Box>

          <Box flex={1} minWidth={80} alignItems="center">
            <Text fontSize={24} fontWeight="800" color="warning.DEFAULT">
              🔥{streakDays}
            </Text>
            <Text variant="caption" color="text.tertiary">
              Day Streak
            </Text>
          </Box>

          <Box flex={1} minWidth={80} alignItems="center">
            <Text fontSize={24} fontWeight="800" color="error.DEFAULT">
              ⚔️{bossDamageDealt}
            </Text>
            <Text variant="caption" color="text.tertiary">
              Boss Damage
            </Text>
          </Box>
        </Box>

        {/* Best Session */}
        {bestSession && (
          <Box flexDirection="row" alignItems="center" gap="md" p="md" borderRadius="lg" bg="background.tertiary">
            <Text fontSize={32}>⭐</Text>
            <Box flex={1}>
              <Text variant="body" color="text.primary" fontWeight="600">
                Best Session
              </Text>
              <Text variant="caption" color="text.secondary">
                {bestSession.duration} minutes • Grade {bestSession.grade}
              </Text>
            </Box>
          </Box>
        )}

        {/* Actions */}
        <Box gap="md">
          <Button variant="primary" size="lg" onPress={onViewAnalytics} fullWidth accessibilityLabel="View Full Analytics button" accessibilityRole="button" accessibilityHint="Activates this control">
            View Full Analytics
          </Button>

          {onShare && (
            <Button variant="secondary" size="md" onPress={onShare} fullWidth accessibilityLabel="Share My Week button" accessibilityRole="button" accessibilityHint="Activates this control">
              Share My Week
            </Button>
          )}
        </Box>
      </Box>
    </Animated.View>
  );
}

/**
 * Compact weekly report indicator for home screen
 */
export function WeeklyReportCompact({
  totalMinutes,
  changePercent,
  onPress,
}: Pick<WeeklyReportCardProps, "totalMinutes" | "onViewAnalytics"> & {
  changePercent: number;
  onPress: () => void;
}): JSX.Element {
  const isImprovement = changePercent >= 0;

  return (
    <Pressable onPress={onPress} accessibilityLabel="Interactive control" accessibilityRole="button" accessibilityHint="Activates this control">
      <Box
        flexDirection="row"
        alignItems="center"
        gap="md"
        p="md"
        borderRadius="lg"
        bg="background.secondary"
        style={{
          borderLeftWidth: 4,
          borderLeftColor: isImprovement ? "#22C55E" : "#F59E0B",
        }}
      >
        <Text fontSize={24}>📊</Text>
        <Box flex={1}>
          <Text variant="body" color="text.primary" fontWeight="600">
            {totalMinutes}m this week
          </Text>
          <Text variant="caption" color={isImprovement ? "success.DEFAULT" : "warning.DEFAULT"}>
            {isImprovement ? "+" : ""}
            {changePercent}% vs last week
          </Text>
        </Box>
        <Text fontSize={20}>→</Text>
      </Box>
    </Pressable>
  );
}

export default WeeklyReportCard;
