/**
 * Content Study Hooks
 *
 * Re-export from hooks/ folder for backward compatibility.
 * All hooks have been split into domain-specific files.
 */

export { contentStudyQueryKeys } from "./hooks/queryKeys";
export { getStudyPlanTitle, resolveActiveStudyPlan } from "./hooks/helpers";
export { useContentInput } from "./hooks/useContentInput";
export { useContentReview } from "./hooks/useContentReview";
export { useStudyPlan } from "./hooks/useStudyPlan";
export { useContentHistory } from "./hooks/useContentHistory";
export { useRateLimit } from "./hooks/useRateLimit";
export { useActiveStudyPlan } from "./hooks/useActiveStudyPlan";
export { useCompleteStudyPlanTask } from "./hooks/useCompleteStudyPlanTask";

export type { ActiveStudyPlan } from "./hooks/helpers";
