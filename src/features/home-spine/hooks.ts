import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';

import { buildHomeSpineModel } from './service';
import { selectHomePriority } from './priority-service';
import type { HomePriority } from './priority-schemas';
export { useSavedTomorrowPreview } from './hooks/useSavedTomorrowPreview';

export { useStreakDefense, type StreakDefenseState } from './hooks/useStreakDefense';

// PHASE 7.4: Tomorrow Preview Service
export {
  computeTomorrowPreview,
  saveTomorrowPreview,
  loadTomorrowPreview,
  clearTomorrowPreview,
  useTomorrowPreviewForSession,
  TomorrowPreviewTypeSchema,
  TomorrowPreviewDataSchema,
  type TomorrowPreviewType,
  type TomorrowPreviewData,
  type ComputeTomorrowPreviewInput,
} from './tomorrowPreviewService';

type HomeSpineInput = Parameters<typeof buildHomeSpineModel>[0];
type HomeSpineModel = ReturnType<typeof buildHomeSpineModel>;

export function useHomeSpineModel(input: HomeSpineInput): HomeSpineModel {
  const {
    currentStreak,
    homeHighlight,
    isAtRisk,
    isFirstRun,
    level,
    progressPercent,
    progressXp,
    returnReason,
    todayFocusMinutes,
  } = input;
  const {
    body,
    ctaLabel,
    eyebrow,
    intent,
    recommendationId,
    source,
    suggestedDifficulty,
    suggestedDurationSeconds,
    title,
    tone,
  } = returnReason;

  return useMemo(
    () =>
      buildHomeSpineModel({
        currentStreak,
        homeHighlight,
        isAtRisk,
        isFirstRun,
        level,
        progressPercent,
        progressXp,
        returnReason: {
          body,
          ctaLabel,
          eyebrow,
          intent,
          recommendationId,
          source,
          suggestedDifficulty,
          suggestedDurationSeconds,
          title,
          tone,
        },
        todayFocusMinutes,
      }),
    [
      currentStreak,
      homeHighlight,
      isAtRisk,
      isFirstRun,
      level,
      progressPercent,
      progressXp,
      todayFocusMinutes,
      body,
      ctaLabel,
      eyebrow,
      intent,
      recommendationId,
      source,
      suggestedDifficulty,
      suggestedDurationSeconds,
      title,
      tone,
    ],
  );
}

// ============================================================================
// Phase 4: Home Priority Hook
// ============================================================================

const HOME_PRIORITY_KEY = 'home-priority';

/**
 * Hook to fetch and cache the current home priority
 *
 * Answers "why start now?" in 3 seconds by selecting the most
 * urgent action from the priority model.
 */
export function useHomePriority(userId: string | null | undefined) {
  return useQuery<HomePriority>({
    queryKey: [HOME_PRIORITY_KEY, userId],
    queryFn: () => selectHomePriority(userId!),
    enabled: !!userId,
    staleTime: 1000 * 30, // 30 seconds - priority can change quickly
    refetchOnWindowFocus: true,
  });
}
