/**
 * NameInputSection Component
 *
 * Name input section for name and goal selection screen.
 * Handles name input, validation, and avatar preview.
 *
 * @phase 4
 */

import React, { useState, useEffect, useRef } from "react";
import { TextInput, Keyboard } from "react-native";
import Animated, {
  FadeIn,
  FadeInUp,
  useAnimatedStyle,
  withSpring,
} from "react-native-reanimated";

import { Box } from "../../../components/primitives/Box";
import { Text } from "../../../components/primitives/Text";
import { useTheme } from "../../../theme";

interface NameInputSectionProps {
  name: string;
  setName: (name: string) => void;
  isFocused: boolean;
  setIsFocused: (focused: boolean) => void;
  showGoals: boolean;
}

/**
 * Name input section component
 */
export function NameInputSection({
  name,
  setName,
  isFocused,
  setIsFocused,
  showGoals,
}: NameInputSectionProps): JSX.Element {
  const { theme } = useTheme();
  const inputRef = useRef<TextInput>(null);

  const isValid = name.trim().length >= 2;

  // Auto-focus input on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      inputRef.current?.focus();
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  const handleNameSubmit = () => {
    if (isValid) {
      Keyboard.dismiss();
      // Show goals after name is entered
    }
  };

  const inputAnimatedStyle = useAnimatedStyle(() => ({
    borderColor: withSpring(
      isFocused ? theme.colors.primary[500] : theme.colors.border.DEFAULT,
      { damping: 15, stiffness: 150 },
    ),
    transform: [
      {
        scale: withSpring(isFocused ? 1.02 : 1, {
          damping: 15,
          stiffness: 150,
        }),
      },
    ],
  }));

  return (
    <>
      {/* Name Input Section */}
      <Animated.View
        entering={FadeInUp.duration(500).delay(200)}
        style={{ width: "100%" }}
      >
        <Animated.View
          style={[
            {
              borderRadius: 16,
              borderWidth: 2,
              backgroundColor: theme.colors.background.secondary,
              padding: theme.spacing[4],
            },
            inputAnimatedStyle,
          ]}
        >
          <TextInput
            ref={inputRef}
            value={name}
            onChangeText={setName}
            placeholder="Enter your name"
            placeholderTextColor={theme.colors.text.placeholder}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            onSubmitEditing={handleNameSubmit}
            returnKeyType="done"
            maxLength={30}
            editable={!showGoals}
            style={{
              fontSize: 24,
              fontWeight: "600",
              color: theme.colors.text.primary,
              textAlign: "center",
            }}
          />
        </Animated.View>

        {/* Character count / hint */}
        <Box mt="sm" alignItems="center">
          <Text
            variant="caption"
            color={
              name.length > 0 && !isValid ? "error.DEFAULT" : "text.tertiary"
            }
          >
            {name.length > 0 && !isValid
              ? "Name must be at least 2 characters"
              : `${name.length}/30 characters`}
          </Text>
        </Box>
      </Animated.View>

      {/* Avatar preview (if name entered and not focused) */}
      {isValid && !isFocused && (
        <Animated.View
          entering={FadeInUp.duration(400)}
          style={{ marginTop: theme.spacing[6] }}
        >
          <Box alignItems="center" gap="md">
            <Box
              width={60}
              height={60}
              borderRadius="full"
              bg={theme.colors.primary[500]}
              justifyContent="center"
              alignItems="center"
            >
              <Text
                fontSize={24}
                color={theme.colors.text.inverse}
                fontWeight="700"
              >
                {name.charAt(0).toUpperCase()}
              </Text>
            </Box>
            <Text variant="body" color="text.secondary">
              Nice to meet you, {name.trim()}!
            </Text>
          </Box>
        </Animated.View>
      )}
    </>
  );
}

export default NameInputSection;
