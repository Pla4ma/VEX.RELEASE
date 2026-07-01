import React, { useState, useCallback, useMemo } from 'react';
import { View, ScrollView } from 'react-native';
import { Text } from '../../../components/primitives/Text';
import { useTheme } from '../../../theme/ThemeContext';
import { Icon } from '../../../icons/components/Icon';
import type { QuizPanelProps } from '../types';
import { quizPanelStyles } from './QuizPanelStyles';
import { QuizCard } from './QuizCard';

export const QuizPanel: React.ComponentType<QuizPanelProps> = ({
  items,
  answers,
  activeId,
  onAnswer,
  onRevealAnswer,
  showResults = false,
  score,
  readOnly = false,
}) => {
  const { theme } = useTheme();
  const [revealedIds, setRevealedIds] = useState<Set<string>>(new Set());
  const [shortAnswers, setShortAnswers] = useState<Record<string, string>>({});

  const handleOptionSelect = useCallback(
    (quizId: string, option: string) => {
      if (readOnly || answers[quizId]) {
        return;
      }
      onAnswer(quizId, option);
    },
    [answers, onAnswer, readOnly],
  );

  const handleShortAnswerSubmit = useCallback(
    (quizId: string) => {
      const answer = shortAnswers[quizId]?.trim();
      if (!answer || readOnly) {
        return;
      }
      onAnswer(quizId, answer);
    },
    [shortAnswers, onAnswer, readOnly],
  );

  const handleReveal = useCallback(
    (quizId: string) => {
      setRevealedIds((prev) => new Set([...prev, quizId]));
      onRevealAnswer(quizId);
    },
    [onRevealAnswer],
  );

  const calculateScore = useMemo(() => {
    if (!showResults || !score) {
      return null;
    }
    return {
      percentage: Math.round((score.correct / score.total) * 100),
      correct: score.correct,
      total: score.total,
    };
  }, [showResults, score]);

  return (
    <View style={quizPanelStyles.container}>
      <View style={quizPanelStyles.header}>
        <View style={quizPanelStyles.headerTitle}>
          <Icon
            name="help-circle"
            size="sm"
            color={theme.colors.primary[500]}
          />
          <Text
            style={[
              quizPanelStyles.title,
              { color: theme.colors.text.primary },
            ]}
          >
            Quick Quiz ({Object.keys(answers).length}/{items.length})
          </Text>
        </View>

        {calculateScore !== null && calculateScore !== undefined && (
          <View
            style={[
              quizPanelStyles.scoreBadge,
              {
                backgroundColor:
                  calculateScore.percentage >= 70
                    ? theme.colors.success[500]
                    : calculateScore.percentage >= 40
                      ? theme.colors.warning[500]
                      : theme.colors.error[500],
              },
            ]}
          >
            <Text
              style={[
                quizPanelStyles.scoreText,
                { color: theme.colors.background.primary },
              ]}
            >
              {calculateScore.percentage}%
            </Text>
          </View>
        )}
      </View>

      <ScrollView
        style={quizPanelStyles.quizList}
        showsVerticalScrollIndicator={false}
      >
        {items.map((quiz, index) => (
          <QuizCard
            key={quiz.id}
            quiz={quiz}
            index={index}
            answer={answers[quiz.id]}
            isRevealed={revealedIds.has(quiz.id)}
            isActive={activeId === quiz.id}
            readOnly={readOnly}
            onOptionSelect={handleOptionSelect}
            onReveal={handleReveal}
            shortAnswerValue={shortAnswers[quiz.id] || ''}
            onShortAnswerChange={(text) =>
              setShortAnswers((prev) => ({ ...prev, [quiz.id]: text }))
            }
            onShortAnswerSubmit={() => handleShortAnswerSubmit(quiz.id)}
          />
        ))}
      </ScrollView>
    </View>
  );
};
