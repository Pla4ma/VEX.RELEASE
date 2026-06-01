import { useQuery } from '@tanstack/react-query';
import { decideNudge } from './service';
import { getDismissalCountForLane, getSignals } from './repository';
import type { Lane } from '../lane-engine/types';
import type { NudgePolicyInput } from './schemas';

const DISMISSAL_PAUSE_THRESHOLD = 3;

type PausedCategory = 'study' | 'run' | 'project' | 'clean';

const LANE_TO_CATEGORY: Record<Lane, PausedCategory> = {
  student: 'study',
  game_like: 'run',
  deep_creative: 'project',
  minimal_normal: 'clean',
};

const FALLBACK_INPUT: NudgePolicyInput = {
  completedSessions: 0,
  context: 'none',
  daysSinceOnboarding: 0,
  lane: 'minimal_normal',
  manuallyScheduled: false,
  now: 0,
  pausedCategories: [],
  quietHoursActive: false,
  recentDismissals: 0,
  sentToday: 0,
  userMuted: false,
};

export function derivePausedCategories(
  userId: string,
  lanes: Lane[],
): PausedCategory[] {
  return lanes
    .filter((lane) => {
      const count = getDismissalCountForLane(userId, lane);
      return count >= DISMISSAL_PAUSE_THRESHOLD;
    })
    .map((lane) => LANE_TO_CATEGORY[lane]);
}

export function deriveRecentDismissals(userId: string, lane: Lane): number {
  return getDismissalCountForLane(userId, lane);
}

export function getSentToday(userId: string): number {
  const signals = getSignals(userId);
  const today = new Date().toISOString().split('T')[0];
  return signals.filter((s) => {
    if (s.signal !== 'sent') {return false;}
    const signalDate = new Date(s.occurredAt).toISOString().split('T')[0];
    return signalDate === today;
  }).length;
}

export function resolveNudgeInput(
  userId: string,
  overrides: Partial<NudgePolicyInput> & { lane: Lane },
): NudgePolicyInput {
  const { lane } = overrides;
  return {
    ...FALLBACK_INPUT,
    ...overrides,
    lane,
    pausedCategories: derivePausedCategories(userId, [lane]),
    recentDismissals: deriveRecentDismissals(userId, lane),
    sentToday: getSentToday(userId),
  };
}

export function useNudgeDecision(input: NudgePolicyInput | null) {
  const query = useQuery({
    queryKey: ['nudge-decision', input],
    queryFn: () => decideNudge(input ?? FALLBACK_INPUT),
    enabled: input !== null && !input.userMuted,
  });

  return {
    data: query.data ?? null,
    isPending: query.isPending,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
}
