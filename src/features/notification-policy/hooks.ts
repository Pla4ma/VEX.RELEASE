import { useQuery } from '@tanstack/react-query';
import { decideNudge } from './service';
import type { NudgePolicyInput } from './schemas';

const FALLBACK_INPUT: NudgePolicyInput = {
  completedSessions: 0,
  context: 'none',
  daysSinceOnboarding: 0,
  lane: 'minimal_normal',
  manuallyScheduled: false,
  now: 0,
  quietHoursActive: false,
  recentDismissals: 0,
  sentToday: 0,
  userMuted: false,
};

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
