/**
 * SessionBackgroundedState Component
 *
 * Displayed when user returns to app after session was backgrounded.
 * Handles recovery options and explains what happened.
 *
 * @phase 1 - Deepening: Background state handling
 */

import React, { useEffect, useState } from 'react';
import { View } from 'react-native';
import Animated, { FadeIn, FadeInUp } from 'react-native-reanimated';

import { Text } from '../../../components/primitives/Text';
import { Button } from '../../../components/primitives/Button';
import { Box } from '../../../components/primitives/Box';
import { useTheme } from '../../../theme';
import { triggerHapticEvent, HapticEvents } from '../../../constants/haptics';
import { eventBus } from '../../../events';
import { createSheet } from '@/shared/ui/create-sheet';

interface SessionBackgroundedStateProps {
  backgroundDuration: number; // milliseconds
  sessionProgress: number; // 0-100
  onResume: () => void;
  onPause: () => void;
  onEnd: () => void;
  onAbandon: () => void;
  maxBackgroundTime?: number; // default 5 minutes
}

const MAX_BACKGROUND_TIME_DEFAULT = 5 * 60 * 1000; // 5 minutes

export function SessionBackgroundedState({
  backgroundDuration,
  sessionProgress,
  onResume,
  onPause,
  onEnd,
  onAbandon,
  maxBackgroundTime = MAX_BACKGROUND_TIME_DEFAULT,
}: SessionBackgroundedStateProps): JSX.Element {
  const { theme } = useTheme();
  const [selectedAction, setSelectedAction] = useState<string | null>(null);

  const isLongBackground = backgroundDuration > maxBackgroundTime;
  const formattedDuration = formatDuration(backgroundDuration);
  const progressLoss = calculateProgressLoss(backgroundDuration, sessionProgress);

  useEffect(() => {
    triggerHapticEvent(HapticEvents.WARNING);
    eventBus.publish('analytics:track', {
      event: 'session_backgrounded_detected',
      properties: {
        durationMs: backgroundDuration,
        progressAtBackground: sessionProgress,
        isLongBackground,
      },
    });
  }, [backgroundDuration, sessionProgress, isLongBackground]);

  const handleAction = (action: string, callback: () => void) => {
    setSelectedAction(action);
    eventBus.publish('analytics:track', {
      event: 'session_backgrounded_action',
      properties: {
        action,
        durationMs: backgroundDuration,
      },
    });
    callback();
  };

  return (
    <Box flex={1} bg="background.primary" p="lg" justifyContent="center">
      <Animated.View entering={FadeIn.duration(400)} style={styles.container}>
        {/* Icon */}
        <View style={[styles.iconContainer, { backgroundColor: theme.colors.warning.light }]}>
          <Text style={styles.icon}>📱</Text>
        </View>

        {/* Title */}
        <Text variant="h3" textAlign="center" mb="md">
          Session Interrupted
        </Text>

        {/* Explanation */}
        <Text variant="body" color="text.secondary" textAlign="center" mb="lg">
          You were away for {formattedDuration}. The session continued in the background.
        </Text>

        {/* Progress Impact */}
        <Box
          bg="background.secondary"
          p="md"
          borderRadius="lg"
          mb="lg"
          style={styles.impactCard}
        >
          <Text variant="bodySmall" color="text.tertiary" mb="xs">
            Session Progress
          </Text>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                {
                  width: `${sessionProgress}%`,
                  backgroundColor: isLongBackground
                    ? theme.colors.error.DEFAULT
                    : theme.colors.success.DEFAULT,
                },
              ]}
            />
          </View>
          <Text variant="h4" textAlign="center" mt="sm">
            {sessionProgress.toFixed(1)}%
          </Text>
          {progressLoss > 0 && (
            <Text variant="caption" color="error.DEFAULT" textAlign="center">
              ⚠️ Lost {progressLoss.toFixed(1)}% due to inactivity
            </Text>
          )}
        </Box>

        {/* Warning for long background */}
        {isLongBackground && (
          <Animated.View entering={FadeInUp.delay(200)} style={styles.warningBox}>
            <Text variant="bodySmall" color="warning.DEFAULT" textAlign="center">
              ⚠️ Session was backgrounded for an extended period.
              Continuing may affect your focus score accuracy.
            </Text>
          </Animated.View>
        )}

        {/* Action Buttons */}
        <Box gap="sm" width="100%">
          <Button
            variant="primary"
            size="lg"
            onPress={() => handleAction('resume', onResume)}
            disabled={selectedAction !== null}
            isLoading={selectedAction === 'resume'}

          accessibilityLabel="Resume Session → button"
          accessibilityRole="button"
          accessibilityHint="Activates this control">
            Resume Session →
          </Button>

          <Button
            variant="secondary"
            size="md"
            onPress={() => handleAction('pause', onPause)}
            disabled={selectedAction !== null}

          accessibilityLabel="Pause & Review button"
          accessibilityRole="button"
          accessibilityHint="Activates this control">
            Pause & Review
          </Button>

          <Box flexDirection="row" gap="sm">
            <Button
              variant="ghost"
              size="sm"
              style={{ flex: 1 }}
              onPress={() => handleAction('end', onEnd)}
              disabled={selectedAction !== null}

            accessibilityLabel="End Session button"
            accessibilityRole="button"
            accessibilityHint="Activates this control">
              End Session
            </Button>
            <Button
              variant="ghost"
              size="sm"
              style={{ flex: 1 }}
              onPress={() => handleAction('abandon', onAbandon)}
              disabled={selectedAction !== null}

            accessibilityLabel="Abandon button"
            accessibilityRole="button"
            accessibilityHint="Activates this control">
              Abandon
            </Button>
          </Box>
        </Box>
      </Animated.View>
    </Box>
  );
}

// Utility functions
function formatDuration(ms: number): string {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);

  if (hours > 0) {
    return `${hours}h ${minutes % 60}m`;
  }
  if (minutes > 0) {
    return `${minutes}m ${seconds % 60}s`;
  }
  return `${seconds}s`;
}

function calculateProgressLoss(backgroundMs: number, currentProgress: number): number {
  // Simple model: lose 1% per minute of background, capped at 20%
  const minutes = backgroundMs / 60000;
  const loss = Math.min(minutes * 1, 20);
  return Math.min(loss, currentProgress); // Can't lose more than current progress
}

const styles = createSheet({
  container: {
    alignItems: 'center',
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  icon: {
    fontSize: 40,
  },
  impactCard: {
    width: '100%',
  },
  progressBar: {
    height: 8,
    backgroundColor: 'rgba(0,0,0,0.1)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  warningBox: {
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.3)',
  },
});

export default SessionBackgroundedState;

export * from "./SessionBackgroundedState.types";
