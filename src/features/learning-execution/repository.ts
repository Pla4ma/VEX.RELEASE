import type { ActiveStudyPlan } from '../content-study';
import type { LearningExecutionPersona, LearningSessionTarget } from './types';
import { LearningSessionTargetSchema } from './schemas';

export function mapActivePlanToLearningTarget(input: {
  plan: ActiveStudyPlan | null;
  persona: LearningExecutionPersona;
}): LearningSessionTarget | null {
  if (!input.plan) {
    return null;
  }

  return LearningSessionTargetSchema.parse({
    contentId: input.plan.contentId,
    focusAreas: input.plan.nextTask ? [input.plan.nextTask.content] : [],
    generationId: input.plan.generationId,
    nextTaskId: input.plan.nextTask?.id ?? null,
    persona: input.persona,
    remainingMinutes: Math.max(1, input.plan.remainingMinutes),
    title: input.plan.title,
  });
}
