import { z } from "zod";

export const SessionStudyContextSchema = z
  .object({
    contentId: z.string().min(1).optional(),
    generationId: z.string().min(1).optional(),
    studyPlanId: z.string().min(1).optional(),
    studyTarget: z.string().min(1).optional(),
    learningExecutionLabel: z.string().min(1).optional(),
    learningExecutionTaskId: z.string().min(1).optional(),
    source: z.enum(["learning-execution", "direct", "home"]).optional(),
  })
  .strict();

export type SessionStudyContext = z.infer<typeof SessionStudyContextSchema>;

export function extractStudyContextFromSession(
  sessionMetadata: Record<string, unknown> | undefined,
): SessionStudyContext {
  if (!sessionMetadata) {
    return {};
  }
  return SessionStudyContextSchema.partial().parse({
    contentId: sessionMetadata.contentId,
    generationId: sessionMetadata.generationId,
    studyPlanId: sessionMetadata.studyPlanId,
    studyTarget: sessionMetadata.studyTarget,
    learningExecutionLabel: sessionMetadata.learningExecutionLabel,
    learningExecutionTaskId: sessionMetadata.learningExecutionTaskId,
    source: sessionMetadata.source,
  });
}

export function hasActiveStudyFollowUp(context: SessionStudyContext): boolean {
  return Boolean(
    context.studyPlanId || context.contentId || context.studyTarget,
  );
}
