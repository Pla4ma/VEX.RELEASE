import React from 'react';
import { Pressable } from 'react-native';
import Animated, { FadeIn, FadeInUp } from 'react-native-reanimated';
import { Box } from '../../../components/primitives/Box';
import { Text } from '../../../components/primitives/Text';
import { Button } from '../../../components/primitives/Button';

interface FirstSessionCtaProps {
  selectedDuration: number;
  isAdvancing: boolean;
  onStartSession: () => void;
  onBack: () => void;
}

export function FirstSessionCta({
  selectedDuration,
  isAdvancing,
  onStartSession,
  onBack,
}: FirstSessionCtaProps): JSX.Element {
  return (
    <>
      <Box flex={1} minHeight={20} />

      <Animated.View entering={FadeInUp.duration(400).delay(800)} style={{ width: '100%' }}>
        <Button
          variant="primary"
          size="lg"
          fullWidth
          onPress={onStartSession}
          disabled={isAdvancing}
          accessibilityLabel="Start first focus session"
          accessibilityRole="button"
          accessibilityHint="Double tap to select"
        >
          {isAdvancing
            ? 'Starting...'
            : `Start ${selectedDuration}-minute focus session →`}
        </Button>
      </Animated.View>

      <Animated.View entering={FadeIn.duration(400).delay(900)} style={{ marginTop: 'auto' }}>
        <Pressable
          onPress={onBack}
          accessibilityLabel="Go back"
          accessibilityRole="button"
          accessibilityHint="Double tap to select"
        >
          <Box alignItems="center" py="md">
            <Text variant="bodySmall" color="text.tertiary">← Go back</Text>
          </Box>
        </Pressable>
      </Animated.View>
    </>
  );
}
