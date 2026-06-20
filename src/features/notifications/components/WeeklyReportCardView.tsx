import React from 'react';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { Box } from '../../../components/primitives/Box';
import { Text } from '../../../components/primitives/Text';
import { Button } from '../../../components/primitives/Button';
import { useTheme } from '../../../theme/ThemeContext';
import { lightColors } from '@/theme/tokens/colors';

import { WeeklyReportStatsGrid } from './WeeklyReportStatsGrid';
import { Text as VexText } from '../../../components/primitives/Text';

export interface WeeklyReportCardProps {
  totalMinutes: number;
  sessionsCompleted: number;
  xpEarned: number;
  streakDays: number;
  bossDamageDealt: number;
  bestSession: { duration: number; grade: string } | null;
  comparison: {
    changeMinutes: number;
    changePercent: number;
    percentile: number;
  };
  onViewAnalytics: () => void;
  onShare?: () => void;
}

function formatNumber(num: number): string {
  if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}K`;
  }
  return num.toString();
}

export function WeeklyReportCard({
  totalMinutes,
  sessionsCompleted,
  xpEarned,
  streakDays,
  bossDamageDealt,
  bestSession,
  comparison,
  onViewAnalytics,
  onShare,
}: WeeklyReportCardProps): React.ReactNode {
  const { theme } = useTheme();
  const isImprovement = comparison.changePercent >= 0;
  const trendEmoji = isImprovement ? '📈' : '📉';
  return (
    <Animated.View entering={FadeInUp.duration(400)}>
      <Box
        p="xl"
        borderRadius="xl"
        bg="background.secondary"
        gap="lg"
        style={{
          shadowColor: lightColors.text.primary,
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.05,
          shadowRadius: 8,
          elevation: 2,
        }}
      >
        {}
        <Box alignItems="center" gap="sm">
          <Text fontSize={32}>📊</Text>
          <Text variant="h3" color="text.primary" textAlign="center">
            Your Week in Focus
          </Text>
          <Text variant="caption" color="text.secondary">
            {new Date().toLocaleDateString('en-US', {
              month: 'long',
              day: 'numeric',
            })}{' '}
            - Weekly Report
          </Text>
        </Box>

        {}
        <Box
          alignItems="center"
          p="lg"
          borderRadius="lg"
          bg="background.tertiary"
        >
          <Text fontSize={48} fontWeight="900" color="primary.500">
            {formatNumber(totalMinutes)}
          </Text>
          <Text variant="body" color="text.secondary">
            minutes focused this week
          </Text>
        </Box>

        {}
        <Box
          flexDirection="row"
          alignItems="center"
          justifyContent="center"
          gap="md"
          p="md"
          borderRadius="lg"
          style={{
            backgroundColor: isImprovement
              ? `${theme.colors.success.DEFAULT}15`
              : `${theme.colors.warning.DEFAULT}15`,
          }}
        >
          <Text fontSize={24}>{trendEmoji}</Text>
          <Box>
            <Text
              variant="body"
              color={isImprovement ? 'success.DEFAULT' : 'warning.DEFAULT'}
              fontWeight="700"
            >
              {isImprovement ? '+' : ''}
              {comparison.changePercent}% vs last week
            </Text>
            <Text variant="caption" color="text.secondary">
              {Math.abs(comparison.changeMinutes)} minutes{' '}
              {isImprovement ? 'more' : 'less'}
            </Text>
          </Box>
        </Box>

        {}
        <Box alignItems="center">
          <Text variant="body" color="text.primary" fontWeight="600">
            🏆 You focused more than {comparison.percentile}% of VEX users this
            week
          </Text>
        </Box>

        <WeeklyReportStatsGrid
          sessionsCompleted={sessionsCompleted}
          xpEarned={xpEarned}
          streakDays={streakDays}
          bossDamageDealt={bossDamageDealt}
          bestSession={bestSession}
        />

        {}
        <Box gap="md">
          <Button variant="primary"
            size="lg"
            onPress={onViewAnalytics}
            fullWidth
            accessibilityLabel="View full weekly analytics"
            accessibilityRole="button"
            accessibilityHint="Double tap to select"
          >
            <VexText>View Full Analytics</VexText>
          </Button>

          {onShare && (
            <Button variant="secondary"
              size="md"
              onPress={onShare}
              fullWidth
              accessibilityLabel="Share weekly report"
              accessibilityRole="button"
              accessibilityHint="Double tap to select"
            >
              <VexText>Share My Week</VexText>
            </Button>
          )}
        </Box>
      </Box>
    </Animated.View>
  );
}
