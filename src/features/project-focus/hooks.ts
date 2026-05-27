import { useQuery } from "@tanstack/react-query";

import { listStoredProjectThreads } from "./repository";
import { type ProjectThread } from "./schemas";
import { useProjectFocusStore } from "./store";

export function useProjectThreads(userId: string | null, enabled = true) {
  const query = useQuery({
    enabled: Boolean(userId) && enabled,
    queryFn: () => listStoredProjectThreads(userId ?? ""),
    queryKey: ["project-focus", userId],
  });

  return {
    data: query.data ?? [],
    error: query.error,
    isError: query.isError,
    isPending: query.isPending,
    refetch: query.refetch,
  };
}

export function useActiveProjectThread(userId: string | null): {
  thread: ProjectThread | null;
  isPending: boolean;
  isError: boolean;
  isRescued: boolean;
  isStale: boolean;
} {
  const activeThreadId = useProjectFocusStore((s) => s.activeThreadId);
  const { data: threads, isPending, isError } = useProjectThreads(userId);

  const thread = activeThreadId
    ? (threads.find((t) => t.id === activeThreadId) ?? null)
    : (threads.find((t) => t.state !== "completed") ?? null);

  return {
    thread,
    isPending,
    isError,
    isRescued: thread?.state === "rescued",
    isStale: thread?.state === "stale",
  };
}
