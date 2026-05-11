/**
 * SessionConflictState Component
 *
 * Displayed when there's a conflict between local and remote session state.
 * Allows user to choose which version to keep.
 *
 * @phase 1 - Deepening: Conflict resolution UI
 */

import React, { useState } from 'react';
import { View, ScrollView } from 'react-native';
import Animated, { FadeIn, FadeInUp } from 'react-native-reanimated';

import { Text } from '../../../components/primitives/Text';
import { Button } from '../../../components/primitives/Button';
import { Box } from '../../../components/primitives/Box';
import { useTheme } from '../../../theme';
import { triggerHapticEvent, HapticEvents } from '../../../constants/haptics';
import { eventBus } from '../../../events';
import { createSheet } from '@/shared/ui/create-sheet';

interface SessionState {
  progress: number;
  elapsedTime: number;
  timestamp: number;
  deviceName?: string;
}

interface SessionConflictStateProps {
  localState: SessionState;
  remoteState: SessionState;
  onResolveLocal: () => void;
  onResolveRemote: () => void;
  onMerge?: () => void;
}

export function SessionConflictState({
  localState,
  remoteState,
  onResolveLocal,
  onResolveRemote,
  onMerge,
}: SessionConflictStateProps): JSX.Element {
  const { theme } = useTheme();
  const [selectedOption, setSelectedOption] = useState<'local' | 'remote' | 'merge' | null>(null);
  const [isResolving, setIsResolving] = useState(false);

  const timeDifference = Math.abs(localState.elapsedTime - remoteState.elapsedTime);
  const progressDifference = Math.abs(localState.progress - remoteState.progress);

  const handleResolve = async (option: 'local' | 'remote' | 'merge') => {
    setSelectedOption(option);
    setIsResolving(true);
    triggerHapticEvent(HapticEvents.BUTTON_PRESS);

    eventBus.publish('analytics:track', {
      event: 'session_conflict_resolution',
      properties: {
        resolution: option,
        localProgress: localState.progress,
        remoteProgress: remoteState.progress,
        timeDifference,
      },
    });

    try {
      if (option === 'local') {
        await onResolveLocal();
      } else if (option === 'remote') {
        await onResolveRemote();
      } else if (option === 'merge' && onMerge) {
        await onMerge();
      }
    } finally {
      setIsResolving(false);
    }
  };

  const formatTime = (ms: number): string => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}m ${seconds}s`;
  };

  return (
    <Box flex={1} bg="background.primary" p="lg">
      <ScrollView showsVerticalScrollIndicator={false}>
        <Animated.View entering={FadeIn.duration(400)} style={styles.container}>
          {/* Warning Icon */}
          <View style={[styles.iconContainer, { backgroundColor: theme.colors.warning.light }]}>
            <Text style={styles.icon}>⚠️</Text>
          </View>

          {/* Title */}
          <Text variant="h3" textAlign="center" mb="md">
            Session Conflict Detected
          </Text>

          {/* Explanation */}
          <Text variant="body" color="text.secondary" textAlign="center" mb="lg">
            We found different session data on another device. Choose which version to keep.
          </Text>

          {/* Comparison Cards */}
          <Box gap="md" mb="lg">
            {/* Local State Card */}
            <Animated.View entering={FadeInUp.delay(100)}>
              <Box
                bg={selectedOption === 'local' ? 'primary.light' : 'background.secondary'}
                p="md"
                borderRadius="lg"
                style={selectedOption === 'local' ? { width: '100%', borderWidth: 2, borderColor: '#3B82F6' } : { width: '100%' }}
              >
                <Box flexDirection="row" justifyContent="space-between" alignItems="center" mb="sm">
                  <Text variant="h4">This Device</Text>
                  <View style={[styles.badge, { backgroundColor: theme.colors.success.DEFAULT }]}>
                    <Text style={styles.badgeText}>LOCAL</Text>
                  </View>
                </Box>

                <Box flexDirection="row" justifyContent="space-between" mb="xs">
                  <Text variant="bodySmall" color="text.tertiary">Progress</Text>
                  <Text variant="body" fontWeight="600">{localState.progress.toFixed(1)}%</Text>
                </Box>

                <Box flexDirection="row" justifyContent="space-between" mb="xs">
                  <Text variant="bodySmall" color="text.tertiary">Elapsed Time</Text>
                  <Text variant="body" fontWeight="600">{formatTime(localState.elapsedTime)}</Text>
                </Box>

                <Box flexDirection="row" justifyContent="space-between">
                  <Text variant="bodySmall" color="text.tertiary">Last Updated</Text>
                  <Text variant="bodySmall">{new Date(localState.timestamp).toLocaleTimeString()}</Text>
                </Box>

                <Button
                  variant={selectedOption === 'local' ? 'primary' : 'secondary'}
                  size="sm"
                  onPress={() => handleResolve('local')}
                  isLoading={isResolving && selectedOption === 'local'}
                  disabled={isResolving}
                  style={{ marginTop: 12 }}

                accessibilityLabel="Keep This Version button"
                accessibilityRole="button"
                accessibilityHint="Activates this control">
                  Keep This Version
                </Button>
              </Box>
            </Animated.View>

            {/* Remote State Card */}
            <Animated.View entering={FadeInUp.delay(200)}>
              <Box
                bg={selectedOption === 'remote' ? 'primary.light' : 'background.secondary'}
                p="md"
                borderRadius="lg"
                style={selectedOption === 'remote' ? { width: '100%', borderWidth: 2, borderColor: '#3B82F6' } : { width: '100%' }}
              >
                <Box flexDirection="row" justifyContent="space-between" alignItems="center" mb="sm">
                  <Text variant="h4">{remoteState.deviceName || 'Other Device'}</Text>
                  <View style={[styles.badge, { backgroundColor: theme.colors.info.DEFAULT }]}>
                    <Text style={styles.badgeText}>REMOTE</Text>
                  </View>
                </Box>

                <Box flexDirection="row" justifyContent="space-between" mb="xs">
                  <Text variant="bodySmall" color="text.tertiary">Progress</Text>
                  <Text variant="body" fontWeight="600">{remoteState.progress.toFixed(1)}%</Text>
                </Box>

                <Box flexDirection="row" justifyContent="space-between" mb="xs">
                  <Text variant="bodySmall" color="text.tertiary">Elapsed Time</Text>
                  <Text variant="body" fontWeight="600">{formatTime(remoteState.elapsedTime)}</Text>
                </Box>

                <Box flexDirection="row" justifyContent="space-between">
                  <Text variant="bodySmall" color="text.tertiary">Last Updated</Text>
                  <Text variant="bodySmall">{new Date(remoteState.timestamp).toLocaleTimeString()}</Text>
                </Box>

                <Button
                  variant={selectedOption === 'remote' ? 'primary' : 'secondary'}
                  size="sm"
                  onPress={() => handleResolve('remote')}
                  isLoading={isResolving && selectedOption === 'remote'}
                  disabled={isResolving}
                  style={{ marginTop: 12 }}

                accessibilityLabel="Use Other Version button"
                accessibilityRole="button"
                accessibilityHint="Activates this control">
                  Use Other Version
                </Button>
              </Box>
            </Animated.View>
          </Box>

          {/* Difference Summary */}
          <Box bg="background.tertiary" p="md" borderRadius="lg" mb="lg">
            <Text variant="bodySmall" color="text.tertiary" textAlign="center" mb="xs">
              Difference Summary
            </Text>
            <Text variant="body" textAlign="center">
              Time diff: {formatTime(timeDifference)} • Progress diff: {progressDifference.toFixed(1)}%
            </Text>
          </Box>

          {/* Merge Option (if available) */}
          {onMerge && (
            <Animated.View entering={FadeInUp.delay(300)}>
              <Button
                variant="ghost"
                size="md"
                onPress={() => handleResolve('merge')}
                isLoading={isResolving && selectedOption === 'merge'}
                disabled={isResolving}

              accessibilityLabel="Try to Merge Both Versions button"
              accessibilityRole="button"
              accessibilityHint="Activates this control">
                Try to Merge Both Versions
              </Button>
            </Animated.View>
          )}
        </Animated.View>
      </ScrollView>
    </Box>
  );
}

const styles = createSheet({
  container: {
    alignItems: 'center',
    paddingVertical: 24,
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
  stateCard: {
    width: '100%',
  },
  selectedCard: {
    borderWidth: 2,
    borderColor: '#3B82F6',
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },
});

export default SessionConflictState;
