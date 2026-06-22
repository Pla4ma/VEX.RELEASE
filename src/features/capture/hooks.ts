import { useState, useCallback } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as Sentry from '@sentry/react-native';
import { submitCapture, loadCaptures } from './service';
import type { CaptureType, CaptureFormState } from './types';

export function useCaptureForm() {
  const [state, setState] = useState<CaptureFormState>({
    type: 'braindump',
    content: '',
    isSubmitting: false,
    error: null,
  });

  const setType = useCallback((type: CaptureType) => {
    setState((s) => ({ ...s, type, error: null }));
  }, []);

  const setContent = useCallback((content: string) => {
    setState((s) => ({ ...s, content, error: null }));
  }, []);

  const clearError = useCallback(() => {
    setState((s) => ({ ...s, error: null }));
  }, []);

  return { state, setType, setContent, clearError };
}

export function useCaptureMutation(userId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      type,
      content,
      metadata,
    }: {
      type: CaptureType;
      content: string;
      metadata?: Record<string, string>;
    }) => {
      const result = await submitCapture(userId, type, content, metadata);
      if (result.error) throw result.error;
      return result.item;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['captures', userId] });
    },
    onError: (error) => {
      Sentry.captureException(error, { tags: { feature: 'capture', operation: 'submitCapture' } });
    },
  });
}

export function useCapturesQuery(userId: string, limit?: number) {
  return useQuery({
    queryKey: ['captures', userId, limit],
    queryFn: async () => {
      const result = await loadCaptures(userId, limit);
      if (result.error) throw result.error;
      return result.items;
    },
    enabled: !!userId,
  });
}

export function useCaptureSheet() {
  const { state, setType, setContent } = useCaptureForm();

  return {
    open: () => {
      setType('braindump');
      setContent('');
    },
    state,
    setType,
    setContent,
  };
}
