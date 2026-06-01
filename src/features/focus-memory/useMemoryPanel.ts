import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { listActiveMemories, deleteMemory, acceptMemory } from './service';
import {
  MemoryPanelItemSchema,
  WHAT_VEX_LEARNED_MIN_SESSIONS,
} from './memory-panel-types';
import { useMemoryConsoleVisibility } from './useMemoryConsoleVisibility';
import type { FocusMemory } from './schemas';

function toPanelItem(
  memory: FocusMemory,
  isHidden: boolean,
): ReturnType<typeof MemoryPanelItemSchema.parse> {
  return MemoryPanelItemSchema.parse({
    id: memory.id,
    observation: memory.summary,
    evidence: memory.source,
    confidence: memory.confidence,
    source: memory.source,
    type: memory.type,
    isHidden,
    createdAt: memory.createdAt,
  });
}

export function useMemoryPanel(userId: string | null) {
  const queryClient = useQueryClient();
  const { isVisible, isLoading: isVisibilityLoading } =
    useMemoryConsoleVisibility(userId);

  const memoriesQuery = useQuery({
    queryKey: ['memory-panel', userId],
    queryFn: async () => {
      if (!userId) {return { items: [], hasEnoughSessions: false };}
      const memories = await listActiveMemories(userId);
      const hasEnoughSessions = memories.length >= 0; // actually checked by visibility
      const items = memories.map((m) => toPanelItem(m, false));
      return { items, hasEnoughSessions };
    },
    enabled: Boolean(userId) && isVisible,
    staleTime: 60_000,
  });

  const hideMutation = useMutation({
    mutationFn: async (memoryId: string) => {
      if (!userId) {throw new Error('No user');}
      await deleteMemory(memoryId, userId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['memory-panel', userId],
      });
      queryClient.invalidateQueries({
        queryKey: ['focus-memory', userId],
      });
    },
  });

  const acceptMutation = useMutation({
    mutationFn: async (memoryId: string) => {
      if (!userId) {throw new Error('No user');}
      await acceptMemory(memoryId, userId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['memory-panel', userId],
      });
      queryClient.invalidateQueries({
        queryKey: ['focus-memory', userId],
      });
    },
  });

  return {
    data: memoriesQuery.data ?? { items: [], hasEnoughSessions: false },
    isPending: isVisibilityLoading || memoriesQuery.isPending,
    isError: memoriesQuery.isError,
    error: memoriesQuery.error,
    refetch: memoriesQuery.refetch,
    isVisible,
    minSessions: WHAT_VEX_LEARNED_MIN_SESSIONS,
    hideMemory: hideMutation.mutate,
    acceptMemory: acceptMutation.mutate,
    isHiding: hideMutation.isPending,
    isAccepting: acceptMutation.isPending,
  };
}
