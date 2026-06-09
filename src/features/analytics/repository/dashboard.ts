import { z } from 'zod';
import { getSupabaseClient, handleSupabaseError } from '../../../config/supabase';
import { DashboardLayoutSchema, DashboardWidgetSchema } from '../schemas';
import { tableColumns } from '../../../lib/repository/tableColumns';

const supabase = getSupabaseClient();

const DASHBOARD_LAYOUT_COLUMNS = tableColumns('dashboard_layouts');
const DASHBOARD_WIDGET_COLUMNS = tableColumns('dashboard_widgets');

export async function fetchDashboardLayouts(userId: string) {
  const { data, error } = await supabase
    .from('dashboard_layouts')
    .select(`${DASHBOARD_LAYOUT_COLUMNS}, widgets:dashboard_widgets(${DASHBOARD_WIDGET_COLUMNS})`)
    .eq('user_id', userId)
    .order('is_default', { ascending: false });
  if (error) {
    throw handleSupabaseError(error);
  }
  return z.array(DashboardLayoutSchema).parse(data ?? []);
}

export async function fetchDefaultDashboard(userId: string) {
  const { data, error } = await supabase
    .from('dashboard_layouts')
    .select(`${DASHBOARD_LAYOUT_COLUMNS}, widgets:dashboard_widgets(${DASHBOARD_WIDGET_COLUMNS})`)
    .eq('user_id', userId)
    .eq('is_default', true)
    .single();
  if (error) {
    throw handleSupabaseError(error);
  }
  return data ? DashboardLayoutSchema.parse(data) : null;
}

export async function createDashboardLayout(
  layout: z.infer<typeof DashboardLayoutSchema>,
) {
  const { widgets, ...layoutData } = layout;
  const { data, error } = await supabase
    .from('dashboard_layouts')
    .insert(layoutData)
    .select(DASHBOARD_LAYOUT_COLUMNS)
    .single();
  if (error) {
    throw handleSupabaseError(error);
  }
  if (widgets?.length) {
    const { error: widgetError } = await supabase
      .from('dashboard_widgets')
      .insert(widgets.map((widget) => ({ ...widget, dashboard_id: data.id })));
    if (widgetError) {
      throw handleSupabaseError(widgetError);
    }
  }
  return DashboardLayoutSchema.parse({ ...data, widgets: widgets ?? [] });
}

export async function updateDashboardWidget(
  widgetId: string,
  updates: Partial<z.infer<typeof DashboardWidgetSchema>>,
) {
  const { data, error } = await supabase
    .from('dashboard_widgets')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', widgetId)
    .select(DASHBOARD_WIDGET_COLUMNS)
    .single();
  if (error) {
    throw handleSupabaseError(error);
  }
  return DashboardWidgetSchema.parse(data);
}

export async function deleteDashboardWidget(widgetId: string) {
  const { error } = await supabase
    .from('dashboard_widgets')
    .delete()
    .eq('id', widgetId);
  if (error) {
    throw handleSupabaseError(error);
  }
}
