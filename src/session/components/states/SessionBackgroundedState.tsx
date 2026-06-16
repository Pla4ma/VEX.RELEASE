import React, { useEffect, useState } from 'react';
import { View } from 'react-native';
import Animated, { FadeIn, FadeInUp } from 'react-native-reanimated';
import { Text } from '../../../components/primitives/Text';
import { Button } from '../../../components/primitives/Button';
import { Box } from '../../../components/primitives/Box';
import { useTheme } from '../../../theme';
import { triggerHapticEvent, HapticEvents } from '../../../constants/haptics';
import { eventBus } from '../../../events';
import { styles } from './SessionBackgroundedState.styles';
import {
  formatDuration,
  calculateProgressLoss,
} from './session-backgrounded-helpers';

interface SessionBackgroundedStateProps {
  backgroundDuration: number;
  sessionProgress: number;
  onResume: () => void;
  onPause: () => void;
  onEnd: () => void;
  onAbandon: () => void;
  maxBackgroundTime?: number;
}
const MAX_BACKGROUND_TIME_DEFAULT = 5 * 60 * 1000;
export function SessionBackgroundedState({
  backgroundDuration,
  sessionProgress,
  onResume,
  onPause,
  onEnd,
  onAbandon,
  maxBackgroundTime = MAX_BACKGROUND_TIME_DEFAULT,
}: SessionBackgroundedStateProps): React.ReactNode {
  const { theme } = useTheme();
  const semantic = theme.colors.semantic;
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
      properties: { action, durationMs: backgroundDuration },
    });
    callback();
  };
  return (
    <Box flex={1} bg="background.primary" p="lg" justifyContent="center">
      <Animated.View entering={FadeIn.duration(400)} style={styles.container}>
        <View
          style={[
            styles.iconContainer,
            { backgroundColor: `${semantic.warning}18` },
          ]}
        >
          <Text style={[styles.icon, { color: semantic.warning }]}>
            !
          </Text>
        </View>
        <Text variant="h3" textAlign="center" mb="md">
          Session Interrupted
        </Text>
        <Text variant="body" color="text.secondary" textAlign="center" mb="lg">
          You were away for {formattedDuration}. The session continued in the background.
        </Text>
        <Box bg="background.secondary" p="md" borderRadius="lg" mb="lg" style={styles.impactCard}>
          <Text variant="bodySmall" color="text.tertiary" mb="xs">
            Session Progress
          </Text>
          <View style={[styles.progressBar, { backgroundColor: semantic.border }]}>
            <View
              style={[
                styles.progressFill,
                {
                  width: `${sessionProgress}%`,
                  backgroundColor: isLongBackground ? semantic.danger : semantic.success,
                },
              ]}
            />
          </View>
          <Text variant="h4" textAlign="center" mt="sm">
            {sessionProgress.toFixed(1)}%
          </Text>
          {progressLoss > 0 && (
            <Text variant="caption" color="error.DEFAULT" textAlign="center">
              Lost {progressLoss.toFixed(1)}% due to inactivity
            </Text>
          )}
        </Box>
        {isLongBackground && (
          <Animated.View
            entering={FadeInUp.delay(200)}
            style={[
              styles.warningBox,
              {
                backgroundColor: `${semantic.warning}10`,
                borderColor: `${semantic.warning}30`,
              },
            ]}
          >
            <Text
              variant="bodySmall"
              color="warning.DEFAULT"
              textAlign="center"
            >
              Session was backgrounded for an extended period. Continuing may
              affect your focus score accuracy.
            </Text>
          </Animated.View>
        )}
        <Box gap="sm" width="100%">
          <Button variant="primary"
            size="lg"
            onPress={() => handleAction('resume', onResume)}
            disabled={selectedAction !== null}
            isLoading={selectedAction === 'resume'}
            accessibilityLabel="Resume session"
            accessibilityRole="button"
            accessibilityHint="Double tap to activate"
          >
            Resume Session
          </Button>
          <Button variant="secondary"
            size="md"
            onPress={() => handleAction('pause', onPause)}
            disabled={selectedAction !== null}
            accessibilityLabel="Pause and review session"
            accessibilityRole="button"
            accessibilityHint="Double tap to activate"
          >
            Pause & Review
          </Button>
          <Box flexDirection="row" gap="sm">
            <Button variant="ghost"
              size="sm"
              style={{ flex: 1 }}
              onPress={() => handleAction('end', onEnd)}
              disabled={selectedAction !== null}
              accessibilityLabel="End session"
              accessibilityRole="button"
              accessibilityHint="Double tap to activate"
            >
              End Session
            </Button>
            <Button variant="ghost"
              size="sm"
              style={{ flex: 1 }}
              onPress={() => handleAction('abandon', onAbandon)}
              disabled={selectedAction !== null}
              accessibilityLabel="Abandon session"
              accessibilityRole="button"
              accessibilityHint="Double tap to activate"
            >
              Abandon
            </Button>
          </Box>
        </Box>
      </Animated.View>
    </Box>
  );
}
export default SessionBackgroundedState;
