/**
 * useContentInput Hook
 * Manages content input state and submission
 */

import { useState, useCallback } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '../../../store';
import { captureException } from '../../../config/sentry';
import {
  submitContent,
  extractContent,
  uploadStudyFile,
} from '../ContentStudyService';
import { ContentInputState, InputTab, SubmitContentRequest } from '../types';
import { VALIDATION_RULES } from '../constants';
import { contentStudyQueryKeys } from './queryKeys';
import {
  createInitialContentInputState,
  getUserFacingSubmitError,
} from './contentInputHelpers';
import { computeValidationErrors } from './contentInputValidation';

export function useContentInput() {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const [state, setState] = useState<ContentInputState>(
    createInitialContentInputState,
  );
  const [uploadProgress, setUploadProgress] = useState(0);

  const setTab = useCallback((tab: InputTab) => {
    setState((prev) => ({
      ...prev,
      activeTab: tab,
      error: null,
      isDirty: true,
    }));
  }, []);

  const setPastedText = useCallback((text: string) => {
    const validationErrors =
      text.trim().length >= VALIDATION_RULES.MIN_CONTENT_LENGTH
        ? []
        : [
            {
              field: 'pastedText',
              code: 'MIN_LENGTH',
              message: `Please enter at least ${VALIDATION_RULES.MIN_CONTENT_LENGTH} characters of content.`,
              severity: 'error' as const,
            },
          ];
    setState((prev) => ({
      ...prev,
      pastedText: text,
      error: null,
      isDirty: true,
      characterCount: text.length,
      validationErrors,
      isValid: validationErrors.length === 0,
    }));
  }, []);

  const setYoutubeUrl = useCallback((url: string) => {
    setState((prev) => ({
      ...prev,
      youtubeUrl: url,
      error: null,
      isDirty: true,
    }));
  }, []);

  const setSelectedFile = useCallback(
    (
      file: { uri: string; name: string; size: number; type: string } | null,
    ) => {
      setState((prev) => ({
        ...prev,
        selectedFile: file,
        error: null,
        isDirty: true,
      }));
    },
    [],
  );

  const clearError = useCallback(() => {
    setState((prev) => ({ ...prev, error: null }));
  }, []);

  const validateInput = useCallback((): boolean => {
    const errors = computeValidationErrors(state);
    setState((prev) => ({
      ...prev,
      validationErrors: errors,
      isValid: errors.length === 0,
    }));
    return errors.length === 0;
  }, [state]);

  const submitMutation = useMutation({
    mutationFn: async () => {
      if (!user) {
        throw new Error('User not authenticated');
      }
      if (!validateInput()) {
        throw new Error('Validation failed');
      }

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
        void extractContent({ contentId: response.contentId }).catch(
          (error: unknown) => {
            captureException(
              error instanceof Error
                ? error
                : new Error('Failed to trigger content extraction'),
              {
                area: 'content-study.submit.extract',
                contentId: response.contentId,
              },
            );
          },
        );
      }

      return { contentId: response.contentId, status: response.status };
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: contentStudyQueryKeys.all,
      });
    },
  });

  const submit = useCallback(async () => {
    setState((prev) => ({ ...prev, isSubmitting: true, error: null }));

    try {
      const result = await submitMutation.mutateAsync();
      return result;
    } catch (err) {
      const message = getUserFacingSubmitError(err);
      captureException(
        err instanceof Error
          ? err
          : new Error('Content study submission failed'),
        { area: 'content-study.submit' },
      );
      setState((prev) => ({ ...prev, error: message }));
      throw err;
    } finally {
      setState((prev) => ({ ...prev, isSubmitting: false }));
    }
  }, [submitMutation]);

  const reset = useCallback(() => {
    setState(createInitialContentInputState());
    setUploadProgress(0);
  }, []);

  return {
    state,
    uploadProgress,
    isSubmitting: state.isSubmitting,
    error: state.error,
    setTab,
    setPastedText,
    setYoutubeUrl,
    setSelectedFile,
    clearError,
    submit,
    reset,
    validateInput,
  };
}
