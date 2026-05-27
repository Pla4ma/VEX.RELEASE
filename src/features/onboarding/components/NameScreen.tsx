import React, { useState, useEffect, useRef } from "react";
import { TextInput, Pressable, Keyboard } from "react-native";
import Animated, {
  FadeIn,
  FadeInUp,
  useAnimatedStyle,
  withSpring,
} from "react-native-reanimated";
import { Box } from "../../../components/primitives/Box";
import { Text } from "../../../components/primitives/Text";
import { Button } from "../../../components/primitives/Button";
import { useTheme } from "../../../theme";
interface NameScreenProps {
  onContinue: (name: string) => void;
  onSkip: () => void;
}
export function NameScreen({
  onContinue,
  onSkip,
  onBack,
}: NameScreenProps & { onBack?: () => void }): JSX.Element {
  const { theme } = useTheme();
  const [name, setName] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<TextInput>(null);
  const isValid = name.trim().length >= 2;
  useEffect(() => {
    const timer = setTimeout(() => {
      inputRef.current?.focus();
    }, 500);
    return () => clearTimeout(timer);
  }, []);
  const handleContinue = () => {
    if (isValid) {
      Keyboard.dismiss();
      onContinue(name.trim());
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
    <Box flex={1} bg="background.primary" px="lg" py="xl">
      {}
      <Box flexDirection="row" alignItems="center" mb="md">
        {onBack && (
          <Pressable onPress={onBack} style={{ marginRight: 12 }}>
            <Box p="xs">
              <Text variant="h3" color="text.secondary">
                ‹
              </Text>
            </Box>
          </Pressable>
        )}
      </Box>

      {}
      <Animated.View entering={FadeIn.duration(400)}>
        <Box gap="sm" mb="xl">
          <Text variant="label" color="primary.500">
            Step 3 of 4
          </Text>
          <Text variant="h2" color="text.primary">
            What should we call you?
          </Text>
          <Text variant="body" color="text.secondary">
            This is how you'll appear to your squad.
          </Text>
        </Box>
      </Animated.View>

      {}
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
            onSubmitEditing={handleContinue}
            returnKeyType="done"
            maxLength={30}
            style={{
              fontSize: 24,
              fontWeight: "600",
              color: theme.colors.text.primary,
              textAlign: "center",
            }}
          />
        </Animated.View>

        {}
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

      {}
      {isValid && (
        <Animated.View
          entering={FadeInUp.duration(400)}
          style={{ marginTop: theme.spacing[8] }}
        >
          <Box alignItems="center" gap="md">
            <Box
              width={80}
              height={80}
              borderRadius="full"
              bg={theme.colors.primary[500]}
              justifyContent="center"
              alignItems="center"
            >
              <Text
                fontSize={32}
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

      {}
      <Box flex={1} minHeight={40} />

      {}
      <Animated.View
        entering={FadeInUp.duration(400).delay(400)}
        style={{ width: "100%" }}
      >
        <Button
          variant="primary"
          size="lg"
          fullWidth
          onPress={handleContinue}
          disabled={!isValid}
          accessibilityLabel="Continue → button"
          accessibilityRole="button"
          accessibilityHint="Activates this control"
        >
          Continue →
        </Button>
      </Animated.View>

      {}
      <Animated.View
        entering={FadeIn.duration(400).delay(500)}
        style={{ marginTop: "auto" }}
      >
        <Pressable
          onPress={onSkip}
          accessibilityLabel="Skip for now › button"
          accessibilityRole="button"
          accessibilityHint="Activates this control"
        >
          <Box alignItems="center" py="md">
            <Text variant="bodySmall" color="text.tertiary">
              Skip for now ›
            </Text>
          </Box>
        </Pressable>
      </Animated.View>
    </Box>
  );
}
export default NameScreen;
