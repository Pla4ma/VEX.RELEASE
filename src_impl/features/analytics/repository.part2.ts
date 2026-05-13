import { z } from "zod";
import { getSupabaseClient, handleSupabaseError } from "../../config/supabase";
import { AggregatedStatsSchema, AnalyticsPreferencesSchema, DashboardLayoutSchema, DashboardWidgetSchema, DetectedPatternSchema, ExportJobSchema, InsightSchema, TimeSeriesDataSchema, getTimeRangeDates, type AnalyticsDimension, type AnalyticsFilter, type AnalyticsMetric, type TimeRange } from "./schemas";


export async function fetchDefaultDashboard(userId: string) {
  const { data, error } = await supabase
    .from('dashboard_layouts')
    .select(
      `
      *,
      widgets:dashboard_widgets(*)
    `,
    )
    .eq('user_id', userId)
    .eq('is_default', true)
    .single();
  if (error) {
    throw handleSupabaseError(error);
  }
  return data ? DashboardLayoutSchema.parse(data) : null;
}

export async function createDashboardLayout(layout: z.infer<typeof DashboardLayoutSchema>) {
  const { widgets, ...layoutData } = layout;
  const { data, error } = await supabase.from('dashboard_layouts').insert(layoutData).select().single();
  if (error) {
    throw handleSupabaseError(error);
  }
  if (widgets?.length) {
    const { error: widgetError } = await supabase.from('dashboard_widgets').insert(widgets.map((widget) => ({ ...widget, dashboard_id: data.id })));
    if (widgetError) {
      throw handleSupabaseError(widgetError);
    }
  }
  return DashboardLayoutSchema.parse({ ...data, widgets: widgets ?? [] });
}

export async function updateDashboardWidget(widgetId: string, updates: Partial<z.infer<typeof DashboardWidgetSchema>>) {
  const { data, error } = await supabase
    .from('dashboard_widgets')
    .update({ ...updates, updated_at: Date.now() })
    .eq('id', widgetId)
    .select()
    .single();
  if (error) {
    throw handleSupabaseError(error);
  }
  return DashboardWidgetSchema.parse(data);
}

export async function deleteDashboardWidget(widgetId: string) {
  const { error } = await supabase.from('dashboard_widgets').delete().eq('id', widgetId);
  if (error) {
    throw handleSupabaseError(error);
  }
}

export async function fetchExportJobs(userId: string, limit = 10) {
  const { data, error } = await supabase.from('export_jobs').select('*').eq('user_id', userId).order('created_at', { ascending: false }).limit(limit);
  if (error) {
    throw handleSupabaseError(error);
  }
  return z.array(ExportJobSchema).parse(data ?? []);
}

export async function createExportJob(job: z.infer<typeof ExportJobSchema>) {
  const { data, error } = await supabase.from('export_jobs').insert(job).select().single();
  if (error) {
    throw handleSupabaseError(error);
  }
  return ExportJobSchema.parse(data);
}

export async function updateExportJobProgress(jobId: string, progress: number, fileUrl?: string, fileSize?: number) {
  const updates: Record<string, unknown> = { progress };
  if (fileUrl) {
    updates.file_url = fileUrl;
    updates.file_size = fileSize;
    updates.status = 'completed';
    updates.completed_at = Date.now();
  }
  const { data, error } = await supabase.from('export_jobs').update(updates).eq('id', jobId).select().single();
  if (error) {
    throw handleSupabaseError(error);
  }
  return ExportJobSchema.parse(data);
}

export async function markExportJobFailed(jobId: string, errorMessage: string) {
  const { data, error } = await supabase.from('export_jobs').update({ status: 'failed', error_message: errorMessage }).eq('id', jobId).select().single();
  if (error) {
    throw handleSupabaseError(error);
  }
  return ExportJobSchema.parse(data);
}

export async function fetchAnalyticsPreferences(userId: string) {
  const { data, error } = await supabase.from('analytics_preferences').select('*').eq('user_id', userId).single();
  if (error && error.code !== 'PGRST116') {
    throw handleSupabaseError(error);
  }
  return data ? AnalyticsPreferencesSchema.parse(data) : null;
}

export async function updateAnalyticsPreferences(userId: string, preferences: Partial<z.infer<typeof AnalyticsPreferencesSchema>>) {
  const { data, error } = await supabase
    .from('analytics_preferences')
    .upsert({ user_id: userId, ...preferences, updated_at: Date.now() })
    .select()
    .single();
  if (error) {
    throw handleSupabaseError(error);
  }
  return AnalyticsPreferencesSchema.parse(data);
}

export async function fetchAggregatedStats(userId: string, period: TimeRange) {
  const { data, error } = await supabase.from('aggregated_stats').select('*').eq('user_id', userId).eq('period', period).single();
  if (error && error.code !== 'PGRST116') {
    throw handleSupabaseError(error);
  }
  return data ? AggregatedStatsSchema.parse(data) : null;
}

export async function storeAggregatedStats(stats: z.infer<typeof AggregatedStatsSchema>) {
  const { data, error } = await supabase.from('aggregated_stats').upsert(stats).select().single();
  if (error) {
    throw handleSupabaseError(error);
  }
  return AggregatedStatsSchema.parse(data);
}

export async function fetchDetectedPatterns(userId: string, options?: { since?: number; types?: string[]; minConfidence?: number }) {
  let query = supabase.from('detected_patterns').select('*').eq('user_id', userId).order('detected_at', { ascending: false });
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

export async function storeDetectedPattern(pattern: z.infer<typeof DetectedPatternSchema>) {
  const { data, error } = await supabase.from('detected_patterns').insert(pattern).select().single();
  if (error) {
    throw handleSupabaseError(error);
  }
  return DetectedPatternSchema.parse(data);
}

export async function deleteOldAnalyticsData(userId: string, olderThan: number) {
  const { error } = await supabase.from('analytics_events').delete().eq('user_id', userId).lt('timestamp', olderThan);
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