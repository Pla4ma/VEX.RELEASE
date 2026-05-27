/**
 * Coach Data Cleanup Job
 *
 * Data retention and cleanup for old coach data
 */

import { job } from '@trigger.dev/sdk';
import {
  cleanupCoachMessages,
  cleanupInterventionExecutions,
  cleanupBehaviorSignals,
  cleanupBehaviorProfiles,
  cleanupReminderPlans,
  cleanupComebackPlans,
  cleanupSessionRecommendations,
  cleanupCoachEffectiveness,
  consolidateBehaviorSignals,
} from './cleanup-query';

export const coachDataCleanupJob = job({
  id: 'coach-data-cleanup',
  name: 'Coach Data Cleanup',
  version: '1.0.0',
  cron: '0 3 * * *',

  run: async (payload, io) => {
    const results: Record<string, number> = {};

    results.coach_messages = await io.runTask('cleanup-messages', () => cleanupCoachMessages());
    results.intervention_executions = await io.runTask('cleanup-executions', () => cleanupInterventionExecutions());
    results.behavior_signals = await io.runTask('cleanup-signals', () => cleanupBehaviorSignals());
    results.behavior_profiles = await io.runTask('cleanup-profiles', () => cleanupBehaviorProfiles());
    results.reminder_plans = await io.runTask('cleanup-reminders', () => cleanupReminderPlans());
    results.comeback_plans = await io.runTask('cleanup-comebacks', () => cleanupComebackPlans());
    results.session_recommendations = await io.runTask('cleanup-recommendations', () => cleanupSessionRecommendations());
    results.coach_effectiveness = await io.runTask('cleanup-effectiveness', () => cleanupCoachEffectiveness());

    const totalDeleted = Object.values(results).reduce((sum, count) => sum + count, 0);

    return {
      totalDeleted,
      details: results,
      completedAt: new Date().toISOString(),
    };
  },
});

export const coachDataConsolidationJob = job({
  id: 'coach-data-consolidation',
  name: 'Coach Data Consolidation',
  version: '1.0.0',
  cron: '0 4 * * 0',

  run: async (payload, io) => {
    const consolidatedCount = await io.runTask('consolidate-signals', () => consolidateBehaviorSignals());

    return {
      consolidatedCount,
      completedAt: new Date().toISOString(),
    };
  },
});
