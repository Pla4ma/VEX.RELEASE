import { useState, useCallback, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '../../../store';
import { fetchContentById } from '../ContentStudyService';
import { contentStudyQueryKeys } from './queryKeys';
import { useContentExtractionPolling } from './content-review-polling';
import { createInitialContentReviewState } from './contentReviewState';
import { useContentReviewActions } from './contentReviewActions';
import type { ContentReviewState } from '../types';

export function useContentReview(contentId: string) {
  const { user: _user } = useAuthStore();
  const [state, setState] = useState<ContentReviewState>(
    createInitialContentReviewState,
  );

  const { data, isPending, error, refetch } = useQuery({
    queryKey: contentStudyQueryKeys.content(contentId),
    queryFn: () => fetchContentById(contentId),
    enabled: !!contentId,
    staleTime: 30 * 1000,
    });






  useEffect(() => {
    if (data) {
      setState((prev) => ({
        ...prev,
        content: data || null,
        editedText:
          data?.userEditedText ||
          data?.extractedText ||
          '',
        originalText: data?.extractedText || '',
        wordCount: (
          data?.userEditedText ||
          data?.extractedText ||
          ''
        )
          .trim()
          .split(/\s+/)
          .filter(Boolean).length,
      }));
    }
  }, [data]);

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

  const { saveEdits, generate } = useContentReviewActions({
    contentId,
    state,
    setState,
  });

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
    isLoading: isPending,
    error: state.error || error?.message || null,
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
    refetch: refetch,
  };
}
