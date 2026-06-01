import { captureSilentFailure } from '../../../utils/silent-failure';
import { useMemo, useState } from 'react';

import {
  useActiveStudyPlan,
  useCompleteStudyPlanTask,
} from '../../../features/content-study';
import { useLearningExecutionLayer } from '../../../features/learning-execution';

type ContentStudySessionMeta = {
  generationId: string | null;
  isContentStudy: boolean;
};

export type StudyProgressCardData = {
  error: string | null;
  isCompleting: boolean;
  onMarkComplete: () => void;
  onSkip: () => void;
  progress: number;
  progressLabel: string;
  taskLabel: string;
  taskTitle: string;
  // Enhanced study progress details (10.2)
  planTitle: string;
  chaptersCompleted: number;
  totalChapters: number;
  quizAccuracy: number | null; // percentage, null if no quizzes this session
  totalStudyTimeMinutes: number;
  nextSessionGoal: {
    topic: string;
    suggestedDurationMinutes: number;
  } | null;
};

function parseContentStudySessionMeta(
  notes?: string,
  tags?: string[],
): ContentStudySessionMeta {
  const isContentStudy = Boolean(
    tags?.includes('content-study') || tags?.includes('learning-execution'),
  );

  if (!notes) {
    return { generationId: null, isContentStudy };
  }

  try {
    const parsed = JSON.parse(notes) as { generationId?: string };
    return { generationId: parsed.generationId ?? null, isContentStudy };
  } catch (error) {
    captureSilentFailure(error, {
      feature: 'screens',
      operation: 'network-fallback',
      type: 'network',
    });
    return { generationId: null, isContentStudy };
  }
}

export function useSessionCompleteStudyProgress({
  notes,
  tags,
}: {
  notes?: string;
  tags?: string[];
}) {
  const [dismissedStudyPrompt, setDismissedStudyPrompt] = useState(false);
  const activeStudyPlanQuery = useActiveStudyPlan();
  const completeStudyTaskMutation = useCompleteStudyPlanTask();
  const learningExecution = useLearningExecutionLayer(
    activeStudyPlanQuery.data ?? null,
  );

  const sessionStudyMeta = useMemo(
    () => parseContentStudySessionMeta(notes, tags),
    [notes, tags],
  );

  const studyProgress = useMemo<StudyProgressCardData | null>(() => {
    const activePlan = activeStudyPlanQuery.data;
    const nextTask = activePlan?.nextTask;

    if (
      !sessionStudyMeta.isContentStudy ||
      !sessionStudyMeta.generationId ||
      dismissedStudyPrompt ||
      !activePlan ||
      activePlan.generationId !== sessionStudyMeta.generationId ||
      !nextTask
    ) {
      return null;
    }

    // Calculate next session goal (fallback to next task or estimate)
    const nextGoal = {
      topic: activePlan.nextTask?.content ?? learningExecution.copy.homeCta,
      suggestedDurationMinutes: activePlan.nextTask?.estimatedMinutes ?? 25,
    };

    return {
      error:
        completeStudyTaskMutation.error instanceof Error
          ? completeStudyTaskMutation.error.message
          : null,
      isCompleting: completeStudyTaskMutation.isPending,
      onMarkComplete: () => {
        completeStudyTaskMutation
          .mutateAsync({
            generationId: activePlan.generationId,
            taskId: nextTask.id,
          })
          .then(() => setDismissedStudyPrompt(true));
      },
      onSkip: () => setDismissedStudyPrompt(true),
      progress: activePlan.progressPercent / 100,
      progressLabel: `${learningExecution.copy.completionTitle}: ${activePlan.completedTasks}/${activePlan.totalTasks}`,
      taskLabel: `Step ${activePlan.completedTasks + 1}/${activePlan.totalTasks}`,
      taskTitle: nextTask.content,
      // Enhanced study progress details (10.2)
      planTitle: activePlan.title,
      chaptersCompleted: activePlan.completedTasks,
      totalChapters: activePlan.totalTasks,
      quizAccuracy: null, // Would need quiz data from session - placeholder
      totalStudyTimeMinutes:
        activePlan.remainingMinutes + (nextTask.estimatedMinutes ?? 0),
      nextSessionGoal: nextGoal,
    };
  }, [
    activeStudyPlanQuery.data,
    completeStudyTaskMutation,
    dismissedStudyPrompt,
    learningExecution.copy.completionTitle,
    learningExecution.copy.homeCta,
    sessionStudyMeta.generationId,
    sessionStudyMeta.isContentStudy,
  ]);

  return {
    studyProgress,
  };
}
