import { z } from "zod";
import { getSupabaseClient } from "../../../config/supabase";
import { createDebugger } from "../../../utils/debug";


export async function getDeliveriesNeedingRetry(): Promise<RewardDelivery[]> {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase.from('reward_deliveries').select('*').in('status', ['FAILED', 'RETRYING']).or(`retry_after.lt.${Date.now()},retry_after.is.null`).lt('attempt_count', supabase.rpc('get_max_attempts')).limit(100);

  if (error) {
    debug.error('Failed to fetch deliveries needing retry', error);
    throw new Error(`Failed to fetch deliveries needing retry: ${error.message}`);
  }

  return (data ?? []).map((row) => mapRowToDelivery(RewardDeliveryRowSchema.parse(row)));
}