import { z } from 'zod';
import { getSupabaseClient, handleSupabaseError } from '../../../config/supabase';
import { InsightSchema } from '../schemas';

const supabase = getSupabaseClient();

export async function fetchInsights(
  userId: string,
  options?: {
    unreadOnly?: boolean;
    types?: string[];
    severities?: string[];
    limit?: number;
  },
) {
  let query = supabase
    .from('insights')
    .select('id,user_id,type,severity,title,description,metric,detected_at,expires_at,is_read,is_actioned,action_type,action_payload,related_metrics')
    .eq('user_id', userId)
    .order('detected_at', { ascending: false });
  if (options?.unreadOnly) {
    query = query.eq('is_read', false);
  }
  if (options?.types?.length) {
    query = query.in('type', options.types);
  }
  if (options?.severities?.length) {
    query = query.in('severity', options.severities);
  }
  if (options?.limit) {
    query = query.limit(options.limit);
  }
  const { data, error } = await query;
  if (error) {
    throw handleSupabaseError(error);
  }
  return z.array(InsightSchema).parse(data ?? []);
}

export async function createInsight(insight: z.infer<typeof InsightSchema>) {
  const { data, error } = await supabase
    .from('insights')
    .insert(insight)
    .select()
    .single();
  if (error) {
    throw handleSupabaseError(error);
  }
  return InsightSchema.parse(data);
}

export async function markInsightAsRead(userId: string, insightId: string) {
  const { data, error } = await supabase
    .from('insights')
    .update({ is_read: true })
    .eq('id', insightId)
    .eq('user_id', userId)
    .select()
    .single();
  if (error) {
    throw handleSupabaseError(error);
  }
  return InsightSchema.parse(data);
}

export async function markInsightAsActioned(
  userId: string,
  insightId: string,
  actionType: string,
  actionPayload?: Record<string, unknown>,
) {
  const { data, error } = await supabase
    .from('insights')
    .update({
      is_actioned: true,
      action_type: actionType,
      action_payload: actionPayload,
    })
    .eq('id', insightId)
    .eq('user_id', userId)
    .select()
    .single();
  if (error) {
    throw handleSupabaseError(error);
  }
  return InsightSchema.parse(data);
}
