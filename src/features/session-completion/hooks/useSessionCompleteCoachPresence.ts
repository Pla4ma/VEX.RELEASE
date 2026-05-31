import { useMemo } from 'react';

import {
  buildCompletionCoachPresence,
} from '../../coach-presence';
import type { CoachPresenceMemorySummary } from '../../coach-presence/schemas';
import {
  getFeatureAvailability,
  type FeatureAccessMap,
} from '../../liveops-config';
import type { SessionSummary } from '../../../session/types';
import { mapCompletionMotivationStyle } from './mapCompletionMotivationStyle';

interface CoachPresenceInput {
  features: FeatureAccessMap;
  coachMemoryData: CoachPresenceMemorySummary | undefined;
  motivationProfile: string | undefined;
  focusedDuration: number;
  focusPurityScore: number;
  summary: SessionSummary;
}

export function useSessionCompleteCoachPresence(
  input: CoachPresenceInput,
) {
  const {
    features,
    coachMemoryData,
    motivationProfile,
    focusedDuration,
    focusPurityScore,
    summary,
  } = input;

  return useMemo(
    () =>
      buildCompletionCoachPresence({
        featureAvailability: {
          focus: getFeatureAvailability(features.focus_session),
          progress: getFeatureAvailability(features.progress_view),
          study: getFeatureAvailability(features.content_study),
        },
        memorySummary: coachMemoryData ?? {
          coachMemoryCount: 0,
          companionMemoryCount: 0,
          latestMemory: null,
          syncAvailable: false,
        },
        motivationStyle: mapCompletionMotivationStyle(motivationProfile),
        summary: {
          durationMinutes: Math.round(focusedDuration / 60),
          focusPurityScore,
          isComeback: summary.streakDays === 1 && !summary.streakIncreased,
          isFirstSession: summary.streakDays <= 1 && summary.userLevel <= 1,
          isHighFocusStreak: focusPurityScore >= 90,
          isLowEnergyDay:
            summary.mood === 'STRUGGLING' || summary.mood === 'DIFFICULT',
          isStreakRecovery:
            !summary.streakMaintained && summary.streakIncreased,
          sessionMode: summary.sessionMode,
          streakDays: summary.streakDays ?? 0,
        },
      }),
    [
      coachMemoryData,
      features,
      focusPurityScore,
      focusedDuration,
      motivationProfile,
      summary,
    ],
  );
}
