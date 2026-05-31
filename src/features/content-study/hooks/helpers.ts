/**
 * Content Study Hook Helpers
 * Helper functions for content study hooks
 */

import { fetchGenerationById, fetchContentById } from '../ContentStudyService';
import { studySessionManager } from '../persistence';
import type { StudyContent, StudyGeneration, StudyTask } from '../types';

export interface ActiveStudyPlan {
  generationId: string;
  contentId: string;
  title: string;
  totalTasks: number;
  completedTasks: number;
  progressPercent: number;
  remainingMinutes: number;
  nextTask: StudyTask | null;
}

export function getStudyPlanTitle(
  content: StudyContent | null,
  generation: StudyGeneration,
): string {
  const trimmedTitle = content?.title?.trim();
  if (trimmedTitle) {
    return trimmedTitle;
  }

  const firstConcept = generation.keyConcepts[0]?.term?.trim();
  if (firstConcept) {
    return firstConcept;
  }

  return generation.summary.overview?.slice(0, 40).trim() || 'Study Plan';
}

export async function resolveActiveStudyPlan(): Promise<ActiveStudyPlan | null> {
  const sessions = await studySessionManager.getAllSessions();
  const sortedSessions = [...sessions].sort(
    (a, b) => b.startTime - a.startTime,
  );

  for (const persistedSession of sortedSessions) {
    const generation = await fetchGenerationById(persistedSession.generationId);
    if (!generation) {
      continue;
    }
    const content = await fetchContentById(persistedSession.contentId);
    const completedTaskIds = new Set(persistedSession.completedTasks);
    const nextTask =
      generation.tasks.find((task) => !completedTaskIds.has(task.id)) ?? null;

    if (!nextTask) {
      continue;
    }

    const remainingMinutes = generation.tasks
      .filter((task) => !completedTaskIds.has(task.id))
      .reduce((total, task) => total + task.estimatedMinutes, 0);

    return {
      generationId: generation.id,
      contentId: generation.contentId,
      title: getStudyPlanTitle(content, generation),
      totalTasks: generation.tasks.length,
      completedTasks: completedTaskIds.size,
      progressPercent:
        generation.tasks.length > 0
          ? Math.round((completedTaskIds.size / generation.tasks.length) * 100)
          : 0,
      remainingMinutes,
      nextTask,
    };
  }

  return null;
}
