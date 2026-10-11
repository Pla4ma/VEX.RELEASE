import { vexFire } from "@/theme/tokens/vex-fire";
import React from 'react';
import {
  View,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { Button } from '../../../components/primitives/Button';
import { useTheme } from '../../../theme/ThemeContext';
import { quizPanelStyles } from './QuizPanelStyles';
import { Text as VexText } from '../../../components/primitives/Text';

interface ShortAnswerInputProps {
  value: string;
  onChangeText: (text: string) => void;
  onSubmit: () => void;
}

export const ShortAnswerInput: React.ComponentType<ShortAnswerInputProps> = ({
  value,
  onChangeText,
  onSubmit,
}) => {
  const { theme: _theme } = useTheme();

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1 }}
    >
      <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ flexGrow: 1 }}>
        <View style={quizPanelStyles.shortAnswerContainer}>
          <TextInput
            style={[
              quizPanelStyles.shortAnswerInput,
              {
                color: vexFire.cream,
                borderColor: vexFire.border,
                backgroundColor: vexFire.background,
              },
            ]}
            placeholder="Type your answer..."
            placeholderTextColor={vexFire.textMuted}
            value={value}
            onChangeText={onChangeText}
            multiline
            maxLength={500}
          />
          <Button
            size="sm"
            onPress={onSubmit}
            disabled={!value.trim()}
            accessibilityLabel="Submit answer"
            accessibilityRole="button"
            accessibilityHint="Double tap to activate"
          >
            <VexText>Submit</VexText>
          </Button>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};
