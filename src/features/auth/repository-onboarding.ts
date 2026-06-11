import { getSupabaseClient } from '../../config/supabase';
import { RepositoryError, classifyError } from '../../lib/repository/error-handling';

export async function fetchOnboardingStatus(userId: string): Promise<string | null> {
  const { data, error } = await getSupabaseClient()
    .from('users')
    .select('onboarding_completed_at')
    .eq('id', userId)
    .maybeSingle<{ onboarding_completed_at: string | null }>();

  if (error) {
    throw new RepositoryError('fetchOnboardingStatus', error, classifyError(error));
  }

  return data?.onboarding_completed_at ?? null;
}
