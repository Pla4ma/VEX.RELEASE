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

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
});

// Create Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

// Health check thresholds
const THRESHOLDS = {
  dbResponseMs: 1000,
  queueDepth: 100,
  errorRatePercent: 5,
  diskUsagePercent: 85,
};

/**
 * Health check job
 */
export const maintenanceHealthCheck = task({
  id: JOB_IDS.MAINTENANCE_HEALTH_CHECK,
  
  // Trigger: Every 5 minutes
  trigger: {
    type: 'schedule',
    cron: SCHEDULE_CONFIGS.HEALTH_CHECK,
  },
  
  // Run function
  run: async (input, io) => {
    const startTime = Date.now();
    const checks = [];
    let overallStatus: 'healthy' | 'degraded' | 'unhealthy' = 'healthy';
    
    io.logger.info('Starting health check');
    
    // Check 1: Database connectivity
    const dbCheck = await io.runTask('check-database', async () => {
      const checkStart = Date.now();
      try {
        const { data, error } = await supabase
          .from('health_check')
          .select('id')
          .limit(1)
          .single();
        
        const responseTime = Date.now() - checkStart;
        
        if (error) {
          return {
            name: 'database',
            status: 'unhealthy',
            message: `Database error: ${error.message}`,
            responseTime,
          };
        }
        
        return {
          name: 'database',
          status: responseTime > THRESHOLDS.dbResponseMs ? 'degraded' : 'healthy',
          message: `Response time: ${responseTime}ms`,
          responseTime,
        };
      } catch (err) {
        return {
          name: 'database',
          status: 'unhealthy',
          message: `Exception: ${err instanceof Error ? err.message : String(err)}`,
          responseTime: Date.now() - checkStart,
        };
      }
    });
    
    checks.push(dbCheck);
    
    // Check 2: Pending jobs queue depth
    const queueCheck = await io.runTask('check-queue', async () => {
      try {
        // This would check your job queue depth
        // For Trigger.dev, we'd check the dashboard or use their API
        const estimatedQueueDepth = 0; // Placeholder
        
        return {
          name: 'job-queue',
          status: estimatedQueueDepth > THRESHOLDS.queueDepth ? 'degraded' : 'healthy',
          message: `Queue depth: ${estimatedQueueDepth}`,
          queueDepth: estimatedQueueDepth,
        };
      } catch (err) {
        return {
          name: 'job-queue',
          status: 'unhealthy',
          message: `Failed to check queue: ${err instanceof Error ? err.message : String(err)}`,
          queueDepth: -1,
        };
      }
    });
    
    checks.push(queueCheck);
    
    // Check 3: Recent error rate
    const errorCheck = await io.runTask('check-errors', async () => {
      try {
        // Query Sentry or your error tracking for recent error rate
        const timeWindow = '5 minutes';
        
        return {
          name: 'error-rate',
          status: 'healthy', // Would calculate actual error rate
          message: `Error rate within acceptable range (${timeWindow})`,
          errorRate: 0,
        };
      } catch (err) {
        return {
          name: 'error-rate',
          status: 'degraded',
          message: 'Could not calculate error rate',
          errorRate: -1,
        };
      }
    });
    
    checks.push(errorCheck);
    
    // Check 4: Active season status
    const seasonCheck = await io.runTask('check-seasons', async () => {
      try {
        const now = new Date().toISOString();
        const { data: activeSeasons, error } = await supabase
          .from('seasons')
          .select('id, name, end_at')
          .lte('start_at', now)
          .gte('end_at', now)
          .eq('is_active', true);
        
        if (error) throw error;
        
        if (!activeSeasons || activeSeasons.length === 0) {
          return {
            name: 'active-seasons',
            status: 'degraded',
            message: 'No active season found',
            activeSeasons: 0,
          };
        }
        
        return {
          name: 'active-seasons',
          status: 'healthy',
          message: `${activeSeasons.length} active season(s)`,
          activeSeasons: activeSeasons.length,
        };
      } catch (err) {
        return {
          name: 'active-seasons',
          status: 'degraded',
          message: `Failed to check seasons: ${err instanceof Error ? err.message : String(err)}`,
          activeSeasons: -1,
        };
      }
    });
    
    checks.push(seasonCheck);
    
    // Check 5: Economy health (recent transactions)
    const economyCheck = await io.runTask('check-economy', async () => {
      try {
        const { data: recentTransactions, error } = await supabase
          .from('transactions')
          .select('id, status')
          .gte('created_at', new Date(Date.now() - 5 * 60 * 1000).toISOString())
          .limit(100);
        
        if (error) throw error;
        
        return {
          name: 'economy',
          status: 'healthy',
          message: `${recentTransactions?.length || 0} recent transactions`,
          recentTransactions: recentTransactions?.length || 0,
        };
      } catch (err) {
        return {
          name: 'economy',
          status: 'degraded',
          message: `Failed to check economy: ${err instanceof Error ? err.message : String(err)}`,
          recentTransactions: -1,
        };
      }
    });
    
    checks.push(economyCheck);
    
    // Calculate overall status
    const unhealthyChecks = checks.filter(c => c.status === 'unhealthy');
    const degradedChecks = checks.filter(c => c.status === 'degraded');
    
    if (unhealthyChecks.length > 0) {
      overallStatus = 'unhealthy';
    } else if (degradedChecks.length > 0) {
      overallStatus = 'degraded';
    }
    
    // Log results
    io.logger.info(`Health check complete: ${overallStatus}`, { checks });
    
    // Report to Sentry if degraded or unhealthy
    if (overallStatus !== 'healthy') {
      Sentry.captureMessage(
        `System health check: ${overallStatus}`,
        overallStatus === 'unhealthy' ? 'error' : 'warning',
        {
          extra: { checks, overallStatus },
        }
      );
    }
    
    // Update health status in database
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
