import type { ContentReviewState } from '../types';

export function createInitialContentReviewState(): ContentReviewState {
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
