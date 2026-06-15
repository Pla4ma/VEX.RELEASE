import React from 'react';
import { TextInput, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { Box } from '../../../components/primitives/Box';
import { Text } from '../../../components/primitives/Text';
import { ELEMENT_THEMES } from '../../../features/companion/types';
import type { CompanionElement } from '../../../features/companion/types';
import { glow } from '../../../theme/tokens/elevation';
import { useTheme } from '../../../theme/ThemeContext';

export function CoachLine({ text }: { text: string }): JSX.Element | null {
  if (!text) {return null;}

  return (
    <Box
      p="md"
      mt="md"
      bg="background.secondary"
      borderRadius="lg"
      borderWidth={1}
      borderColor="border.light"
    >
      <Text variant="caption" color="text.secondary" textAlign="center">
        {text}
      </Text>
    </Box>
  );
}

export function CompanionVisual({
  element,
}: {
  element: string | null;
}): JSX.Element | null {
  if (!element) {return null;}

  const elementTheme =
    ELEMENT_THEMES[element as CompanionElement] ?? ELEMENT_THEMES.LUMINA;

  return (
    <Box alignItems="center" py="md">
      <View
        style={{
          width: 56,
          height: 56,
          borderRadius: 28,
          backgroundColor: elementTheme.primary,
          ...glow(elementTheme.glow, 'soft'),
        }}
      />
      <Text variant="caption" color="text.tertiary" mt="xs">
        Your companion is ready
      </Text>
    </Box>
  );
}

export function StudyTarget({
  onChangeText,
  visible,
  target,
}: {
  onChangeText: (value: string) => void;
  visible: boolean;
  target: string;
}): JSX.Element | null {
  const { theme } = useTheme();
  if (!visible) {return null;}

  return (
    <Animated.View entering={FadeInDown.duration(250)}>
      <Box
        p="md"
        mt="md"
        bg="background.secondary"
        borderRadius="lg"
        borderWidth={1}
        borderColor="border.light"
      >
        <Text variant="label" color="text.secondary" mb="sm">
          What are you studying today?
        </Text>
        <TextInput
          accessibilityHint="Sets the study target attached to this focus session"
          accessibilityLabel="Study target"
          accessibilityRole="text"
          onChangeText={onChangeText}
          placeholder="Biology notes, calculus review, exam prep"
          placeholderTextColor={theme.colors.text.tertiary}
          style={{
            color: theme.colors.text.primary,
            minHeight: 44,
            paddingVertical: theme.spacing[2],
          }}
          value={target}
        />
      </Box>
    </Animated.View>
  );
}
