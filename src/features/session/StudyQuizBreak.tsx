import React, { useEffect, useMemo, useState } from "react";
import * as Sentry from "@sentry/react-native";

import { Box } from "../../components/primitives/Box";
import { Button } from "../../components/primitives/Button";
import { Text } from "../../components/primitives/Text";
import { getQuizForStudyPlan } from "../content-study/service";
import type { QuizItem } from "../content-study/types";

type StudyQuizBreakProps = {
  isVisible: boolean;
  onClose: (correctAnswers: number) => void;
  onSkip: () => void;
  studyPlanId: string | undefined;
};

export function StudyQuizBreak({
  isVisible,
  onClose,
  onSkip,
  studyPlanId,
}: StudyQuizBreakProps): JSX.Element | null {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [quizItems, setQuizItems] = useState<QuizItem[]>([]);

  useEffect(() => {
    if (!isVisible || !studyPlanId) {
      return;
    }

    let isCancelled = false;
    setIsLoading(true);
    setError(null);

    getQuizForStudyPlan(studyPlanId)
      .then((items) => {
        if (!isCancelled) {
          setQuizItems(items);
        }
      })
      .catch((caught) => {
        if (!isCancelled) {
          setError(
            "Couldn't load the study quiz. You can keep the session moving.",
          );
        }
        Sentry.captureException(caught, {
          tags: { feature: "study-quiz-break" },
        });
      })
      .finally(() => {
        if (!isCancelled) {
          setIsLoading(false);
        }
      });

    return () => {
      isCancelled = true;
    };
  }, [isVisible, studyPlanId]);

  const correctAnswers = useMemo(
    () =>
      quizItems.filter((item) => {
        const answer = answers[item.id];
        return (
          answer?.trim().toLowerCase() === item.answer.trim().toLowerCase()
        );
      }).length,
    [answers, quizItems],
  );

  if (!isVisible) {
    return null;
  }

  return (
    <Box
      position="absolute"
      left={16}
      right={16}
      bottom={120}
      p="lg"
      bg="background.elevated"
      borderRadius="xl"
      style={{ zIndex: 30 }}
    >
      <Text variant="h4" color="text.primary" mb="xs">
        Study check
      </Text>
      <Text variant="body" color="text.secondary" mb="md">
        Answer up to three questions for a score bonus, or skip and keep moving.
      </Text>

      {isLoading ? (
        <Box minHeight={88} borderRadius="lg" bg="background.tertiary" />
      ) : null}

      {error ? (
        <Text variant="body" color="error.DEFAULT" mb="md">
          {error}
        </Text>
      ) : null}

      {quizItems.map((item, index) => (
        <Box key={item.id} mb="sm">
          <Text variant="label" color="text.primary">
            {`${index + 1}. ${item.question}`}
          </Text>
          <Box flexDirection="row" gap="sm" flexWrap="wrap" mt="xs">
            {(item.options ?? [item.answer]).slice(0, 4).map((option) => (
              <Button
                key={option}
                accessibilityLabel={`Answer ${option}`}
                accessibilityHint="Selects this quiz answer"
                variant={answers[item.id] === option ? "primary" : "secondary"}
                size="sm"
                onPress={() =>
                  setAnswers((current) => ({ ...current, [item.id]: option }))
                }
                accessibilityRole="button"
              >
                {option}
              </Button>
            ))}
          </Box>
        </Box>
      ))}

      <Box flexDirection="row" gap="sm" mt="sm">
        <Button
          variant="secondary"
          onPress={onSkip}
          accessibilityLabel="Skip study quiz"
          accessibilityRole="button"
          accessibilityHint="Double tap to activate"
        >
          Skip
        </Button>
        <Button
          variant="primary"
          onPress={() => onClose(correctAnswers)}
          accessibilityLabel="Submit study quiz"
          accessibilityRole="button"
          accessibilityHint="Double tap to activate"
        >
          {`Continue +${correctAnswers * 5}`}
        </Button>
      </Box>
    </Box>
  );
}
