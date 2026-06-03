/**
 * Maintenance Health Check Job
 * 
 * Trigger: Cron schedule (every 5 minutes)
 * Purpose: Monitor system health and report issues
 * 
 * Input: {}
 * Output: { status: 'healthy' | 'degraded' | 'unhealthy', checks: Array }
 */

import { task } from '@trigger.dev/sdk';
import * as Sentry from '@sentry/node';
import { createClient } from '@supabase/supabase-js';
import { MaintenanceJobInputSchema, MaintenanceJobOutputSchema } from '../../shared/jobs/schemas.ts';
import { RETRY_CONFIGS, TIMEOUT_CONFIGS, JOB_IDS, SCHEDULE_CONFIGS } from '../../shared/jobs/job-constants.ts';
import type { MaintenanceJobInput, MaintenanceJobOutput } from '../../shared/jobs/schemas.ts';
import type { HealthCheckResult } from './health-check-types';
import { checkDatabase, checkQueue, checkErrorRate, checkSeasons, checkEconomy } from './health-check-checks';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
});

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

export const maintenanceHealthCheck = task({
  id: JOB_IDS.MAINTENANCE_HEALTH_CHECK,
  trigger: {
    type: 'schedule',
    cron: SCHEDULE_CONFIGS.HEALTH_CHECK,
  },
  run: async (input, io) => {
    const startTime = Date.now();
    const checks: HealthCheckResult[] = [];
    let overallStatus: 'healthy' | 'degraded' | 'unhealthy' = 'healthy';

    io.logger.info('Starting health check');

    const dbCheck = await io.runTask('check-database', () => checkDatabase());
    checks.push(dbCheck);

    const queueCheck = await io.runTask('check-queue', () => checkQueue());
    checks.push(queueCheck);

    const errorCheck = await io.runTask('check-errors', () => checkErrorRate());
    checks.push(errorCheck);

    const seasonCheck = await io.runTask('check-seasons', () => checkSeasons());
    checks.push(seasonCheck);

    const economyCheck = await io.runTask('check-economy', () => checkEconomy());
    checks.push(economyCheck);

    const unhealthyChecks = checks.filter(c => c.status === 'unhealthy');
    const degradedChecks = checks.filter(c => c.status === 'degraded');

    if (unhealthyChecks.length > 0) {
      overallStatus = 'unhealthy';
    } else if (degradedChecks.length > 0) {
      overallStatus = 'degraded';
    }

    io.logger.info(`Health check complete: ${overallStatus}`, { checks });

    if (overallStatus !== 'healthy') {
      Sentry.captureMessage(
        `System health check: ${overallStatus}`,
        overallStatus === 'unhealthy' ? 'error' : 'warning',
        {
          extra: { checks, overallStatus },
        }
      );
    }

    await io.runTask('persist-status', async () => {
      const { error } = await supabase
        .from('system_health')
        .upsert({
          id: 'latest',
          status: overallStatus,
          checks: checks,
          checked_at: new Date().toISOString(),
        });

      if (error) {
        io.logger.error('Failed to persist health status', error);
      }
    });

    const durationMs = Date.now() - startTime;

    const output: MaintenanceJobOutput = {
      processed: checks.length,
      modified: 0,
      errors: unhealthyChecks.map(c => c.message),
      log: checks.map(c => `${c.name}: ${c.status} - ${c.message}`),
      durationMs,
    };

    return MaintenanceJobOutputSchema.parse(output);
  },
});

export default maintenanceHealthCheck;
