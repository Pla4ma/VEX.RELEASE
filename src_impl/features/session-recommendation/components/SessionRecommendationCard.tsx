/**
 * SessionRecommendationCard Component
 *
 * Displays the recommended session with duration, mode, and reason.
 * Integrates with the Phase 3 Home screen session start control.
 */

import React from 'react';
import { Pressable, View } from 'react-native';
import { Box } from '../../../components/primitives/Box';
import { Text } from '../../../components/primitives/Text';
import { Button } from '../../../components/primitives/Button';
import { useTheme } from '../../../theme';
import type { SessionRecommendation } from '../types';

export interface SessionRecommendationCardProps {
  recommendation: SessionRecommendation;
  onAccept?: () => void;
  onDismiss?: () => void;
  showDismiss?: boolean;
}

export function SessionRecommendationCard({
  recommendation,
  onAccept,
  onDismiss,
  showDismiss = true,
}: SessionRecommendationCardProps): JSX.Element {
  const { theme } = useTheme();

  const getSessionModeColor = (mode: string): string => {
    const colors: Record<string, string> = {
      'FOCUS': theme.colors.primary[500],
      'RECOVERY': theme.colors.success[500],
      'STUDY': theme.colors.accent.blue[500],
      'BOSS_PREP': theme.colors.error[500],
      'HABIT_BUILD': theme.colors.accent.purple[500],
    };
    return colors[mode] || theme.colors.primary[500];
  };

  const getSessionModeIcon = (mode: string): string => {
    const icons: Record<string, string> = {
      'FOCUS': '🎯',
      'RECOVERY': '🌱',
      'STUDY': '📚',
      'BOSS_PREP': '⚔️',
      'HABIT_BUILD': '🔄',
    };
    return icons[mode] || '🎯';
  };

  const modeColor = getSessionModeColor(recommendation.mode);
  const modeIcon = getSessionModeIcon(recommendation.mode);

  if (recommendation.isBlocked) {
    return (
      <Box
        m="lg"
        p="lg"
        borderRadius="xl"
        bg={theme.colors.background.secondary}
        borderWidth={1}
        borderColor={theme.colors.border.light}
      >
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
            bg={theme.colors.warning[500] + '20'}
            justifyContent="center"
            alignItems="center"
          >
            <Text fontSize={24}>⏸️</Text>
          </Box>

          <Box flex={1}>
            <Text
              variant="h4"
              color={theme.colors.warning[500]}
              style={{ marginBottom: 2 }}
            >
              Session Blocked
            </Text>
            <Text variant="caption" color="text.secondary">
              {recommendation.blockReason}
            </Text>
          </Box>
        </Box>

        <Text
          variant="body"
          color="text.secondary"
          style={{ marginBottom: theme.spacing[3] }}
        >
          {recommendation.reason}
        </Text>

        <Button
          variant="outline"
          size="sm"
          disabled
          style={{ width: '100%' }}
        >
          Cannot start session
        </Button>
      </Box>
    );
  }

  return (
    <Box
      m="lg"
      p="lg"
      borderRadius="xl"
      bg={theme.colors.background.secondary}
      borderWidth={1}
      borderColor={modeColor + '30'}
    >
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
          bg={modeColor + '20'}
          justifyContent="center"
          alignItems="center"
        >
          <Text fontSize={24}>{modeIcon}</Text>
        </Box>

        <Box flex={1}>
          <Text
            variant="h4"
            color={modeColor}
            style={{ marginBottom: 2 }}
          >
            {recommendation.duration} min • {recommendation.mode}
          </Text>
          <Text variant="caption" color="text.secondary">
            {recommendation.fallback ? 'Default suggestion' : 'Personalized recommendation'}
            {' • '}
            {Math.round(recommendation.confidence * 100)}% confidence
          </Text>
        </Box>
      </Box>

      <Text
        variant="body"
        color="text.secondary"
        style={{ marginBottom: theme.spacing[3], lineHeight: 20 }}
      >
        {recommendation.reason}
      </Text>

      <Box
        flexDirection="row"
        justifyContent="space-between"
        alignItems="center"
      >
        <Button
          variant={recommendation.fallback ? 'outline' : 'primary'}
          size="sm"
          onPress={onAccept}
          style={{ flex: 1, marginRight: showDismiss ? theme.spacing[2] : 0 }}
        >
          Start Session
        </Button>

        {showDismiss && onDismiss && (
          <Button
            variant="ghost"
            size="sm"
            onPress={onDismiss}
          >
            Dismiss
          </Button>
        )}
      </Box>
    </Box>
  );
}
