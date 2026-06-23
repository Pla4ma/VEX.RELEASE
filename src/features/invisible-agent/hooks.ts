import { useQuery } from '@tanstack/react-query';
import { generateInvisibleAgentDecision } from './service';
import type { AgentContextSnapshot } from './schemas';

export function useInvisibleAgentDecision(
  context: AgentContextSnapshot,
  enabled: boolean,
) {
  return useQuery({
    queryKey: ['invisible-agent-decision', context.userId, context.currentStreak, context.completedToday],
    queryFn: () => generateInvisibleAgentDecision(context),
    enabled,
    staleTime: 5 * 60000,
  });
}
