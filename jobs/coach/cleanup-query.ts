import { getSupabaseClient } from '../../src/config/supabase';

export const RETENTION_DAYS = {
  coach_messages: 90,
  intervention_executions: 180,
  behavior_signals: 90,
  behavior_profiles: 365,
  reminder_plans: 30,
  comeback_plans: 180,
  session_recommendations: 30,
  coach_effectiveness: 365,
};

export async function cleanupCoachMessages(): Promise<number> {
  const supabase = getSupabaseClient();
  const cutoff = Date.now() - RETENTION_DAYS.coach_messages * 24 * 60 * 60 * 1000;
  const { data, error } = await supabase
    .from('coach_messages')
    .delete()
    .lt('created_at', cutoff)
    .select('count');
  if (error) throw error;
  return data?.length || 0;
}

export async function cleanupInterventionExecutions(): Promise<number> {
  const supabase = getSupabaseClient();
  const cutoff = Date.now() - RETENTION_DAYS.intervention_executions * 24 * 60 * 60 * 1000;
  const { data, error } = await supabase
    .from('intervention_executions')
    .delete()
    .lt('triggered_at', cutoff)
    .select('count');
  if (error) throw error;
  return data?.length || 0;
}

export async function cleanupBehaviorSignals(): Promise<number> {
  const supabase = getSupabaseClient();
  const cutoff = Date.now() - RETENTION_DAYS.behavior_signals * 24 * 60 * 60 * 1000;
  const { data, error } = await supabase
    .from('behavior_signals')
    .delete()
    .lt('timestamp', cutoff)
    .select('count');
  if (error) throw error;
  return data?.length || 0;
}

export async function cleanupBehaviorProfiles(): Promise<number> {
  const supabase = getSupabaseClient();
  const cutoff = Date.now() - RETENTION_DAYS.behavior_profiles * 24 * 60 * 60 * 1000;
  const { data, error } = await supabase
    .from('behavior_profiles')
    .delete()
    .lt('last_updated', cutoff)
    .eq('cold_start', true)
    .select('count');
  if (error) throw error;
  return data?.length || 0;
}

export async function cleanupReminderPlans(): Promise<number> {
  const supabase = getSupabaseClient();
  const cutoff = Date.now() - RETENTION_DAYS.reminder_plans * 24 * 60 * 60 * 1000;
  const { data, error } = await supabase
    .from('reminder_plans')
    .delete()
    .in('status', ['DELIVERED', 'FAILED', 'CANCELLED'])
    .lt('delivered_at', cutoff)
    .select('count');
  if (error) throw error;
  return data?.length || 0;
}

export async function cleanupComebackPlans(): Promise<number> {
  const supabase = getSupabaseClient();
  const cutoff = Date.now() - RETENTION_DAYS.comeback_plans * 24 * 60 * 60 * 1000;
  const { data, error } = await supabase
    .from('comeback_plans')
    .delete()
    .in('status', ['COMPLETED', 'EXPIRED', 'DECLINED'])
    .lt('completed_at', cutoff)
    .select('count');
  if (error) throw error;
  return data?.length || 0;
}

export async function cleanupSessionRecommendations(): Promise<number> {
  const supabase = getSupabaseClient();
  const cutoff = Date.now() - RETENTION_DAYS.session_recommendations * 24 * 60 * 60 * 1000;
  const { data, error } = await supabase
    .from('session_recommendations')
    .delete()
    .in('status', ['ACCEPTED', 'DISMISSED', 'EXPIRED'])
    .lt('expires_at', cutoff)
    .select('count');
  if (error) throw error;
  return data?.length || 0;
}

export async function cleanupCoachEffectiveness(): Promise<number> {
  const supabase = getSupabaseClient();
  const cutoff = Date.now() - RETENTION_DAYS.coach_effectiveness * 24 * 60 * 60 * 1000;
  const { data, error } = await supabase
    .from('coach_effectiveness')
    .delete()
    .lt('recorded_at', cutoff)
    .select('count');
  if (error) throw error;
  return data?.length || 0;
}

export async function consolidateBehaviorSignals(): Promise<number> {
  const supabase = getSupabaseClient();
  const cutoff = Date.now() - 30 * 24 * 60 * 60 * 1000;

  const { data: oldSignals, error } = await supabase
    .from('behavior_signals')
    .select('user_id, signal_type, value, confidence, timestamp')
    .lt('timestamp', cutoff)
    .order('timestamp', { ascending: false });

  if (error || !oldSignals || oldSignals.length === 0) return 0;

  const grouped = new Map<string, typeof oldSignals>();
  for (const signal of oldSignals) {
    const key = `${signal.user_id}-${signal.signal_type}`;
    if (!grouped.has(key)) {
      grouped.set(key, []);
    }
    grouped.get(key)?.push(signal);
  }

  let consolidated = 0;
  const groupedEntries = Array.from(grouped.entries());
  const consolidatePromises = groupedEntries.map(async ([key, signals]) => {
    if (signals.length < 7) return 0;

    const avgValue = signals.reduce((sum, s) => sum + s.value, 0) / signals.length;
    const avgConfidence = signals.reduce((sum, s) => sum + s.confidence, 0) / signals.length;

    const [userId, signalType] = key.split('-');

    await supabase
      .from('behavior_profiles')
      .upsert({
        user_id: userId,
        signals: [
          {
            signal_type: signalType,
            value: avgValue,
            confidence: avgConfidence,
            timestamp: signals[0].timestamp,
          },
        ],
        last_updated: Date.now(),
      }, { onConflict: 'user_id' });

    await supabase
      .from('behavior_signals')
      .delete()
      .in('id', signals.map(s => s.id));

    return signals.length;
  });

  const results = await Promise.all(consolidatePromises);
  consolidated = results.reduce((sum, count) => sum + count, 0);

  return consolidated;
}
