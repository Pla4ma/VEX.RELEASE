import React from 'react';
import { Pressable } from 'react-native';
import Animated, {
  FadeInUp,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withSequence,
  useSharedValue,
} from 'react-native-reanimated';

import { Box } from '../../../components/primitives/Box';
import { Text } from '../../../components/primitives/Text';
import { useTheme } from '../../../theme';
import { buttonTap } from '../../../utils/haptics';
import type { SessionSuggestion } from './session-suggestions-types';

/**
 * Individual suggestion card
 */
export function SuggestionCard({
  suggestion,
  index,
  onPress,
}: {
  suggestion: SessionSuggestion;
  index: number;
  onPress: () => void;
}): JSX.Element {
  const { theme } = useTheme();
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePress = () => {
    buttonTap();
    scale.value = withSequence(
      withTiming(0.98, { duration: 100 }),
      withSpring(1, { damping: 15, stiffness: 200 }),
    );
    onPress();
  };

  return (
    <Animated.View
      entering={FadeInUp.duration(300).delay(index * 100)}
      style={animatedStyle}
    >
      <Pressable
        onPress={handlePress}
        accessibilityLabel={`${suggestion.title} suggestion, ${suggestion.durationMinutes} minutes`}
        accessibilityRole="button"
        accessibilityHint="Double tap to start this session"
      >
        <Box
          flexDirection="row"
          alignItems="center"
          gap="md"
          p="md"
          borderRadius="xl"
          bg={theme.colors.background.secondary}
          borderWidth={1}
          borderColor={theme.colors.border.DEFAULT}
        >
          {/* Icon */}
          <Box
            width={44}
            height={44}
            borderRadius="lg"
            bg={`${theme.colors.primary[500]}15`}
            justifyContent="center"
            alignItems="center"
          >
            <Text fontSize={20}>{suggestion.icon}</Text>
          </Box>

          {/* Content */}
          <Box flex={1} gap="xs">
            <Text variant="body" color="text.primary" fontWeight="600">
              {suggestion.title}
            </Text>
            <Text variant="caption" color="text.secondary" numberOfLines={2}>
              {suggestion.reasoning}
            </Text>
            <Box flexDirection="row" alignItems="center" gap="sm" mt="xs">
              <Box
                px="sm"
                py="xs"
                borderRadius="sm"
                bg={theme.colors.background.tertiary}
              >
                <Text variant="caption" color="text.secondary" fontSize={10}>
                  {suggestion.durationMinutes} min
                </Text>
              </Box>
              <Box
                px="sm"
                py="xs"
                borderRadius="sm"
                bg={theme.colors.background.tertiary}
              >
                <Text variant="caption" color="text.secondary" fontSize={10}>
                  {suggestion.mode === 'solo' ? '🧘 Solo' : '🛡️ Squad'}
                </Text>
              </Box>
              {suggestion.confidence > 0.8 && (
                <Text fontSize={10}>⭐ Recommended</Text>
              )}
            </Box>
          </Box>

          {/* Arrow */}
          <Text fontSize={20} color={theme.colors.text.tertiary}>
            ›
          </Text>
        </Box>
      </Pressable>
    </Animated.View>
  );
}
