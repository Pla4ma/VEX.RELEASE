/**
 * SeasonNarrativeCard Component
 *
 * PHASE 14.1 - Compelling season display with narrative and community goal
 *
 * @phase 14.1
 */

import React from 'react';
import Animated, { FadeInUp } from 'react-native-reanimated';

import { Box, Card, Text } from '../../../components/primitives';
import { useTheme } from '../../../theme';
import type { SeasonNarrative, SeasonCommunityGoal } from '../types';
import { formatCommunityGoalProgress } from '../narrative';

interface SeasonNarrativeCardProps {
  narrative: SeasonNarrative;
  communityGoal?: SeasonCommunityGoal;
  daysRemaining: number;
  userTier?: number;
}

export function SeasonNarrativeCard({
  narrative,
  communityGoal,
  daysRemaining,
  userTier,
}: SeasonNarrativeCardProps): JSX.Element {
  const { theme } = useTheme();

  const isGoalComplete = communityGoal && communityGoal.percentComplete >= 100;

  return (
    <Animated.View entering={FadeInUp.duration(400)}>
      <Card
        size="md"
        style={{
          backgroundColor: `${narrative.accentColor}08`,
          borderWidth: 1,
          borderColor: `${narrative.accentColor}30`,
        }}
      >
        <Box gap="md">
          {/* Season Header */}
          <Box>
            <Text variant="caption" color={narrative.accentColor} fontWeight="600">
              CURRENT SEASON
            </Text>
            <Text variant="h3" color="text.primary" mt="xs">
              {narrative.displayName}
            </Text>
            <Text variant="bodySmall" color="text.secondary" mt="xs">
              {daysRemaining} days remaining
            </Text>
          </Box>

          {/* Theme Description */}
          <Box
            p="md"
            borderRadius="lg"
            bg="background.secondary"
          >
            <Text variant="body" color="text.primary">
              {narrative.themeDescription}
            </Text>
          </Box>

          {/* Boss Theme */}
          <Box flexDirection="row" alignItems="center" gap="sm">
            <Text fontSize={16}>👹</Text>
            <Text variant="caption" color="text.tertiary">
              This season: {narrative.bossTheme}
            </Text>
          </Box>

          {/* Community Goal */}
          {communityGoal && (
            <Box
              p="md"
              borderRadius="lg"
              bg={`${narrative.accentColor}10`}
              borderWidth={1}
              borderColor={`${narrative.accentColor}30`}
            >
              <Box flexDirection="row" alignItems="center" gap="sm" mb="sm">
                <Text fontSize={16}>{isGoalComplete ? '🏆' : '🎯'}</Text>
                <Text variant="bodySmall" color={narrative.accentColor} fontWeight="600">
                  Community Goal
                </Text>
              </Box>

              <Text variant="bodySmall" color="text.secondary" mb="sm">
                {narrative.communityGoalText}: {formatCommunityGoalProgress(
                  communityGoal.currentSessions,
                  communityGoal.targetSessions
                )}
              </Text>

              {/* Progress Bar */}
              <Box
                height={8}
                borderRadius="full"
                bg="background.tertiary"
                overflow="hidden"
              >
                <Box
                  height="100%"
                  borderRadius="full"
                  bg={narrative.accentColor}
                  style={{
                    width: `${Math.min(100, communityGoal.percentComplete)}%`,
                  }}
                />
              </Box>

              {isGoalComplete && (
                <Box mt="sm" alignItems="center">
                  <Text variant="caption" color="success.DEFAULT" fontWeight="600">
                    🎉 Community goal achieved! Special rewards unlocked!
                  </Text>
                </Box>
              )}
            </Box>
          )}

          {/* User Tier Badge */}
          {userTier !== undefined && userTier > 0 && (
            <Box
              flexDirection="row"
              alignItems="center"
              justifyContent="space-between"
              p="md"
              borderRadius="lg"
              bg="background.secondary"
            >
              <Text variant="bodySmall" color="text.secondary">
                Your Battle Pass Tier
              </Text>
              <Box
                px="md"
                py="xs"
                borderRadius="full"
                bg={narrative.accentColor}
              >
                <Text variant="caption" color="#FFF" fontWeight="700">
                  Tier {userTier}
                </Text>
              </Box>
            </Box>
          )}
        </Box>
      </Card>
    </Animated.View>
  );
}

export default SeasonNarrativeCard;
