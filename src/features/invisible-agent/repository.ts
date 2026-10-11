import { getSupabaseClient } from '../../config/supabase';
import { isDevUser } from '../../utils/supabase-resilience';
import type { AgentContextSnapshot } from './schemas';

type AgentDecisionResponse = {
  structuredData?: unknown;
};

export async function invokeCoachAgentDecision(
  context: AgentContextSnapshot,
): Promise<unknown | null> {
  const supabase = getSupabaseClient();
  const session = await supabase.auth.getSession();
  if (__DEV__ && !process.env.JEST_WORKER_ID && !session.data.session && isDevUser()) {
    return null;
  }

  const { data, error } = await supabase.functions.invoke<
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
