import { z } from 'zod';
import { getSupabaseClient, handleSupabaseError } from '../../../config/supabase';
import { tableColumns } from '../../../lib/repository/tableColumns';
import {
  AnalyticsPreferencesSchema,
  AggregatedStatsSchema,
  DetectedPatternSchema,
  type AnalyticsDimension,
  type AnalyticsMetric,
  type TimeRange,
} from '../schemas';

const supabase = getSupabaseClient();

export async function fetchAnalyticsPreferences(userId: string) {
  const { data, error } = await supabase
    .from('analytics_preferences')
    .select('user_id,default_time_range,default_dashboard_id,email_reports_enabled,email_report_frequency,insight_notifications_enabled,auto_refresh_enabled,auto_refresh_interval,currency_display,timezone,updated_at')
    .eq('user_id', userId)
    .single();
  if (error && error.code !== 'PGRST116') {
    throw handleSupabaseError(error);
  }
  return data ? AnalyticsPreferencesSchema.parse(data) : null;
}

export async function updateAnalyticsPreferences(
  userId: string,
  preferences: Partial<z.infer<typeof AnalyticsPreferencesSchema>>,
) {
  const { data, error } = await supabase
    .from('analytics_preferences')
    .upsert({ user_id: userId, ...preferences, updated_at: Date.now() })
    .select(tableColumns('analytics_preferences'))
    .single();
  if (error) {
    throw handleSupabaseError(error);
  }
  return AnalyticsPreferencesSchema.parse(data);
}

export async function fetchAggregatedStats(userId: string, period: TimeRange) {
  const { data, error } = await supabase
    .from('aggregated_stats')
    .select('user_id,period,generated_at,metrics,insights,patterns,top_performing')
    .eq('user_id', userId)
    .eq('period', period)
    .single();
  if (error && error.code !== 'PGRST116') {
    throw handleSupabaseError(error);
  }
  return data ? AggregatedStatsSchema.parse(data) : null;
}

export async function storeAggregatedStats(
  stats: z.infer<typeof AggregatedStatsSchema>,
) {
  const { data, error } = await supabase
    .from('aggregated_stats')
    .upsert(stats)
    .select(tableColumns('aggregated_stats'))
    .single();
  if (error) {
    throw handleSupabaseError(error);
  }
  return AggregatedStatsSchema.parse(data);
}

export async function fetchDetectedPatterns(
  userId: string,
  options?: { since?: number; types?: string[]; minConfidence?: number },
) {
  let query = supabase
    .from('detected_patterns')
    .select('id,user_id,type,metric,description,confidence,detected_at,start_date,end_date,related_events,recommendations')
    .eq('user_id', userId)
    .order('detected_at', { ascending: false });
  if (options?.since) {
    query = query.gte('detected_at', options.since);
  }
  if (options?.types?.length) {
    query = query.in('type', options.types);
  }
  if (options?.minConfidence !== undefined) {
    query = query.gte('confidence', options.minConfidence);
  }
  const { data, error } = await query;
  if (error) {
    throw handleSupabaseError(error);
  }
  return z.array(DetectedPatternSchema).parse(data ?? []);
}

export async function storeDetectedPattern(
  pattern: z.infer<typeof DetectedPatternSchema>,
) {
  const { data, error } = await supabase
    .from('detected_patterns')
    .insert(pattern)
    .select(tableColumns('detected_patterns'))
    .single();
  if (error) {
    throw handleSupabaseError(error);
  }
  return DetectedPatternSchema.parse(data);
}

export async function deleteOldAnalyticsData(
  userId: string,
  olderThan: number,
) {
  const { error } = await supabase
    .from('analytics_events')
    .delete()
    .eq('user_id', userId)
    .lt('timestamp', olderThan);
  if (error) {
    throw handleSupabaseError(error);
  }
}

export async function bulkInsertAnalyticsEvents(
  events: Array<{
    user_id: string;
    metric_type: AnalyticsMetric;
    timestamp: number;
    value: number;
    dimension_type?: AnalyticsDimension;
    dimension_value?: string;
    metadata?: Record<string, unknown>;
  }>,
) {
  const { error } = await supabase.from('analytics_events').insert(events);
  if (error) {
    throw handleSupabaseError(error);
  }
}
