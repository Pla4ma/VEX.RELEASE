import React from 'react';
import {
  View,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { Button } from '../../../components/primitives/Button';
import { useTheme } from '../../../theme';
import { quizPanelStyles } from './QuizPanelStyles';

interface ShortAnswerInputProps {
  value: string;
  onChangeText: (text: string) => void;
  onSubmit: () => void;
}

export const ShortAnswerInput: React.FC<ShortAnswerInputProps> = ({
  value,
  onChangeText,
  onSubmit,
}) => {
  const { theme } = useTheme();

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1 }}
    >
      <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ flex: 1 }}>
        <View style={quizPanelStyles.shortAnswerContainer}>
          <TextInput
            style={[
              quizPanelStyles.shortAnswerInput,
              {
                color: theme.colors.text.primary,
                borderColor: theme.colors.border.DEFAULT,
                backgroundColor: theme.colors.background.primary,
              },
            ]}
            placeholder="Type your answer..."
            placeholderTextColor={theme.colors.text.muted}
            value={value}
            onChangeText={onChangeText}
            multiline
            maxLength={500}
          />
          <Button
            <Text>size="sm"</Text>
            onPress={onSubmit}
            disabled={!value.trim()}
            accessibilityLabel="Submit answer"
            accessibilityRole="button"
            accessibilityHint="Double tap to activate"
          >
            Submit
          </Button>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};
