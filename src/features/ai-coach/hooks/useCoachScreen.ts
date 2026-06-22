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
} from '../service/coach-screen-service';
import type { CoachMessage, CoachState } from '../types';
import { useAuthStore } from '../../../store';

const debug = createDebugger('coach:hooks');

export function useCoachScreenState(): {
  coachState: CoachState | undefined;
  coachHistory: { messages: CoachMessage[] } | undefined;
  stateLoading: boolean;
  historyLoading: boolean;
} {
  const { user } = useAuthStore();
  const userId = user?.id ?? 'anonymous';

  const { data: coachState, isLoading: stateLoading } = useQuery<CoachState>({
    queryKey: ['coach', 'state', userId],
    queryFn: () => getCoachState(userId),
    staleTime: 60000,
  });

  const { data: coachHistory, isLoading: historyLoading } = useQuery<{
    messages: CoachMessage[];
  }>({
    queryKey: ['coach', 'history', userId],
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
  const { user } = useAuthStore();

  return useMutation({
    mutationFn: (question: string) => askCoachQuestion(question, user?.id),
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
