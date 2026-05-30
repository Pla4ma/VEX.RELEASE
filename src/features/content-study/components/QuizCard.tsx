import React from "react";
import { View, Pressable } from "react-native";
import { Text } from "../../../components/primitives/Text";
import { useTheme } from "../../../theme";
import type { QuizItemProps } from "../types";
import { QUIZ_DIFFICULTY_CONFIG } from "../constants";
import { quizPanelStyles } from "./QuizPanelStyles";
import { MultipleChoiceOptions } from "./MultipleChoiceOptions";
import { ShortAnswerInput } from "./ShortAnswerInput";

type QuizAnswer = { answer: string; isCorrect?: boolean; timestamp: number };
interface QuizCardProps {
  quiz: QuizItemProps;
  index: number;
  answer: QuizAnswer | undefined;
  isRevealed: boolean;
  isActive: boolean;
  readOnly: boolean;
  onOptionSelect: (quizId: string, option: string) => void;
  onReveal: (quizId: string) => void;
  shortAnswerValue: string;
  onShortAnswerChange: (text: string) => void;
  onShortAnswerSubmit: () => void;
}

export const QuizCard: React.FC<QuizCardProps> = ({
  quiz,
  index,
  answer,
  isRevealed,
  isActive,
  readOnly,
  onOptionSelect,
  onReveal,
  shortAnswerValue,
  onShortAnswerChange,
  onShortAnswerSubmit,
}) => {
  const { theme } = useTheme();
  const isAnswered = !!answer;
  const isCorrect = answer?.isCorrect;
  const difficultyConfig = QUIZ_DIFFICULTY_CONFIG[quiz.difficulty];

  return (
    <View
      style={[
        quizPanelStyles.quizCard,
        {
          backgroundColor: isAnswered
            ? isCorrect
              ? theme.colors.success[50]
              : theme.colors.error[50]
            : isActive
              ? theme.colors.primary[50]
              : theme.colors.background.secondary,
          borderColor: isActive
            ? theme.colors.primary[500]
            : isAnswered
              ? isCorrect
                ? theme.colors.success[500]
                : theme.colors.error[500]
              : theme.colors.border.DEFAULT,
        },
      ]}
    >
      <View style={quizPanelStyles.questionHeader}>
        <Text style={[quizPanelStyles.questionNumber, { color: theme.colors.text.muted }]}>
          Q{index + 1}
        </Text>
        <View style={[quizPanelStyles.difficultyBadge, { backgroundColor: difficultyConfig.color }]}>
          <Text style={[quizPanelStyles.difficultyText, { color: difficultyConfig.textColor }]}>
            {difficultyConfig.label}
          </Text>
        </View>
        {quiz.conceptTag && (
          <View style={quizPanelStyles.conceptTag}>
            <Text
              style={[
                quizPanelStyles.conceptText,
                { color: theme.colors.text.muted },
              ]}
            >
              {quiz.conceptTag}
            </Text>
          </View>
        )}
      </View>

      <Text
        style={[quizPanelStyles.question, { color: theme.colors.text.primary }]}
      >
        {quiz.question}
      </Text>

      {quiz.options && quiz.options.length > 0 && (
        <View style={quizPanelStyles.optionsContainer}>
          <MultipleChoiceOptions
            options={quiz.options}
            correctAnswer={quiz.answer}
            selectedAnswer={answer?.answer}
            isAnswered={isAnswered}
            isRevealed={isRevealed}
            readOnly={readOnly}
            onSelect={(option) => onOptionSelect(quiz.id, option)}
          />
        </View>
      )}

      {!quiz.options && !isAnswered && !readOnly && (
        <ShortAnswerInput
          value={shortAnswerValue}
          onChangeText={onShortAnswerChange}
          onSubmit={onShortAnswerSubmit}
        />
      )}

      {!isAnswered && !isRevealed && !readOnly && (
        <Pressable
          style={({ pressed }) => [
            quizPanelStyles.revealButton,
            pressed && { opacity: 0.8 },
          ]}
          onPress={() => onReveal(quiz.id)}
          accessibilityLabel="Show Answer button"
          accessibilityRole="button"
          accessibilityHint="Double tap to activate"
        >
          <Text
            style={[
              quizPanelStyles.revealText,
              { color: theme.colors.primary[500] },
            ]}
          >
            Show Answer
          </Text>
        </Pressable>
      )}

      {(isRevealed || (isAnswered && !isCorrect)) && (
        <View
          style={[
            quizPanelStyles.answerReveal,
            { backgroundColor: theme.colors.background.primary },
          ]}
        >
          <Text
            style={[
              quizPanelStyles.answerLabel,
              { color: theme.colors.text.muted },
            ]}
          >
            Correct Answer:
          </Text>
          <Text
            style={[
              quizPanelStyles.answerText,
              { color: theme.colors.success[500] },
            ]}
          >
            {quiz.answer}
          </Text>
        </View>
      )}

      {(isAnswered || isRevealed) && quiz.explanation && (
        <View
          style={[
            quizPanelStyles.explanationContainer,
            { backgroundColor: theme.colors.background.primary },
          ]}
        >
          <Text
            style={[
              quizPanelStyles.explanationLabel,
              { color: theme.colors.text.muted },
            ]}
          >
            Explanation:
          </Text>
          <Text
            style={[
              quizPanelStyles.explanationText,
              { color: theme.colors.text.secondary },
            ]}
          >
            {quiz.explanation}
          </Text>
        </View>
      )}
    </View>
  );
};
