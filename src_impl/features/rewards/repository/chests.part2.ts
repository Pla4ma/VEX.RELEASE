import { getSupabaseClient } from "../../../config/supabase";
import { enqueue } from "../../../lib/offline/queue";
import { withRetry, RepositoryError } from "../../../lib/repository/base";
import { captureSilentFailure } from "../../../utils/silent-failure";
import { z } from "zod";


export async function markMultiplierUsed(multiplierId: string): Promise<{ success: boolean; error: RepositoryError | null }> {
  try {
    const { error } = await withRetry('markMultiplierUsed', async () => {
      return await supabase.from('mystery_multipliers').update({ used: true }).eq('id', multiplierId);
    });

    if (error) {
      throw error;
    }
    return { success: true, error: null };
  } catch (error) {
    captureSilentFailure(error, { feature: 'rewards', operation: 'markUsed', type: 'data' });
    return { success: false, error: new RepositoryError('markMultiplierUsed', error) };
  }
}

export async function fetchActiveMultiplier(userId: string): Promise<{ data: MysteryMultiplier | null; error: RepositoryError | null }> {
  try {
    const { data, error } = await withRetry('fetchActiveMultiplier', async () => {
      return await supabase.from('mystery_multipliers').select('*').eq('user_id', userId).eq('triggered', true).eq('used', false).gt('expires_at', Date.now()).single();
    });

    if (error) {
      if (error.code === 'PGRST116') {
        return { data: null, error: null };
      }
      throw error;
    }

    return { data: MysteryMultiplierSchema.parse(data), error: null };
  } catch (error) {
    captureSilentFailure(error, { feature: 'rewards', operation: 'fetchMultiplier', type: 'data' });
    return { data: null, error: new RepositoryError('fetchActiveMultiplier', error) };
  }
}

export async function fetchChestAnalytics(userId: string): Promise<{
  data: {
    totalOpened: number;
    byType: Record<string, number>;
    totalValue: { coins: number; gems: number };
  } | null;
  error: RepositoryError | null;
}> {
  try {
    const { data, error } = await withRetry('fetchChestAnalytics', async () => {
      return await supabase.rpc('get_chest_analytics', { p_user_id: userId });
    });

    if (error) {
      throw error;
    }
    return { data, error: null };
  } catch (error) {
    captureSilentFailure(error, { feature: 'rewards', operation: 'analytics', type: 'data' });
    return { data: null, error: new RepositoryError('fetchChestAnalytics', error) };
  }
}