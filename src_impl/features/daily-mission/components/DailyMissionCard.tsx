/**
 * DailyMissionCard Component
 *
 * Displays the user's primary daily mission with progress and CTA.
 * Part of Phase 3 Information Architecture - position 2.
 */

import React from 'react';
import { Pressable } from 'react-native';
import { Box } from '../../../components/primitives/Box';
import { Text } from '../../../components/primitives/Text';
import { Button } from '../../../components/primitives/Button';
import { ProgressBar } from '../../../components';
import { useTheme } from '../../../theme';
import type { DailyMission } from '../schemas';

interface DailyMissionCardProps {
  mission: DailyMission;
  onPress?: () => void;
  onDismiss?: () => void;
}

export function DailyMissionCard({ mission, onPress, onDismiss }: DailyMissionCardProps): JSX.Element {
  const { theme } = useTheme();
  const remainingHours = getMissionRemainingHours(mission);

  const getMissionIcon = (type: string): string => {
    const icons: Record<string, string> = {
      'first-session': '🚀',
      'sync-repair': '🔄',
      'streak-critical': '🔥',
      'comeback-quest': '💪',
      'daily-challenge': '🎯',
      'boss-fight': '⚔️',
      'companion-care': '🐾',
      'coach-action': '🧠',
      'squad-goal': '👥',
      'default-focus': '🎯',
    };
    return icons[type] || '📋';
  };

  const getMissionColor = (type: string): string => {
    const colors: Record<string, string> = {
      'first-session': theme.colors.primary[500],
      'sync-repair': theme.colors.warning[500],
      'streak-critical': theme.colors.error[500],
      'comeback-quest': theme.colors.accent.purple[500],
      'daily-challenge': theme.colors.success[500],
      'boss-fight': theme.colors.error[500],
      'companion-care': theme.colors.accent.blue[500],
      'coach-action': theme.colors.primary[500],
      'squad-goal': theme.colors.accent.green[500],
      'default-focus': theme.colors.primary[500],
    };
    return colors[type] || theme.colors.primary[500];
  };

  const missionColor = getMissionColor(mission.type);
  const progressPercent = mission.progress * 100;

  return (
    <Box
      m="lg"
      p="lg"
      borderRadius="xl"
      bg={theme.colors.background.secondary}
      borderWidth={1}
      borderColor={missionColor + '30'}
    >
      <Pressable onPress={onPress} disabled={!onPress}>
        {/* Header */}
        <Box
          flexDirection="row"
          alignItems="center"
          gap="md"
          mb="md"
        >
          <Box
            width={48}
            height={48}
            borderRadius="lg"
            bg={missionColor + '20'}
            justifyContent="center"
            alignItems="center"
          >
            <Text fontSize={24}>{getMissionIcon(mission.type)}</Text>
          </Box>

          <Box flex={1}>
            <Text
              variant="h4"
              color={missionColor}
              style={{ marginBottom: 2 }}
            >
              {mission.isCompleted ? '✓ ' : ''}{mission.title}
            </Text>
            <Text variant="caption" color="text.secondary">
              Priority {mission.priority} • {remainingHours}h remaining
            </Text>
          </Box>

          {mission.isCompleted && (
            <Box
              bg={theme.colors.success[500]}
              borderRadius="full"
              px="sm"
              py="xs"
            >
              <Text
                color={theme.colors.text.inverse}
                variant="caption"
                fontWeight="600"
              >
                Done
              </Text>
            </Box>
          )}
        </Box>

        {/* Mission content */}
        <Text
          variant="body"
          color="text.secondary"
          style={{ marginBottom: theme.spacing[3] }}
        >
          {mission.reason}
        </Text>

        {/* Progress bar (if not completed) */}
        {!mission.isCompleted && (
          <Box mb="md">
            <Box
              flexDirection="row"
              justifyContent="space-between"
              alignItems="center"
              mb="xs"
            >
              <Text variant="caption" color="text.secondary">
                Progress
              </Text>
              <Text variant="caption" color={missionColor} fontWeight="600">
                {Math.round(progressPercent)}%
              </Text>
            </Box>
            <ProgressBar
              progress={progressPercent / 100}
              fillColor={missionColor}
              height={8}
            />
          </Box>
        )}

        {/* Action buttons */}
        <Box
          flexDirection="row"
          justifyContent="space-between"
          alignItems="center"
        >
          <Button
            variant={mission.isCompleted ? 'outline' : 'primary'}
            size="sm"
            onPress={onPress}
            disabled={mission.isCompleted}
            style={{ flex: 1, marginRight: theme.spacing[2] }}
          >
            {mission.ctaLabel}
          </Button>

          {onDismiss && !mission.isCompleted && (
            <Button
              variant="ghost"
              size="sm"
              onPress={onDismiss}
            >
              Dismiss
            </Button>
          )}
        </Box>
      </Pressable>
    </Box>
  );
}
