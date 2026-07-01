import { getSupabaseClient } from '../../config/supabase';
import type { AgentContextSnapshot } from './schemas';

type AgentDecisionResponse = {
  structuredData?: unknown;
};

export async function invokeCoachAgentDecision(
  context: AgentContextSnapshot,
): Promise<unknown> {
  const { data, error } = await getSupabaseClient().functions.invoke<
    AgentDecisionResponse
  >('ai-coach', {
    body: {
      requestType: 'GENERATE_AGENT_DECISION',
      userId: context.userId,
      context,
    },
  });

  if (error) {
    throw new Error(error.message);
  }

  return data?.structuredData ?? data;
}
