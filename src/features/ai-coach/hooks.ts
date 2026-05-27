/**
 * AI Coach Hooks - Barrel Export
 *
 * Re-exports all hooks from the hooks/ directory.
 * This file exists for backward compatibility.
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createDebugger } from '../../utils/debug';
import {
  askCoachQuestion,
  getCoachHistory,
  getCoachState,
  type CoachQuestionResponse,
} from './services/coach-screen-service';
import type { CoachMessage, CoachState } from './types';
import { fetchActiveRecommendations } from './repository';
import type { SessionRecommendation } from './hooks/useRecommendationMutations';

export { COACH_QUERY_KEYS } from './constants';

export * from './hooks';
export {
  useCoachState,
  type UseCoachStateResult,
} from './hooks/useCoachState';
export {
  useCreateRecommendation,
  useUpdateRecommendationStatus,
  type SessionRecommendation,
} from './hooks/useRecommendationMutations';

const debug = createDebugger('coach:hooks');

export function useActiveCoachRecommendations(
  userId: string | null,
  enabled: boolean,
): {
  primaryRecommendation: SessionRecommendation | null;
  isPending: boolean;
} {
  const { data } = useQuery<SessionRecommendation[]>({
    queryKey: ['coach', 'recommendations', userId],
    queryFn: () => fetchActiveRecommendations(userId ?? ''),
    enabled: enabled && Boolean(userId),
    staleTime: 1000 * 60 * 5,
  });
  const primary = data
    ? data.filter((item) => item.status === 'ACTIVE' && item.expiresAt > Date.now())
        .sort((a, b) => (b.confidence ?? 0) - (a.confidence ?? 0))[0] ?? null
    : null;
  return { primaryRecommendation: primary, isPending: false };
}

export function useCoachScreenState(): {
  coachState: CoachState | undefined;
  coachHistory: { messages: CoachMessage[] } | undefined;
  stateLoading: boolean;
  historyLoading: boolean;
} {
  const { data: coachState, isLoading: stateLoading } = useQuery<CoachState>({
    queryKey: ['coach', 'state'],
    queryFn: getCoachState,
    staleTime: 60000,
  });

  const { data: coachHistory, isLoading: historyLoading } = useQuery<{
    messages: CoachMessage[];
  }>({
    queryKey: ['coach', 'history'],
    queryFn: getCoachHistory,
    staleTime: 300000,
  });

  return {
    coachState,
    coachHistory,
    stateLoading,
    historyLoading,
  };
}

export function useAskCoachQuestionMutation(callbacks: {
  onMutate: () => void;
  onSuccess: (response: CoachQuestionResponse) => void;
  onError: (message: string) => void;
}) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: askCoachQuestion,
    onMutate: callbacks.onMutate,
    onSuccess: (response) => {
      callbacks.onSuccess(response);
      queryClient.invalidateQueries({ queryKey: ['coach', 'history'] });
    },
    onError: (err) => {
      callbacks.onError('Sorry, I had trouble responding. Please try again.');
      debug.error('Coach response error', err instanceof Error ? err : new Error(String(err)));
    },
  });
}

// Stub for ActiveIntervention type and useActiveIntervention hook
export interface ActiveIntervention {
  id: string;
  type: 'STREAK_RISK' | 'BURNOUT' | 'PLATEAU' | 'BOSS_FINISH';
  message: string;
  actionLabel: string;
  priority: number;
  hoursRemaining?: number;
  metadata: Record<string, unknown>;
}

export function useActiveIntervention(_userId?: string): {
  intervention: ActiveIntervention | null;
  data: ActiveIntervention | null;
  isLoading: boolean;
  dismiss: (interventionId: string) => void;
} {
  const intervention = null;
  return {
    intervention,
    data: intervention,
    isLoading: false,
    dismiss: (_interventionId: string): void => {},
  };
}
