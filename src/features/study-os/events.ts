import { StudyPlanSchema } from "./schemas";

export function validateStudyPlanEventPayload(input: unknown) {
  return StudyPlanSchema.parse(input);
}
