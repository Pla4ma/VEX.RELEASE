import React from 'react';
import { Box } from '../../../components/primitives/Box';
import { Text } from '../../../components/primitives/Text';

function formatNumber(num: number): string {
  if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}K`;
  }
  return num.toString();
}

export interface WeeklyReportStatsGridProps {
  sessionsCompleted: number;
  xpEarned: number;
  streakDays: number;
  bossDamageDealt: number;
  bestSession: { duration: number; grade: string } | null;
}

export function WeeklyReportStatsGrid({
  sessionsCompleted,
  xpEarned,
  streakDays,
  bossDamageDealt,
  bestSession,
}: WeeklyReportStatsGridProps): JSX.Element {
  return (
    <>
      <Box
        flexDirection="row"
        flexWrap="wrap"
        justifyContent="space-between"
        p="md"
        borderRadius="lg"
        bg="background.tertiary"
        gap="md"
      >
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

      {bestSession && (
        <Box
          flexDirection="row"
          alignItems="center"
          gap="md"
          p="md"
          borderRadius="lg"
          bg="background.tertiary"
        >
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
    </>
  );
}
