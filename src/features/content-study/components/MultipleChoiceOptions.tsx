import React from 'react';
import { Pressable } from 'react-native';
import { Text } from '../../../components/primitives/Text';
import { useTheme } from '../../../theme/ThemeContext';
import { Icon } from '../../../icons/components/Icon';
import { quizPanelStyles } from './QuizPanelStyles';
import { cardSelection } from '../../../utils/haptics';

interface MultipleChoiceOptionsProps {
  options: string[];
  correctAnswer: string;
  selectedAnswer: string | undefined;
  isAnswered: boolean;
  isRevealed: boolean;
  readOnly: boolean;
  onSelect: (option: string) => void;
}

export const MultipleChoiceOptions: React.ComponentType<MultipleChoiceOptionsProps> = ({
  options,
  correctAnswer,
  selectedAnswer,
  isAnswered,
  isRevealed,
  readOnly,
  onSelect,
}) => {
  const { theme } = useTheme();
  const showCorrectness = isAnswered || isRevealed;

  return (
    <>
      {options.map((option, optIndex) => {
        const isSelected = selectedAnswer === option;
        const isCorrectOption = option === correctAnswer;

        return (
          <Pressable
            key={optIndex}
            style={({ pressed }) => [
              quizPanelStyles.optionButton,
              {
                backgroundColor: showCorrectness
                  ? isCorrectOption
                    ? theme.colors.success[500]
                    : isSelected
                      ? theme.colors.error[500]
                      : theme.colors.background.secondary
                  : isSelected
                    ? theme.colors.primary[500]
                    : theme.colors.background.secondary,
                borderColor: showCorrectness
                  ? isCorrectOption
                    ? theme.colors.success[500]
                    : isSelected
                      ? theme.colors.error[500]
                      : theme.colors.border.DEFAULT
                  : isSelected
                    ? theme.colors.primary[500]
                    : theme.colors.border.DEFAULT,
                opacity:
                  pressed && !isAnswered && !readOnly ? 0.8 : 1,
              },
            ]}
            onPress={() => { cardSelection(); onSelect(option); }}
            disabled={isAnswered || readOnly}
            accessibilityLabel={`Answer option: ${option}${isSelected ? ', selected' : ''}`}
            accessibilityRole="button"
            accessibilityHint="Double tap to select this answer"
          >
            <Text
              style={[
                quizPanelStyles.optionText,
                {
                  color: showCorrectness
                    ? isCorrectOption || isSelected
                      ? theme.colors.background.primary
                      : theme.colors.text.primary
                    : isSelected
                      ? theme.colors.background.primary
                      : theme.colors.text.primary,
                },
              ]}
            >
              {option}
            </Text>
            {showCorrectness && isCorrectOption && (
              <Icon
                name="check"
                size="sm"
                color={theme.colors.background.primary}
              />
            )}
            {showCorrectness && isSelected && !isCorrectOption && (
              <Icon
                name="x"
                size="sm"
                color={theme.colors.background.primary}
              />
            )}
          </Pressable>
        );
      })}
    </>
  );
};
