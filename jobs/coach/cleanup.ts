/**
 * Coach Data Cleanup Job
 *
 * Data retention and cleanup for old coach data
 */

import { job } from '@trigger.dev/sdk';
import { getSupabaseClient } from '../../src/config/supabase';

// ============================================================================
// Retention Policies
// ============================================================================

const RETENTION_DAYS = {
  // Coach messages: 90 days
  coach_messages: 90,

  // Intervention executions: 180 days
  intervention_executions: 180,

  // Behavior signals: 90 days
  behavior_signals: 90,

  // Old behavior profiles: 365 days
  behavior_profiles: 365,

  // Delivered reminders: 30 days
  reminder_plans: 30,

  // Completed comeback plans: 180 days
  comeback_plans: 180,

  // Old recommendations: 30 days
  session_recommendations: 30,

  // Coach effectiveness: 365 days
  coach_effectiveness: 365,
};

// ============================================================================
// Cleanup Job
// ============================================================================

export const coachDataCleanupJob = job({
  id: 'coach-data-cleanup',
  name: 'Coach Data Cleanup',
  version: '1.0.0',
  // Run daily at 3 AM
  cron: '0 3 * * *',

  run: async (payload, io) => {
    const supabase = getSupabaseClient();
    const results: Record<string, number> = {};

    // Cleanup old coach messages
    results.coach_messages = await io.runTask('cleanup-messages', async () => {
      const cutoff = Date.now() - RETENTION_DAYS.coach_messages * 24 * 60 * 60 * 1000;

      const { data, error } = await supabase
        .from('coach_messages')
        .delete()
        .lt('created_at', cutoff)
        .select('count');

      if (error) throw error;
      return data?.length || 0;
    });

    // Cleanup old intervention executions
    results.intervention_executions = await io.runTask('cleanup-executions', async () => {
      const cutoff = Date.now() - RETENTION_DAYS.intervention_executions * 24 * 60 * 60 * 1000;

      const { data, error } = await supabase
        .from('intervention_executions')
        .delete()
        .lt('triggered_at', cutoff)
        .select('count');

      if (error) throw error;
      return data?.length || 0;
    });

    // Cleanup old behavior signals
    results.behavior_signals = await io.runTask('cleanup-signals', async () => {
      const cutoff = Date.now() - RETENTION_DAYS.behavior_signals * 24 * 60 * 60 * 1000;

      const { data, error } = await supabase
        .from('behavior_signals')
        .delete()
        .lt('timestamp', cutoff)
        .select('count');

      if (error) throw error;
      return data?.length || 0;
    });

    // Cleanup old behavior profiles (archive cold start profiles older than 1 year)
    results.behavior_profiles = await io.runTask('cleanup-profiles', async () => {
      const cutoff = Date.now() - RETENTION_DAYS.behavior_profiles * 24 * 60 * 60 * 1000;

      const { data, error } = await supabase
        .from('behavior_profiles')
        .delete()
        .lt('last_updated', cutoff)
        .eq('cold_start', true)
        .select('count');

      if (error) throw error;
      return data?.length || 0;
    });

    // Cleanup delivered/failed reminders
    results.reminder_plans = await io.runTask('cleanup-reminders', async () => {
      const cutoff = Date.now() - RETENTION_DAYS.reminder_plans * 24 * 60 * 60 * 1000;

      const { data, error } = await supabase
        .from('reminder_plans')
        .delete()
        .in('status', ['DELIVERED', 'FAILED', 'CANCELLED'])
        .lt('delivered_at', cutoff)
        .select('count');

      if (error) throw error;
      return data?.length || 0;
    });

    // Cleanup completed/expired comeback plans
    results.comeback_plans = await io.runTask('cleanup-comebacks', async () => {
      const cutoff = Date.now() - RETENTION_DAYS.comeback_plans * 24 * 60 * 60 * 1000;

      const { data, error } = await supabase
        .from('comeback_plans')
        .delete()
        .in('status', ['COMPLETED', 'EXPIRED', 'DECLINED'])
        .lt('completed_at', cutoff)
        .select('count');

      if (error) throw error;
      return data?.length || 0;
    });

    // Cleanup old recommendations
    results.session_recommendations = await io.runTask('cleanup-recommendations', async () => {
      const cutoff = Date.now() - RETENTION_DAYS.session_recommendations * 24 * 60 * 60 * 1000;

      const { data, error } = await supabase
        .from('session_recommendations')
        .delete()
        .in('status', ['ACCEPTED', 'DISMISSED', 'EXPIRED'])
        .lt('expires_at', cutoff)
        .select('count');

      if (error) throw error;
      return data?.length || 0;
    });

    // Cleanup old effectiveness data
    results.coach_effectiveness = await io.runTask('cleanup-effectiveness', async () => {
      const cutoff = Date.now() - RETENTION_DAYS.coach_effectiveness * 24 * 60 * 60 * 1000;

      const { data, error } = await supabase
        .from('coach_effectiveness')
        .delete()
        .lt('recorded_at', cutoff)
        .select('count');

      if (error) throw error;
      return data?.length || 0;
    });

    // Archive summary
    const totalDeleted = Object.values(results).reduce((sum, count) => sum + count, 0);

    return {
      totalDeleted,
      details: results,
      completedAt: new Date().toISOString(),
    };
  },
});

// ============================================================================
// Data Consolidation Job (Weekly)
// ============================================================================

export const coachDataConsolidationJob = job({
  id: 'coach-data-consolidation',
  name: 'Coach Data Consolidation',
  version: '1.0.0',
  // Run weekly on Sundays at 4 AM
  cron: '0 4 * * 0',

  run: async (payload, io) => {
    const supabase = getSupabaseClient();

    // Consolidate daily behavior signals into weekly averages
    const consolidatedCount = await io.runTask('consolidate-signals', async () => {
      // Get signals older than 30 days
      const cutoff = Date.now() - 30 * 24 * 60 * 60 * 1000;

      const { data: oldSignals, error } = await supabase
        .from('behavior_signals')
        .select('user_id, signal_type, value, confidence, timestamp')
        .lt('timestamp', cutoff)
        .order('timestamp', { ascending: false });

      if (error || !oldSignals?.data) return 0;

      // Group by user and signal type
      const grouped = new Map<string, typeof oldSignals.data>();
      for (const signal of oldSignals.data) {
        const key = `${signal.user_id}-${signal.signal_type}`;
        if (!grouped.has(key)) {
          grouped.set(key, []);
        }
        grouped.get(key)?.push(signal);
      }

      // Calculate weekly averages and update
      let consolidated = 0;
      for (const [key, signals] of grouped) {
        if (signals.length < 7) continue;

        const avgValue = signals.reduce((sum, s) => sum + s.value, 0) / signals.length;
        const avgConfidence = signals.reduce((sum, s) => sum + s.confidence, 0) / signals.length;

        // Update profile with consolidated value
        const [userId, signalType] = key.split('-');

        await supabase
          .from('behavior_profiles')
          .upsert({
            user_id: userId,
            signals: [{
              signal_type: signalType,
              value: avgValue,
              confidence: avgConfidence,
              timestamp: signals[0].timestamp,
            }],
            last_updated: Date.now(),
          }, { onConflict: 'user_id' });

        // Delete old individual signals
        await supabase
          .from('behavior_signals')
          .delete()
          .in('id', signals.map(s => s.id));

        consolidated += signals.length;
      }

      return consolidated;
    });

    return {
      consolidatedCount,
      completedAt: new Date().toISOString(),
    };
  },
});
