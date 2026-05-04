import { useEffect, useState } from 'react';
import * as Sentry from '@sentry/react-native';

import { SessionMode } from '../../../session/modes';
import type { useSession } from '../../../session/hooks/useSession';

type SessionQuery = ReturnType<typeof useSession>;

export function useStudyQuizBreak(input: {
  currentMode: SessionMode;
  sessionQuery: SessionQuery;
}) {
  const { currentMode, sessionQuery } = input;
  const [quizBreakKey, setQuizBreakKey] = useState<string | null>(null);
  const [completedQuizBreaks, setCompletedQuizBreaks] = useState<string[]>([]);

  useEffect(() => {
    if (currentMode !== SessionMode.STUDY || !sessionQuery.isActive || sessionQuery.isPaused) {
      return;
    }

    const nextBreak = sessionQuery.completionPercentage >= 90
      ? '90'
      : sessionQuery.completionPercentage >= 50
        ? '50'
        : null;

    if (!nextBreak || quizBreakKey === nextBreak || completedQuizBreaks.includes(nextBreak)) {
      return;
    }

    setQuizBreakKey(nextBreak);
    sessionQuery.pauseSession('study_quiz').catch((caught) => {
      Sentry.captureException(caught, { tags: { feature: 'study-quiz-break' } });
    });
  }, [completedQuizBreaks, currentMode, quizBreakKey, sessionQuery]);

  const finishQuizBreak = (correctAnswers?: number): void => {
    if (typeof correctAnswers === 'number') {
      sessionQuery.applyStudyQuizBonus(correctAnswers);
    }
    if (quizBreakKey) {
      setCompletedQuizBreaks((current) => [...current, quizBreakKey]);
    }
    setQuizBreakKey(null);
    void sessionQuery.resumeSession();
  };

  return {
    finishQuizBreak,
    quizBreakKey,
  };
}
