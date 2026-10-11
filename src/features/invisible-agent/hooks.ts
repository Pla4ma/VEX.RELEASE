import { useQuery } from '@tanstack/react-query';
import { generateInvisibleAgentDecision } from './service';
import type { AgentContextSnapshot } from './schemas';

export function buildInvisibleAgentDecisionQueryKey(
  context: AgentContextSnapshot,
) {
  return [
    'invisible-agent-decision',
    {
      userId: context.userId,
      isOnline: context.isOnline,
      completedToday: context.completedToday,
      currentStreak: context.currentStreak,
      hoursUntilStreakDeadline: context.hoursUntilStreakDeadline,
      recentSessionIds: context.recentSessionIds,
      activeStudyPackId: context.activeStudyPackId,
      lowEnergyPattern: context.lowEnergyPattern,
      trustLevel: context.trustLevel,
    },
  ];
}

export function useInvisibleAgentDecision(
  context: AgentContextSnapshot,
  enabled: boolean,
) {
  return useQuery({
    queryKey: buildInvisibleAgentDecisionQueryKey(context),
    queryFn: () => generateInvisibleAgentDecision(context),
    enabled,
    staleTime: 5 * 60000,
  });
}
