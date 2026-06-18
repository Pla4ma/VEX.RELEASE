/**
 * useContentInput submit logic
 */

import { useCallback } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '../../../store';
import * as Sentry from '@sentry/react-native';
import {
  submitContent,
  extractContent,
  uploadStudyFile,
} from '../ContentStudyService';
import type { SubmitContentRequest, ContentInputState } from '../types';
import { contentStudyQueryKeys } from './queryKeys';
import { getUserFacingSubmitError } from './contentInputHelpers';
import { computeValidationErrors } from './contentInputValidation';

interface UseContentInputSubmitOptions {
  state: ContentInputState;
  setState: React.Dispatch<React.SetStateAction<ContentInputState>>;
}

export function useContentInputSubmit({
  state,
  setState,
}: UseContentInputSubmitOptions) {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();

  const validateInput = useCallback((): boolean => {
    const errors = computeValidationErrors(state);
    setState((prev) => ({
      ...prev,
      validationErrors: errors,
      isValid: errors.length === 0,
    }));
    return errors.length === 0;
  }, [state, setState]);

  const submitMutation = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error('User not authenticated');
      if (!validateInput()) throw new Error('Validation failed');

      let request: SubmitContentRequest;

      if (state.activeTab === 'paste') {
        request = { type: 'PASTE', content: state.pastedText };
      } else if (state.activeTab === 'youtube') {
        request = { type: 'YOUTUBE', url: state.youtubeUrl.trim() };
      } else if (state.activeTab === 'pdf' && state.selectedFile) {
        const fileId = await uploadStudyFile(
          state.selectedFile.uri,
          state.selectedFile.name,
          user.id,
        );
        request = { type: 'PDF', fileId };
      } else {
        throw new Error('Invalid input state');
      }

      const response = await submitContent(user.id, request);

      if (request.type === 'PDF' || request.type === 'YOUTUBE') {
        extractContent({ contentId: response.contentId }).catch(
          (error: unknown) => {
            Sentry.captureException(
              error instanceof Error
                ? error
                : new Error('Failed to trigger content extraction'),
              {
                extra: {
                  area: 'content-study.submit.extract',
                  contentId: response.contentId,
                },
              },
            );
          },
        );
      }

      return { contentId: response.contentId, status: response.status };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: contentStudyQueryKeys.all });
    },
    onError: (error) => {
      Sentry.captureException(error, {
        tags: { feature: 'content-study', operation: 'submitContent' },
      });
    },
  });

  const submit = useCallback(async () => {
    setState((prev) => ({ ...prev, isSubmitting: true, error: null }));
    try {
      return await submitMutation.mutateAsync();
    } catch (err: unknown) {
      const message = getUserFacingSubmitError(err);
      Sentry.captureException(
        err instanceof Error ? err : new Error('Content study submission failed'),
        { extra: { area: 'content-study.submit' } },
      );
      setState((prev) => ({ ...prev, error: message }));
      throw err;
    } finally {
      setState((prev) => ({ ...prev, isSubmitting: false }));
    }
  }, [submitMutation, setState]);

  return { submit, validateInput };
}