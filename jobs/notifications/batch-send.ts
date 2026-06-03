/**
 * Notification Batch Send Job
 *
 * Trigger: Webhook from Supabase notifications table
 * Purpose: Send push notifications in batches with rate limiting
 *
 * Input: { notificationIds: string[], priority: string }
 * Output: { sent: number, failed: number, throttled: number, errors: Array }
 */

import { task } from '@trigger.dev/sdk';
import * as Sentry from '@sentry/node';
import { z } from 'zod';
import { createClient } from '@supabase/supabase-js';
import { NotificationBatchInputSchema, NotificationBatchOutputSchema } from '../../shared/jobs/schemas.ts';
import { RETRY_CONFIGS, TIMEOUT_CONFIGS, BATCH_CONFIGS, JOB_IDS, RATE_LIMIT_CONFIGS } from '../../shared/jobs/job-constants.ts';
import type { NotificationBatchInput, NotificationBatchOutput } from '../../shared/jobs/schemas.ts';
import { sendPushNotification } from './batch-send-helpers.ts';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
});

// Create Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * Notification batch send job
 */
export const notificationBatchSend = task({
  id: JOB_IDS.NOTIFICATION_BATCH_SEND,
  name: 'Notification Batch Send',
  version: '1.0.0',

  // Trigger: Webhook or manual
  trigger: {
    type: 'webhook',
  },

  input: NotificationBatchInputSchema,

  retry: {
    ...RETRY_CONFIGS.DEFAULT,
    maxAttempts: 5, // More retries for notifications
  },

  timeout: TIMEOUT_CONFIGS.LONG, // 15 minutes for large batches

  run: async (input, io) => {
    const { userIds, title, body, data, delaySeconds, throttleMs } = input;

    io.logger.info(`Starting batch send to ${userIds.length} users`);

    // Apply delay if specified
    if (delaySeconds && delaySeconds > 0) {
      await io.wait.for({ seconds: delaySeconds });
    }

    // Get user push tokens
    const userTokens = await io.runTask('fetch-tokens', async () => {
      const { data: tokens, error } = await supabase
        .from('push_tokens')
        .select('user_id, token, platform')
        .in('user_id', userIds)
        .eq('is_active', true);

      if (error) throw error;
      return tokens || [];
    });

    if (userTokens.length === 0) {
      io.logger.warn('No active push tokens found for target users');
      return {
        sent: 0,
        failed: 0,
        throttled: 0,
        errors: [],
        durationMs: 0,
      };
    }

    // Results tracking
    const results = {
      sent: 0,
      failed: 0,
      throttled: 0,
      errors: [] as Array<{ userId: string; error: string }>,
    };

    // Rate limiting setup
    const throttleDelay = throttleMs || Math.ceil(1000 / RATE_LIMIT_CONFIGS.NOTIFICATIONS_PER_SECOND);
    const batchSize = BATCH_CONFIGS.NOTIFICATION_SEND;
    const batches = Math.ceil(userTokens.length / batchSize);

    io.logger.info(`Sending to ${userTokens.length} devices in ${batches} batches (throttle: ${throttleDelay}ms)`);

    // Process in batches
    for (let i = 0; i < batches; i++) {
      const batch = userTokens.slice(i * batchSize, (i + 1) * batchSize);

      await io.runTask(`send-batch-${i}`, async () => {
        for (const userToken of batch) {
          try {
            const success = await sendPushNotification({
              token: userToken.token,
              platform: userToken.platform,
              title,
              body,
              data,
            });

            if (success) {
              results.sent++;
            } else {
              results.failed++;
              results.errors.push({
                userId: userToken.user_id,
                error: 'Push service returned failure',
              });
            }

            // Throttle
            if (throttleDelay > 0) {
              await new Promise(resolve => setTimeout(resolve, throttleDelay));
            }

          } catch (err) {
            results.failed++;
            const error = err instanceof Error ? err.message : String(err);
            results.errors.push({ userId: userToken.user_id, error });

            Sentry.captureException(err, {
              tags: { job: JOB_IDS.NOTIFICATION_BATCH_SEND, userId: userToken.user_id },
            });
          }
        }
      });

      // Progress logging
      const progress = ((i + 1) / batches * 100).toFixed(1);
      io.logger.info(`Batch ${i + 1}/${batches} complete (${progress}%) - Sent: ${results.sent}, Failed: ${results.failed}`);
    }

    // Update notification records
    await io.runTask('update-records', async () => {
      const { error } = await supabase
        .from('notifications')
        .update({
          status: 'SENT',
          sent_at: new Date().toISOString(),
          sent_count: results.sent,
          failed_count: results.failed,
        })
        .in('user_id', userIds)
        .eq('status', 'PENDING');

      if (error) throw error;
    });

    // Publish completion event
    await io.runTask('publish-event', async () => {
      io.logger.info('Notification batch completed', results);
    });

    const output: NotificationBatchOutput = {
      sent: results.sent,
      failed: results.failed,
      throttled: results.throttled,
      errors: results.errors,
      durationMs: 0,
    };

    return NotificationBatchOutputSchema.parse(output);
  },
});

export default notificationBatchSend;
