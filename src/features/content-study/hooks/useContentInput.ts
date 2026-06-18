/**
 * useContentInput Hook
 * Manages content input state and submission
 */

import { useState, useCallback } from 'react';
import { useAuthStore } from '../../../store';
import type { ContentInputState, InputTab } from '../types';
import { VALIDATION_RULES } from '../constants';
import {
  createInitialContentInputState,
} from './contentInputHelpers';
import { useContentInputSubmit } from './useContentInputSubmit';

export function useContentInput() {
  const { user } = useAuthStore();
  const [state, setState] = useState<ContentInputState>(
    createInitialContentInputState,
  );
  const [uploadProgress, setUploadProgress] = useState(0);

  const { submit, validateInput } = useContentInputSubmit({ state, setState });

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
    (file: { uri: string; name: string; size: number; type: string } | null) => {
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