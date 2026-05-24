/**
 * useContentReview Hook
 * Manages content review and editing state
 */

import { useState, useCallback, useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '../../../store';
import { captureException } from '../../../config/sentry';
import {
  buildContentStudyTimeoutFallback,
  fetchContentById,
  updateContentText,
  generateStudyPlan,
  pollContentStatus,
} from '../ContentStudyService';
import { ContentReviewState } from '../types';
import { ERROR_MESSAGES } from '../constants';
import { contentStudyQueryKeys } from './queryKeys';

function createInitialContentReviewState(): ContentReviewState {
  return {
    content: null,
    editedText: '',
    isEditing: false,
    isGenerating: false,
    error: null,
    originalText: '',
    editHistory: [],
    canUndo: false,
    canRedo: false,
    wordCount: 0,
    isExtracting: false,
    extractionProgress: 0,
    extractionStage: 'uploading',
    retryCount: 0,
    autosaveEnabled: true,
  };
}

export function useContentReview(contentId: string) {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const [state, setState] = useState<ContentReviewState>(createInitialContentReviewState);

  const contentQuery = useQuery({
    queryKey: contentStudyQueryKeys.content(contentId),
    queryFn: () => fetchContentById(contentId),
    enabled: !!contentId,
    staleTime: 30 * 1000,
  });

  useEffect(() => {
    if (contentQuery.data) {
      setState((prev) => ({
        ...prev,
        content: contentQuery.data || null,
        editedText: contentQuery.data?.userEditedText || contentQuery.data?.extractedText || '',
        originalText: contentQuery.data?.extractedText || '',
        wordCount: (contentQuery.data?.userEditedText || contentQuery.data?.extractedText || '')
          .trim()
          .split(/\s+/)
          .filter(Boolean).length,
      }));
    }
  }, [contentQuery.data]);

  useEffect(() => {
    if (!contentId || !state.content) {return;}

    const needsPolling = ['PENDING', 'EXTRACTING', 'PROCESSING'].includes(
      state.content.status
    );

    if (!needsPolling) {return;}

    const pollInterval = setInterval(async () => {
      try {
        const status = await pollContentStatus(contentId);
        if (status.status === 'EXTRACTED' || status.status === 'READY' || status.status === 'FAILED') {
          clearInterval(pollInterval);
          void queryClient.invalidateQueries({ queryKey: contentStudyQueryKeys.content(contentId) });
        }
        setState((prev) => ({
          ...prev,
          isExtracting: ['PENDING', 'EXTRACTING', 'PROCESSING'].includes(status.status),
        }));
      } catch (error) {
        captureException(error instanceof Error ? error : new Error('Poll failed'), {
          area: 'content-study.review.poll',
          contentId,
        });
        const fallback = buildContentStudyTimeoutFallback();
        setState((prev) => ({
          ...prev,
          error: fallback.body,
          isExtracting: false,
        }));
      }
    }, 2000);

    return () => clearInterval(pollInterval);
  }, [contentId, state.content, queryClient]);

  const startEditing = useCallback(() => {
    setState((prev) => ({ ...prev, isEditing: true }));
  }, []);

  const cancelEditing = useCallback(() => {
    setState((prev) => ({
      ...prev,
      isEditing: false,
      editedText: prev.originalText,
    }));
  }, []);

  const setEditedText = useCallback((text: string) => {
    setState((prev) => ({
      ...prev,
      editedText: text,
      wordCount: text.trim().split(/\s+/).filter(Boolean).length,
    }));
  }, []);

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
        content: prev.content ? { ...prev.content, userEditedText: text } : null,
      }));
      void queryClient.invalidateQueries({ queryKey: contentStudyQueryKeys.content(contentId) });
    },
  });

  const saveEdits = useCallback(async () => {
    await saveMutation.mutateAsync(state.editedText);
  }, [saveMutation, state.editedText]);

  const generateMutation = useMutation({
    mutationFn: async () => {
      if (!user?.id) {throw new Error('User not authenticated');}
      const result = await generateStudyPlan({ contentId, userId: user.id });
      return result;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: contentStudyQueryKeys.all });
    },
  });

  const generate = useCallback(async () => {
    setState((prev) => ({ ...prev, isGenerating: true, error: null }));

    try {
      const result = await generateMutation.mutateAsync();
      return result;
    } catch (err) {
      const message = err instanceof Error ? err.message : ERROR_MESSAGES.DEFAULT;
      setState((prev) => ({ ...prev, error: message }));
      throw err;
    } finally {
      setState((prev) => ({ ...prev, isGenerating: false }));
    }
  }, [generateMutation]);

  const canGenerate = state.content?.status === 'EXTRACTED' || state.content?.status === 'READY';
  const isProcessing = ['PENDING', 'EXTRACTING', 'PROCESSING'].includes(
    state.content?.status || ''
  );

  return {
    content: state.content,
    editedText: state.editedText,
    isEditing: state.isEditing,
    isGenerating: state.isGenerating,
    isLoading: contentQuery.isLoading,
    error: state.error || contentQuery.error?.message || null,
    canGenerate,
    isProcessing,
    isExtracted: state.content?.status === 'EXTRACTED' || state.content?.status === 'READY',
    isFailed: state.content?.status === 'FAILED',
    startEditing,
    cancelEditing,
    setEditedText,
    saveEdits,
    generate,
    refetch: contentQuery.refetch,
  };
}
