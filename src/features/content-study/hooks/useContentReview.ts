/**
 * useContentReview Hook
 * Manages content review and editing state
 */

import { useState, useCallback, useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '../../../store';
import {
  fetchContentById,
  updateContentText,
  generateStudyPlan,
} from '../ContentStudyService';
import type { ContentReviewState } from '../types';
import { ERROR_MESSAGES } from '../constants';
import { contentStudyQueryKeys } from './queryKeys';
import { useContentExtractionPolling } from './content-review-polling';

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
  const [state, setState] = useState<ContentReviewState>(
    createInitialContentReviewState,
  );

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
        editedText:
          contentQuery.data?.userEditedText ||
          contentQuery.data?.extractedText ||
          '',
        originalText: contentQuery.data?.extractedText || '',
        wordCount: (
          contentQuery.data?.userEditedText ||
          contentQuery.data?.extractedText ||
          ''
        )
          .trim()
          .split(/\s+/)
          .filter(Boolean).length,
      }));
    }
  }, [contentQuery.data]);

  const handleExtractingChange = useCallback((isExtracting: boolean) => {
    setState((prev) => ({ ...prev, isExtracting }));
  }, []);

  const handlePollError = useCallback((message: string) => {
    setState((prev) => ({ ...prev, error: message, isExtracting: false }));
  }, []);

  useContentExtractionPolling(
    contentId,
    state.content,
    handleExtractingChange,
    handlePollError,
  );

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
        content: prev.content
          ? { ...prev.content, userEditedText: text }
          : null,
      }));
      queryClient.invalidateQueries({
        queryKey: contentStudyQueryKeys.content(contentId),
      });
    },
  });

  const saveEdits = useCallback(async () => {
    await saveMutation.mutateAsync(state.editedText);
  }, [saveMutation, state.editedText]);

  const generateMutation = useMutation({
    mutationFn: async () => {
      if (!user?.id) {
        throw new Error('User not authenticated');
      }
      const result = await generateStudyPlan({ contentId, userId: user.id });
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: contentStudyQueryKeys.all,
      });
    },
  });

  const generate = useCallback(async () => {
    setState((prev) => ({ ...prev, isGenerating: true, error: null }));

    try {
      const result = await generateMutation.mutateAsync();
      return result;
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : ERROR_MESSAGES.DEFAULT;
      setState((prev) => ({ ...prev, error: message }));
      throw err;
    } finally {
      setState((prev) => ({ ...prev, isGenerating: false }));
    }
  }, [generateMutation]);

  const canGenerate =
    state.content?.status === 'EXTRACTED' || state.content?.status === 'READY';
  const isProcessing = ['PENDING', 'EXTRACTING', 'PROCESSING'].includes(
    state.content?.status || '',
  );

  return {
    content: state.content,
    editedText: state.editedText,
    isEditing: state.isEditing,
    isGenerating: state.isGenerating,
    isLoading: contentQuery.isPending,
    error: state.error || contentQuery.error?.message || null,
    canGenerate,
    isProcessing,
    isExtracted:
      state.content?.status === 'EXTRACTED' ||
      state.content?.status === 'READY',
    isFailed: state.content?.status === 'FAILED',
    startEditing,
    cancelEditing,
    setEditedText,
    saveEdits,
    generate,
    refetch: contentQuery.refetch,
  };
}
