/**
 * Content Study Query Keys
 * Centralized query key management for TanStack Query
 */

export const contentStudyQueryKeys = {
  all: ["content-study"] as const,
  content: (id: string) =>
    [...contentStudyQueryKeys.all, "content", id] as const,
  generation: (id: string) =>
    [...contentStudyQueryKeys.all, "generation", id] as const,
  status: (id: string) => [...contentStudyQueryKeys.all, "status", id] as const,
  history: (userId: string) =>
    [...contentStudyQueryKeys.all, "history", userId] as const,
  activePlan: (userId: string) =>
    [...contentStudyQueryKeys.all, "active-plan", userId] as const,
};
