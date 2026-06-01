import React, { useState } from 'react';
import { Pressable } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

import { Box } from '../../../components/primitives/Box';
import { Text } from '../../../components/primitives/Text';
import type { MotivationProfileType } from '../schemas';
import { MotivationCard, MOTIVATION_OPTIONS } from './MotivationCard';

interface MotivationScreenProps {
  onSelect: (style: MotivationProfileType) => void;
  onBack?: () => void;
}

export function MotivationScreen({
  onSelect,
  onBack,
}: MotivationScreenProps): JSX.Element {
  const [isAdvancing, setIsAdvancing] = useState(false);
  const [selectedStyle, setSelectedStyle] =
    useState<MotivationProfileType | null>(null);

  const handleSelect = (style: MotivationProfileType): void => {
    if (isAdvancing) {
      return;
    }
    setSelectedStyle(style);
    setIsAdvancing(true);
    setTimeout(() => {
      onSelect(style);
    }, 400);
  };

  return (
    <Box flex={1} bg="background.primary" px="lg" py="xl">
      <Box flexDirection="row" alignItems="center" mb="md">
        {onBack ? (
          <Pressable
            onPress={onBack}
            accessibilityLabel="Go back"
            accessibilityRole="button"
            accessibilityHint="Returns to the previous onboarding screen"
          >
            <Box p="xs">
              <Text variant="h3" color="text.secondary">
                Back
              </Text>
            </Box>
          </Pressable>
        ) : null}
      </Box>

      <Animated.View entering={FadeIn.duration(400)}>
        <Box gap="sm" mb="lg">
          <Text variant="label" color="primary.500">
            Step 1 of 2
          </Text>
          <Text variant="h2" color="text.primary">
            How should VEX motivate you?
          </Text>
          <Text variant="body" color="text.secondary">
            One choice personalizes Home, your coach tone, and what VEX hints at
            first.
          </Text>
        </Box>
      </Animated.View>

      <Box flexDirection="row" flexWrap="wrap" gap="md" justifyContent="center">
        {MOTIVATION_OPTIONS.map((option, index) => (
          <MotivationCard
            key={option.key}
            index={index}
            isSelected={selectedStyle === option.key}
            onPress={() => handleSelect(option.key)}
            option={option}
          />
        ))}
      </Box>

      <Box flex={1} minHeight={20} />
      <Animated.View
        entering={FadeIn.duration(400).delay(300)}
        style={{ marginTop: 'auto' }}
      >
        <Pressable
          onPress={() => handleSelect('coach_led')}
          accessibilityLabel="Use coach-led motivation style"
          accessibilityRole="button"
          accessibilityHint="Applies a balanced coach style and continues to the first session"
        >
          <Box alignItems="center" py="md">
            <Text variant="bodySmall" color="text.tertiary">
              Use the balanced coach style
            </Text>
          </Box>
        </Pressable>
      </Animated.View>
    </Box>
  );
}

export default MotivationScreen;
