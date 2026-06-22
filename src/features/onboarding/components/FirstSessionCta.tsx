import React from 'react';
import { Pressable } from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';

import { Box } from '../../../components/primitives/Box';
import { Button } from '../../../components/primitives/Button';
import { Text } from '../../../components/primitives/Text';
import type { FocusDuration } from '../schemas';
import { DURATION_OPTIONS } from '../service';

interface FirstSessionCtaProps {
  selectedDuration: FocusDuration;
  isAdvancing: boolean;
  onStartSession: () => void;
  onBack: () => void;
}

export function FirstSessionCta({
  selectedDuration,
  isAdvancing,
  onStartSession,
  onBack,
}: FirstSessionCtaProps): React.ReactNode {
  const durationOption = DURATION_OPTIONS.find(
    (d) => d.value === selectedDuration,
  );

  return (
    <Animated.View
      entering={FadeInUp.duration(400).delay(800)}
      style={{ marginTop: 'auto' }}
    >
      <Box gap="sm">
        <Button
          variant="primary"
          size="lg"
          onPress={onStartSession}
          disabled={isAdvancing}
          isLoading={isAdvancing}
          accessibilityLabel="Start session now"
          accessibilityRole="button"
          accessibilityHint="Double tap to start your session"
        >
          {isAdvancing
            ? 'Starting session...'
            : `Start ${durationOption?.label ?? ''} Focus`}
        </Button>
        <Pressable
          onPress={onBack}
          accessibilityLabel="Go back"
          accessibilityRole="button"
          accessibilityHint="Double tap to go back"
        >
          <Box alignItems="center" py="md">
            <Text variant="bodySmall" color="text.tertiary">
              Change selection ›
            </Text>
          </Box>
        </Pressable>
      </Box>
    </Animated.View>
  );
}

export { FirstSessionCta }