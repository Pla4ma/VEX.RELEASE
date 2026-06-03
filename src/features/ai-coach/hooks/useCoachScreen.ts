/**
 * Coach Screen Hooks
 *
 * useCoachScreenState, useAskCoachQuestionMutation
 * Moved from root hooks.ts to resolve hooks.ts vs hooks/ coexistence.
 */

import {
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { createDebugger } from '../../../utils/debug';
import {
  askCoachQuestion,
  getCoachHistory,
  getCoachState,
  type CoachQuestionResponse,
} from '../services/coach-screen-service';
import type { CoachMessage, CoachState } from '../types';

const debug = createDebugger('coach:hooks');

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
      debug.error(
        'Coach response error',
        err instanceof Error ? err : new Error(String(err)),
      );
    },
  });
}
