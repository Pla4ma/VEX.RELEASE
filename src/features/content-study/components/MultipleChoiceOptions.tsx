import { vexFire } from "@/theme/tokens/vex-fire";
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
  const { theme: _theme } = useTheme();
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
                    ? vexFire.success
                    : isSelected
                      ? vexFire.danger
                      : vexFire.panel
                  : isSelected
                    ? vexFire.ember
                    : vexFire.panel,
                borderColor: showCorrectness
                  ? isCorrectOption
                    ? vexFire.success
                    : isSelected
                      ? vexFire.danger
                      : vexFire.border
                  : isSelected
                    ? vexFire.ember
                    : vexFire.border,
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
                      ? vexFire.background
                      : vexFire.cream
                    : isSelected
                      ? vexFire.background
                      : vexFire.cream,
                },
              ]}
            >
              {option}
            </Text>
            {showCorrectness && isCorrectOption && (
              <Icon
                name="check"
                size="sm"
                color={vexFire.background}
              />
            )}
            {showCorrectness && isSelected && !isCorrectOption && (
              <Icon
                name="x"
                size="sm"
                color={vexFire.background}
              />
            )}
          </Pressable>
        );
      })}
    </>
  );
};
