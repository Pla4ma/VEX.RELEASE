/**
 * Intervention Repository
 *
 * Persistence layer for AI Coach interventions.
 * Tracks detection history, dismissals, and effectiveness.
 *
 * @phase 1
 */

import { supabase } from '../../../config/supabase';
import { createDebugger } from '../../../utils/debug';
import type { InterventionType, InterventionSeverity } from '../types';

const debug = createDebugger('ai-coach:intervention-repo');

// ============================================================================
// Types
// ============================================================================

export interface InterventionLog {
  id: string;
  userId: string;
  sessionId: string;
  type: InterventionType;
  severity: InterventionSeverity;
  detectedAt: number;
  acknowledgedAt: number | null;
  dismissedAt: number | null;
  actionTaken: string | null;
  wasEffective: boolean | null;
  metadata: Record<string, unknown>;
}

export interface InterventionStats {
  totalDetected: number;
  acknowledged: number;
  dismissed: number;
  effectiveness: {
    type: InterventionType;
    total: number;
    effective: number;
    rate: number;
  }[];
}

// ============================================================================
// Repository
// ============================================================================

export class InterventionRepository {
  private userId: string | null = null;

  setUserId(userId: string): void {
    this.userId = userId;
  }

  /**
   * Log a new intervention detection
   */
  async logIntervention(data: {
    sessionId: string;
    type: InterventionType;
    severity: InterventionSeverity;
    metadata: Record<string, unknown>;
  }): Promise<InterventionLog> {
    if (!this.userId) {
      throw new Error('User ID not set');
    }

    try {
      const { data: result, error } = await supabase
        .from('intervention_logs')
        .insert({
          user_id: this.userId,
          session_id: data.sessionId,
          type: data.type,
          severity: data.severity,
          detected_at: new Date().toISOString(),
          metadata: data.metadata,
        })
        .select()
        .single();

      if (error) throw error;

      debug.info('Intervention logged', { id: result.id, type: data.type });

      return this.mapRowToLog(result);
    } catch (err) {
      const error = err as Error;
      debug.error('Failed to log intervention:', error.message);
      throw error;
    }
  }

  /**
   * Mark intervention as dismissed by user
   */
  async dismissIntervention(sessionId: string, type: string): Promise<void> {
    if (!this.userId) return;

    try {
      const { error } = await supabase
        .from('intervention_logs')
        .update({
          dismissed_at: new Date().toISOString(),
        })
        .eq('user_id', this.userId)
        .eq('session_id', sessionId)
        .eq('type', type)
        .is('dismissed_at', null);

      if (error) throw error;

      debug.info('Intervention dismissed', { sessionId, type });
    } catch (err) {
      const error = err as Error;
      debug.error('Failed to dismiss intervention:', error.message);
      throw error;
    }
  }

  /**
   * Mark intervention as acknowledged and action taken
   */
  async acknowledgeIntervention(
    sessionId: string,
    type: string,
    actionTaken?: string
  ): Promise<void> {
    if (!this.userId) return;

    try {
      const update: Record<string, unknown> = {
        acknowledged_at: new Date().toISOString(),
      };
      if (actionTaken) {
        update.action_taken = actionTaken;
      }

      const { error } = await supabase
        .from('intervention_logs')
        .update(update)
        .eq('user_id', this.userId)
        .eq('session_id', sessionId)
        .eq('type', type)
        .is('acknowledged_at', null);

      if (error) throw error;

      debug.info('Intervention acknowledged', { sessionId, type, actionTaken });
    } catch (err) {
      const error = err as Error;
      debug.error('Failed to acknowledge intervention:', error.message);
      throw error;
    }
  }

  /**
   * Record effectiveness feedback
   */
  async recordEffectiveness(
    logId: string,
    wasEffective: boolean
  ): Promise<void> {
    try {
      const { error } = await supabase
        .from('intervention_logs')
        .update({ was_effective: wasEffective })
        .eq('id', logId);

      if (error) throw error;

      debug.info('Effectiveness recorded', { logId, wasEffective });
    } catch (err) {
      const error = err as Error;
      debug.error('Failed to record effectiveness:', error.message);
      throw error;
    }
  }

  /**
   * Get intervention history for a session
   */
  async getSessionInterventions(sessionId: string): Promise<InterventionLog[]> {
    if (!this.userId) return [];

    try {
      const { data, error } = await supabase
        .from('intervention_logs')
        .select('*')
        .eq('user_id', this.userId)
        .eq('session_id', sessionId)
        .order('detected_at', { ascending: false });

      if (error) throw error;

      return (data || []).map((row) => this.mapRowToLog(row));
    } catch (err) {
      const error = err as Error;
      debug.error('Failed to get session interventions:', error.message);
      return [];
    }
  }

  /**
   * Get intervention statistics for effectiveness analysis
   */
  async getInterventionStats(timeRange: '7d' | '30d' | '90d'): Promise<InterventionStats> {
    if (!this.userId) {
      return {
        totalDetected: 0,
        acknowledged: 0,
        dismissed: 0,
        effectiveness: [],
      };
    }

    try {
      const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90;
      const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();

      const { data, error } = await supabase
        .from('intervention_logs')
        .select('*')
        .eq('user_id', this.userId)
        .gte('detected_at', since);

      if (error) throw error;

      const logs = (data || []).map((row) => this.mapRowToLog(row));

      // Calculate stats
      const byType = new Map<string, { total: number; effective: number }>();

      logs.forEach((log) => {
        const current = byType.get(log.type) || { total: 0, effective: 0 };
        current.total++;
        if (log.wasEffective) current.effective++;
        byType.set(log.type, current);
      });

      const effectiveness = Array.from(byType.entries()).map(
        ([type, stats]) => ({
          type: type as InterventionType,
          total: stats.total,
          effective: stats.effective,
          rate: stats.total > 0 ? stats.effective / stats.total : 0,
        })
      );

      return {
        totalDetected: logs.length,
        acknowledged: logs.filter((l) => l.acknowledgedAt).length,
        dismissed: logs.filter((l) => l.dismissedAt).length,
        effectiveness,
      };
    } catch (err) {
      const error = err as Error;
      debug.error('Failed to get intervention stats:', error.message);
      return {
        totalDetected: 0,
        acknowledged: 0,
        dismissed: 0,
        effectiveness: [],
      };
    }
  }

  /**
   * Check if intervention was recently dismissed (to avoid spam)
   */
  async wasRecentlyDismissed(
    sessionId: string,
    type: string,
    withinMinutes: number = 5
  ): Promise<boolean> {
    if (!this.userId) return false;

    try {
      const cutoff = new Date(
        Date.now() - withinMinutes * 60 * 1000
      ).toISOString();

      const { data, error } = await supabase
        .from('intervention_logs')
        .select('id')
        .eq('user_id', this.userId)
        .eq('session_id', sessionId)
        .eq('type', type)
        .gte('dismissed_at', cutoff)
        .limit(1);

      if (error) throw error;

      return (data?.length || 0) > 0;
    } catch (err) {
      debug.error('Failed to check dismissed status:', err);
      return false;
    }
  }

  // ============================================================================
  // Mapping
  // ============================================================================

  private mapRowToLog(row: Record<string, unknown>): InterventionLog {
    return {
      id: row.id as string,
      userId: row.user_id as string,
      sessionId: row.session_id as string,
      type: row.type as InterventionType,
      severity: row.severity as InterventionSeverity,
      detectedAt: new Date(row.detected_at as string).getTime(),
      acknowledgedAt: row.acknowledged_at
        ? new Date(row.acknowledged_at as string).getTime()
        : null,
      dismissedAt: row.dismissed_at
        ? new Date(row.dismissed_at as string).getTime()
        : null,
      actionTaken: (row.action_taken as string) || null,
      wasEffective: row.was_effective as boolean | null,
      metadata: (row.metadata as Record<string, unknown>) || {},
    };
  }
}

// ============================================================================
// Singleton Instance
// ============================================================================

let repository: InterventionRepository | null = null;

export function getInterventionRepository(): InterventionRepository {
  if (!repository) {
    repository = new InterventionRepository();
  }
  return repository;
}

export function resetInterventionRepository(): void {
  repository = null;
}
