import { useQuery } from '@tanstack/react-query';
import { getFeatureAvailability, type FeatureAccessMap } from '../liveops-config';
import { useOnboardingStore } from '../onboarding/store';
import type { CompanionState } from '../companion/types';
import { fetchCoachPresenceMemorySummary } from './repository';
import { buildCoachPresence } from './service';
import {
  type CoachPresence,
  type CoachPresenceMemorySummary,
  type CoachPresenceMotivationStyle,
} from './schemas';

const EMPTY_MEMORY: CoachPresenceMemorySummary = {
  coachMemoryCount: 0,
  companionMemoryCount: 0,
  latestMemory: null,
};

export interface UseCoachPresenceInput {
  companion: CompanionState | null;
  currentStreakDays: number;
  features: FeatureAccessMap;
  highFocusStreak: number;
  isOnline: boolean;
  totalSessions: number;
  userId: string | undefined;
}

export function useCoachPresence(input: UseCoachPresenceInput): {
  data: CoachPresence | undefined;
  error: Error | null;
  isError: boolean;
  isPending: boolean;
  refetch: () => void;
} {
  const motivationProfile = useOnboardingStore((state) => state.motivationProfile);
  const motivationStyle = mapMotivationStyle(motivationProfile?.primary);
  const enabled = Boolean(input.userId && input.isOnline);
  const memoryQuery = useQuery({
    enabled,
    queryFn: () => fetchCoachPresenceMemorySummary(input.userId ?? ''),
    queryKey: ['coach-presence', 'memory-summary', input.userId],
    staleTime: 300000,
  });
  const fallbackMemory = enabled ? undefined : EMPTY_MEMORY;
  const memorySummary = memoryQuery.data ?? fallbackMemory;
  const data = memorySummary
    ? buildCoachPresence({
        companion: input.companion,
        featureAvailability: {
          focus: getFeatureAvailability(input.features.focus_session),
          progress: getFeatureAvailability(input.features.progress_view),
          study: getFeatureAvailability(input.features.content_study),
        },
        memorySummary,
        motivationStyle,
        progress: {
          currentStreakDays: input.currentStreakDays,
          highFocusStreak: input.highFocusStreak,
          totalSessions: input.totalSessions,
        },
        surface: 'HOME',
      })
    : undefined;

  return {
    data,
    error: memoryQuery.error,
    isError: memoryQuery.isError,
    isPending: memoryQuery.isPending && enabled,
    refetch: () => {
      void memoryQuery.refetch();
    },
  };
}

function mapMotivationStyle(input: string | undefined): CoachPresenceMotivationStyle {
  if (input === 'calm') {
    return 'CALM';
  }
  if (input === 'student') {
    return 'STUDY_FOCUSED';
  }
  if (input === 'game_like' || input === 'competitive') {
    return 'GAME_LIKE';
  }
  if (input === 'coach_led') {
    return 'COACH_LED';
  }
  if (input === 'intense') {
    return 'INTENSE';
  }
  return 'CALM';
}
