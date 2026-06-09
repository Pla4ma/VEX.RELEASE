import { useCallback} from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import * as Sentry from '@sentry/react-native';
import { useToast } from '../../../shared/ui/components/Toast';
import { useAuthStore } from '../../../store';
import { updateContentText, generateStudyPlan } from '../ContentStudyService';
import { ERROR_MESSAGES } from '../constants';
import { contentStudyQueryKeys } from './queryKeys';
import type { ContentReviewState } from '../types';

interface UseContentReviewActionsParams {
  contentId: string;
  state: ContentReviewState;
  setState: React.Dispatch<React.SetStateAction<ContentReviewState>>;
}

export function useContentReviewActions({
  contentId,
  state,
  setState,
}: UseContentReviewActionsParams) {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const { show } = useToast();

  const saveMutation = useMutation({
    mutationFn: async (text: string) => {
      await updateContentText(contentId, text);
      return text;
    },
    onSuccess: (text) => {
      setState((prev) => ({
        ...prev,
        isEditing: false,
        originalText: text,
        content: prev.content
          ? { ...prev.content, userEditedText: text }
          : null,
      }));
      queryClient.invalidateQueries({
        queryKey: contentStudyQueryKeys.content(contentId),
      });
    },
    onError: (error) => {
      Sentry.captureException(error, { tags: { feature: 'content-study', operation: 'saveEdits' } });
      show({ type: 'error', title: 'Save failed', message: 'Try again when connection returns.' });
    },
  });

  const generateMutation = useMutation({
    mutationFn: async () => {
      if (!user?.id) {throw new Error('User not authenticated');}
      return generateStudyPlan({ contentId, userId: user.id });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: contentStudyQueryKeys.all });
    },
    onError: (error) => {
      Sentry.captureException(error, { tags: { feature: 'content-study', operation: 'generateStudyPlan' } });
      show({ type: 'error', title: 'Generation failed', message: 'Try again when connection returns.' });
    },
  });

  const saveEdits = useCallback(async () => {
    await saveMutation.mutateAsync(state.editedText);
  }, [saveMutation, state.editedText]);

  const generate = useCallback(async () => {
    setState((prev) => ({ ...prev, isGenerating: true, error: null }));
    try {
      return await generateMutation.mutateAsync();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : ERROR_MESSAGES.DEFAULT;
      setState((prev) => ({ ...prev, error: message }));
      throw err;
    } finally {
      setState((prev) => ({ ...prev, isGenerating: false }));
    }
  }, [generateMutation, setState]);

  return { saveEdits, generate };
}
