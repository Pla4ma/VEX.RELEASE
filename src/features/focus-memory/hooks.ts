import { useQuery } from "@tanstack/react-query";

import { listActiveMemories } from "./service";

export function useActiveFocusMemories(userId: string | null) {
  const query = useQuery({
    queryKey: ["focus-memory", userId],
    queryFn: () => listActiveMemories(userId ?? ""),
    enabled: Boolean(userId),
  });

  return {
    data: query.data ?? [],
    isPending: query.isPending,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
}
