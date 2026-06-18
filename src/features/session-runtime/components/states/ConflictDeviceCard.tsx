import React from 'react';
import { View } from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { Text } from '../../../../components/primitives/Text';
import { Button } from '../../../../components/primitives/Button';
import { Box } from '../../../../components/primitives/Box';
import { lightColors } from '@/theme/tokens/colors';

import { styles } from './SessionConflictState.styles';
import { formatTime } from './conflict-state-helpers';

interface SessionState {
  progress: number;
  elapsedTime: number;
  timestamp: number;
  deviceName?: string;
}

export interface ConflictDeviceCardProps {
  state: SessionState;
  label: string;
  badgeText: string;
  badgeColor: string;
  isSelected: boolean;
  isLoading: boolean;
  isDisabled: boolean;
  onPress: () => void;
  buttonText: string;
  accessibilityLabel: string;
  delay: number;
}

export function ConflictDeviceCard({
  state,
  label,
  badgeText,
  badgeColor,
  isSelected,
  isLoading,
  isDisabled,
  onPress,
  buttonText,
  accessibilityLabel,
  delay,
}: ConflictDeviceCardProps): React.ReactNode {
  return (
    <Animated.View entering={FadeInUp.delay(delay)}>
      <Box
        bg={isSelected ? 'primary.light' : 'background.secondary'}
        p="md"
        borderRadius="lg"
        style={
          isSelected
            ? {
                width: '100%',
                borderWidth: 2,
                borderColor: lightColors.accent.active,
              }
            : { width: '100%' }
        }
      >
        <Box
          flexDirection="row"
          justifyContent="space-between"
          alignItems="center"
          mb="sm"
        >
          <Text variant="h4">{label}</Text>
          <View style={[styles.badge, { backgroundColor: badgeColor }]}>
            <Text style={styles.badgeText}>{badgeText}</Text>
          </View>
        </Box>

        <Box flexDirection="row" justifyContent="space-between" mb="xs">
          <Text variant="bodySmall" color="text.tertiary">
            Progress
          </Text>
          <Text variant="body" fontWeight="600">
            {state.progress.toFixed(1)}%
          </Text>
        </Box>

        <Box flexDirection="row" justifyContent="space-between" mb="xs">
          <Text variant="bodySmall" color="text.tertiary">
            Elapsed Time
          </Text>
          <Text variant="body" fontWeight="600">
            {formatTime(state.elapsedTime)}
          </Text>
        </Box>

        <Box flexDirection="row" justifyContent="space-between">
          <Text variant="bodySmall" color="text.tertiary">
            Last Updated
          </Text>
          <Text variant="bodySmall">
            {new Date(state.timestamp).toLocaleTimeString()}
          </Text>
        </Box>

        <Button
          variant={isSelected ? 'primary' : 'secondary'}
          size="sm"
          onPress={onPress}
          isLoading={isLoading}
          disabled={isDisabled}
          style={{ marginTop: 12 }}
          accessibilityLabel={accessibilityLabel}
          accessibilityRole="button"
          accessibilityHint="Double tap to activate"
        >
          {buttonText}
        </Button>
      </Box>
    </Animated.View>
  );
}
