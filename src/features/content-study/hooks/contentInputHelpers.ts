/**
 * Content Input Helper Functions
 * Pure functions for initial state and error handling.
 */

import type { ContentInputState } from '../types';
import { ERROR_MESSAGES } from '../constants';

export function createInitialContentInputState(): ContentInputState {
  return {
    activeTab: 'paste',
    pastedText: '',
    youtubeUrl: '',
    selectedFile: null,
    isSubmitting: false,
    error: null,
    validationErrors: [],
    isDirty: false,
    isValid: false,
    characterCount: 0,
  };
}

export function getUserFacingSubmitError(error: unknown): string {
  if (!(error instanceof Error)) {
    return ERROR_MESSAGES.DEFAULT;
  }
  const lowerMessage = error.message.toLowerCase();
  if (
    lowerMessage.includes('row level security') ||
    lowerMessage.includes('storage upload failed')
  ) {
    return 'Your PDF could not upload because secure study storage is still syncing. Try again in a moment, or paste the text to keep moving.';
  }
  if (lowerMessage.includes('validation failed')) {
    return 'Check the highlighted input and try again.';
  }
  return error.message;
}
