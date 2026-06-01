/**
 * Content Input Validation
 * Pure validation logic extracted from useContentInput.
 */

import type { ContentInputState } from '../types';
import { VALIDATION_RULES } from '../constants';

type ValidatableState = Pick<
  ContentInputState,
  'activeTab' | 'pastedText' | 'youtubeUrl' | 'selectedFile'
>;

export function computeValidationErrors(
  state: ValidatableState,
): ContentInputState['validationErrors'] {
  const errors: ContentInputState['validationErrors'] = [];

  if (
    state.activeTab === 'paste' &&
    state.pastedText.trim().length < VALIDATION_RULES.MIN_CONTENT_LENGTH
  ) {
    errors.push({
      field: 'pastedText',
      code: 'MIN_LENGTH',
      message: `Please enter at least ${VALIDATION_RULES.MIN_CONTENT_LENGTH} characters.`,
      severity: 'error',
    });
  }

  if (state.activeTab === 'youtube' && !state.youtubeUrl.trim()) {
    errors.push({
      field: 'youtubeUrl',
      code: 'REQUIRED',
      message: 'Please enter a YouTube URL.',
      severity: 'error',
    });
  }

  if (state.activeTab === 'pdf' && !state.selectedFile) {
    errors.push({
      field: 'file',
      code: 'REQUIRED',
      message: 'Please select a file to upload.',
      severity: 'error',
    });
  }

  return errors;
}
