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
import * as Sentry from '@sentry/react-native';
import type { CoachConversationTurn } from '../schemas';
import { isDevUser } from '../../../utils/supabase-resilience';

interface CoachQuestionInput {
  question: string;
  conversation: CoachConversationTurn[];
}

const debug = createDebugger('coach:hooks');

export function useCoachScreenState(): {
  coachState: CoachState | undefined;
  coachHistory: { messages: CoachMessage[] } | undefined;
  stateLoading: boolean;
  historyLoading: boolean;
} {
  const { user } = useAuthStore();
  const userId = user?.id ?? '';
  const localDevMode = isDevUser();

  const { data: coachState, isLoading: stateLoading } = useQuery<CoachState>({
    queryKey: ['coach', 'state', userId],
    queryFn: () => getCoachState(userId),
    enabled: Boolean(userId) && !localDevMode,
    staleTime: 60000,
  });

  const { data: coachHistory, isLoading: historyLoading } = useQuery<{
    messages: CoachMessage[];
  }>({
    queryKey: ['coach', 'history', userId],
    queryFn: () => getCoachHistory(userId),
    enabled: Boolean(userId) && !localDevMode,
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
    mutationFn: ({ question, conversation }: CoachQuestionInput) =>
      askCoachQuestion(question, user?.id, conversation),
    onMutate: callbacks.onMutate,
    onSuccess: (response) => {
      callbacks.onSuccess(response);
      queryClient.invalidateQueries({ queryKey: ['coach', 'history'] });
    },
    onError: (err) => {
      callbacks.onError('AI Coach could not reach the live model. Check your connection and try again.');
      Sentry.captureException(err, {
        tags: { feature: 'ai-coach', operation: 'ask-coach-question' },
      });
      debug.error(
        'Coach response error',
        err instanceof Error ? err : new Error(String(err)),
      );
    },
  });
}
