import React from 'react';
import { Pressable } from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { Box } from '../../../components/primitives/Box';
import { Text } from '../../../components/primitives/Text';
import type { FocusDuration } from '../schemas';

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
}: FirstSessionCtaProps): JSX.Element {
  return (
    <Animated.View entering={FadeInUp.duration(400).delay(800)}>
      <Box gap="sm" mt="md">
        <Pressable
          onPress={onStartSession}
          disabled={isAdvancing}
          accessibilityLabel={`Start ${selectedDuration}-minute focus session`}
          accessibilityRole="button"
          accessibilityHint="Begins your first focus session"
        >
          {({ pressed }) => (
            <Box
              py="md"
              px="lg"
              borderRadius="lg"
              bg="primary.500"
              alignItems="center"
              opacity={pressed ? 0.8 : 1}
            >
              <Text variant="h3" color="text.inverse" fontWeight="700">
                {isAdvancing ? 'Starting...' : `Start ${selectedDuration}-min session`}
              </Text>
            </Box>
          )}
        </Pressable>
        <Pressable
          onPress={onBack}
          accessibilityLabel="Go back"
          accessibilityRole="button"
          accessibilityHint="Returns to previous step"
        >
          <Box py="sm" alignItems="center">
            <Text variant="body" color="text.secondary">
              Back
            </Text>
          </Box>
        </Pressable>
      </Box>
    </Animated.View>
  );
}
