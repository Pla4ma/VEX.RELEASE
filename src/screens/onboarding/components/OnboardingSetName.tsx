/**
 * OnboardingSetName Component
 *
 * Single text input for display name personalization.
 * Large font, validates non-empty, skippable.
 *
 * @phase 2.3
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  TextInput,
  Pressable,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import Animated, {
  FadeIn,
  FadeInUp,
  useAnimatedStyle,
  withSpring,
  useSharedValue,
} from 'react-native-reanimated';

import { Box } from '../../../components/primitives/Box';
import { Button } from '../../../components/primitives/Button';
import { Text } from '../../../components/primitives/Text';
import { useTheme } from '../../../theme/ThemeContext';
import { CharacterCounter } from './CharacterCounter';
import { Text as VexText } from '../../../components/primitives/Text';

interface OnboardingSetNameProps {
  initialName?: string;
  onContinue: (name: string) => void;
  onSkip: () => void;
}

const DEFAULT_NAME = 'Champion';
const MAX_LENGTH = 20;

/**
 * Main name setup component
 */
export function OnboardingSetName({
  initialName,
  onContinue,
  onSkip,
}: OnboardingSetNameProps): React.ReactNode {
  const { theme } = useTheme();
  const [name, setName] = useState(initialName || '');
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<TextInput>(null);
  const scaleAnim = useSharedValue(1);

  // Auto-focus on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      inputRef.current?.focus();
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  const trimmedName = name.trim();
  const isValid = trimmedName.length > 0 && trimmedName.length <= MAX_LENGTH;

  const handleContinue = () => {
    if (isValid) {
      scaleAnim.value = withSpring(0.98, { damping: 15, stiffness: 300 });
      onContinue(trimmedName);
    }
  };

  const handleSkip = () => {
    onSkip();
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scaleAnim.value }],
  }));

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1 }}
    >
      <Box flex={1} justifyContent="space-between" px="xl" py="2xl">
        {/* Header */}
        <Animated.View entering={FadeIn.duration(400)}>
          <Box gap="md" mt="2xl">
            <Text fontSize={48} color={theme.colors.primary[500]}>V</Text>
            <Box gap="sm">
              <Text variant="h2" color="text.primary">
                What should we call you?
              </Text>
              <Text variant="body" color="text.secondary">
                This is how we&apos;ll address you in the app.
              </Text>
            </Box>
          </Box>
        </Animated.View>

        {/* Input Section */}
        <Animated.View
          entering={FadeInUp.delay(200).duration(400)}
          style={animatedStyle}
        >
          <Box gap="md">
            {/* Input Container */}
            <Box
              p="lg"
              borderRadius="2xl"
              bg={theme.colors.background.secondary}
              borderWidth={isFocused ? 2 : 1}
              borderColor={
                isFocused
                  ? theme.colors.primary[500]
                  : theme.colors.border.DEFAULT
              }
            >
              <TextInput
                ref={inputRef}
                value={name}
                onChangeText={setName}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                placeholder="Enter your name"
                placeholderTextColor={theme.colors.text.tertiary}
                maxLength={MAX_LENGTH}
                autoCapitalize="words"
                autoCorrect={false}
                style={{
                  fontSize: 28,
                  fontWeight: '700',
                  color: theme.colors.text.primary,
                  padding: 0,
                }}
              />
            </Box>

            {/* Character Counter */}
            <Box
              flexDirection="row"
              justifyContent="space-between"
              alignItems="center"
            >
              <Text variant="caption" color="text.tertiary">
                {trimmedName.length === 0
                  ? 'Required to continue'
                  : isValid
                    ? 'Looks good!'
                    : 'Name is too long'}
              </Text>
              <CharacterCounter current={name.length} max={MAX_LENGTH} />
            </Box>
          </Box>
        </Animated.View>

        {/* Action Buttons */}
        <Animated.View entering={FadeInUp.delay(400).duration(400)}>
          <Box gap="md">
            <Button
              size="lg"
              variant="primary"
              fullWidth
              onPress={handleContinue}
              disabled={!isValid}
              accessibilityLabel="Continue"
              accessibilityRole="button"
              accessibilityHint="Double tap to activate"
            >
              <VexText>Continue</VexText>
            </Button>

            <Pressable
              onPress={handleSkip}
              accessibilityLabel="Skip setting name for now"
              accessibilityRole="button"
              accessibilityHint="Double tap to activate"
            >
              <Box py="sm" alignItems="center">
                <Text variant="body" color="text.tertiary">
                  I&apos;ll decide later ({DEFAULT_NAME})
                </Text>
              </Box>
            </Pressable>
          </Box>
        </Animated.View>
      </Box>
    </KeyboardAvoidingView>
  );
}

export { OnboardingSetName }