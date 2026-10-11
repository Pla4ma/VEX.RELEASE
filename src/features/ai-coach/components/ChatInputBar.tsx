import React from 'react';
import { View, TextInput, Pressable, Text } from 'react-native';
import { styles } from './CoachScreen.styles';
import { vexFire } from '../../../theme/tokens/vex-fire';


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
}: ChatInputBarProps): React.ReactNode {
  return (
    <View style={styles.inputContainer}>
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        placeholder="Ask your coach anything..."
        placeholderTextColor={vexFire.textMuted}
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
        accessibilityLabel="Send message"
        accessibilityRole="button"
        accessibilityHint="Double tap to activate"
      >
        <Text style={styles.sendButtonText}>Send</Text>
      </Pressable>
    </View>
  );
}
