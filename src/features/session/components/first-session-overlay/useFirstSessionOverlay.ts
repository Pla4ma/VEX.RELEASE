/**
 * useFirstSessionOverlay Hook
 */

import { useState, useCallback } from 'react';
import { MMKVStorageAdapter } from '../../../../persistence/MMKVStorageAdapter';
import { HAS_SEEN_FIRST_SESSION_OVERLAY_KEY } from './constants';

import type { UseFirstSessionOverlayResult } from './types';

const firstSessionOverlayStorage = new MMKVStorageAdapter(
  'first-session-overlay',
);

export function useFirstSessionOverlay(): UseFirstSessionOverlayResult {
  const [showOverlay, setShowOverlay] = useState(
    firstSessionOverlayStorage.getItemSync(
      HAS_SEEN_FIRST_SESSION_OVERLAY_KEY,
    ) !== 'true',
  );
  const [currentStep, setCurrentStep] = useState(0);

  const advance = useCallback(() => {
    setCurrentStep((prev) => prev + 1);
  }, []);

  const dismiss = useCallback(() => {
    setShowOverlay(false);
  }, []);

  const markCompleted = useCallback(() => {
    setShowOverlay(false);
    firstSessionOverlayStorage.setItemSync(
      HAS_SEEN_FIRST_SESSION_OVERLAY_KEY,
      'true',
    );
  }, []);

  return {
    showOverlay,
    currentStep,
    advance,
    dismiss,
    markCompleted,
  };
}
