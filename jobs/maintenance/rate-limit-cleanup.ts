/**
 * Rate Limit Bucket Cleanup Job
 *
 * Trigger: Hourly cron
 * Purpose: Purge expired rate_limit_buckets rows so the table does not grow
 * unbounded (one row per API call). Without this the rate-limit check itself
 * degrades under load.
 */

import { job } from '@trigger.dev/sdk';
import { JOB_IDS } from '../../shared/jobs/job-constants.ts';

const MAX_BUCKET_AGE_HOURS = 2;

export const rateLimitCleanupJob = job({
  id: JOB_IDS.MAINTENANCE_RATE_LIMIT_CLEANUP,
  name: 'Rate Limit Bucket Cleanup',
  version: '1.0.0',
  cron: '0 * * * *',

  run: async (_payload, io) => {
    const deleted = await io.runTask('cleanup-rate-limit-buckets', async () => {
      const { createClient } = await import('@supabase/supabase-js');
      const supabase = createClient(
        process.env.SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
      );
      const { data, error } = await supabase.rpc('cleanup_rate_limit_buckets', {
        p_max_age_hours: MAX_BUCKET_AGE_HOURS,
      });
      if (error) {
        io.logger.error('Failed to clean up rate limit buckets', error);
        throw error;
      }
      return typeof data === 'number' ? data : 0;
    });

    return {
      deleted,
      completedAt: new Date().toISOString(),
    };
  },
});

export default rateLimitCleanupJob;
