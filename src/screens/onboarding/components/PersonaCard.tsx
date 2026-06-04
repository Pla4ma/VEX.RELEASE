import React, { useState } from 'react';
import { Pressable } from 'react-native';
import Animated, {
  FadeIn,
  FadeInUp,
  useAnimatedStyle,
  withSpring,
  useSharedValue,
  withTiming,
  withSequence,
} from 'react-native-reanimated';
import { Box } from '../../../components/primitives/Box';
import { Text } from '../../../components/primitives/Text';
import { useTheme } from '../../../theme';
import { Icon } from '../../../icons';
import type { CoachPersona } from './persona-data';
import { lightColors } from '@/theme/tokens/colors';

function ExampleMessage({
  text,
  delay,
}: {
  text: string;
  delay: number;
}): JSX.Element {
  const { theme } = useTheme();
  return (
    <Animated.View entering={FadeIn.delay(delay).duration(400)}>
      <Box
        p="sm"
        borderRadius="lg"
        bg={theme.colors.background.tertiary}
        borderLeftWidth={3}
        borderLeftColor={theme.colors.primary[400]}
      >
        <Text variant="caption" color="text.secondary" fontStyle="italic">
          {text}
        </Text>
      </Box>
    </Animated.View>
  );
}

export function PersonaCard({
  persona,
  isSelected,
  onPress,
  index,
}: {
  persona: CoachPersona;
  isSelected: boolean;
  onPress: () => void;
  index: number;
}): JSX.Element {
  const { theme } = useTheme();
  const [showExamples, setShowExamples] = useState(false);
  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));
  const handlePress = () => {
    scale.value = withSequence(
      withTiming(0.98, { duration: 100 }),
      withSpring(1, { damping: 15, stiffness: 200 }),
    );
    setShowExamples(true);
    onPress();
  };
  return (
    <Animated.View
      entering={FadeInUp.delay(index * 150).duration(400)}
      style={animatedStyle}
    >
      <Pressable
        onPress={handlePress}
        accessibilityLabel="Persona option"
        accessibilityRole="button"
        accessibilityHint="Double tap to activate"
      >
        <Box
          p="lg"
          borderRadius="2xl"
          bg={
            isSelected
              ? `${persona.color}15`
              : theme.colors.background.secondary
          }
          borderWidth={2}
          borderColor={isSelected ? persona.color : theme.colors.border.DEFAULT}
          gap="md"
        >
          {}
          <Box flexDirection="row" alignItems="center" gap="md">
            <Box
              width={48}
              height={48}
              borderRadius="full"
              bg={isSelected ? persona.color : theme.colors.background.tertiary}
              justifyContent="center"
              alignItems="center"
            >
              <Icon name={persona.icon} size={24} color={isSelected ? lightColors.text.inverse : theme.colors.text.secondary} variant="solid" />
            </Box>

            <Box flex={1}>
              <Text
                variant="h4"
                color={isSelected ? 'text.primary' : 'text.primary'}
                fontWeight={isSelected ? '700' : '600'}
              >
                {persona.name}
              </Text>
              <Text variant="caption" color="text.tertiary">
                {persona.description}
              </Text>
            </Box>

            {}
            <Box
              width={24}
              height={24}
              borderRadius="full"
              bg={isSelected ? persona.color : theme.colors.background.tertiary}
              borderWidth={2}
              borderColor={
                isSelected ? persona.color : theme.colors.border.DEFAULT
              }
              justifyContent="center"
              alignItems="center"
            >
              {isSelected && (
                <Icon name="check" size={14} color={theme.colors.text.inverse} variant="solid" />
              )}
            </Box>
          </Box>

          {}
          {(isSelected || showExamples) && (
            <Box gap="sm">
              {persona.examples.map((example, i) => (
                <ExampleMessage key={i} text={example} delay={i * 200} />
              ))}
            </Box>
          )}
        </Box>
      </Pressable>
    </Animated.View>
  );
}
