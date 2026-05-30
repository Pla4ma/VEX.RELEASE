import React from "react";
import { View, TextInput, Pressable, Text } from "react-native";
import { styles } from "./CoachScreen.styles";
import { launchColors } from "@theme/tokens/launch-colors";

interface ChatInputBarProps {
  value: string;
  onChangeText: (text: string) => void;
  onSend: () => void;
  disabled: boolean;
}

export function ChatInputBar({
  value,
  onChangeText,
  onSend,
  disabled,
}: ChatInputBarProps): JSX.Element {
  return (
    <View style={styles.inputContainer}>
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        placeholder="Ask your coach anything..."
        placeholderTextColor={launchColors.hex_9ca3af}
        multiline
        maxLength={200}
        onSubmitEditing={onSend}
        returnKeyType="send"
      />
      <Pressable
        style={({ pressed }) => [
          styles.sendButton,
          !value.trim() && styles.sendButtonDisabled,
          pressed && { opacity: 0.8 },
        ]}
        onPress={onSend}
        disabled={disabled}
        accessibilityLabel="Send button"
        accessibilityRole="button"
        accessibilityHint="Double tap to activate"
      >
        <Text style={styles.sendButtonText}>Send</Text>
      </Pressable>
    </View>
  );
}
