/**
 * Coach Reminder Delivery Job
 *
 * Trigger.dev job for delivering scheduled coach reminders
 */

import { job } from '@trigger.dev/sdk';
import { getSupabaseClient } from '../../src/config/supabase';
import {
  scheduleLocalNotification,
  sendPushNotification,
  getPushToken,
} from '../../src/features/ai-coach/services/notification-service';
import { withRetry } from '../../src/features/ai-coach/utils/retry';
import { getUserTimezone, isQuietHours } from '../../src/features/ai-coach/utils/timezone';

// ============================================================================
// Reminder Delivery Job
// ============================================================================

export const coachReminderDeliveryJob = job({
  id: 'coach-reminder-delivery',
  name: 'Coach Reminder Delivery',
  version: '1.0.0',
  // Run every 5 minutes
  cron: '*/5 * * * *',

  run: async (payload, io) => {
    const supabase = getSupabaseClient();

    // Fetch due reminders
    const { data: dueReminders, error: fetchError } = await io.runTask(
      'fetch-due-reminders',
      async () => {
        const now = Date.now();
        return supabase
          .from('reminder_plans')
          .select('*')
          .eq('status', 'SCHEDULED')
          .lte('scheduled_for', now)
          .order('scheduled_for', { ascending: true });
      }
    );

    if (fetchError) {
      throw new Error(`Failed to fetch reminders: ${fetchError.message}`);
    }

    if (!dueReminders?.data || dueReminders.data.length === 0) {
      return { delivered: 0, skipped: 0 };
    }

    let delivered = 0;
    let skipped = 0;

    for (const reminder of dueReminders.data) {
      try {
        // Check quiet hours
        const userTimezone = getUserTimezone(reminder.user_id);
        if (isQuietHours(userTimezone)) {
          await io.runTask(`skip-quiet-hours-${reminder.id}`, async () => {
            // Reschedule for after quiet hours
            const afterQuietHours = new Date();
            afterQuietHours.setHours(8, 0, 0, 0);
            if (afterQuietHours.getTime() < Date.now()) {
              afterQuietHours.setDate(afterQuietHours.getDate() + 1);
            }

            return supabase
              .from('reminder_plans')
              .update({ scheduled_for: afterQuietHours.getTime() })
              .eq('id', reminder.id);
          });
          skipped++;
          continue;
        }

        // Deliver notification
        await io.runTask(`deliver-${reminder.id}`, async () => {
          const notificationId = await scheduleLocalNotification({
            id: reminder.id,
            userId: reminder.user_id,
            personaId: reminder.persona_id,
            category: reminder.reminder_type === 'STREAK_CHECK' ? 'STREAK_RISK' : 'MOTIVATION_BOOST',
            content: reminder.context?.message || 'Time for your focus session!',
            deliveryMethod: reminder.delivery_method,
            priority: 7,
            status: 'SCHEDULED',
            createdAt: reminder.created_at,
            scheduledFor: reminder.scheduled_for,
            deliveredAt: null,
            readAt: null,
            dismissedAt: null,
            actionTaken: null,
            actionTakenAt: null,
          });

          // Also send push if user has push token
          const pushToken = await getPushToken();
          if (pushToken) {
            await withRetry(
              () => sendPushNotification(pushToken, {
                id: reminder.id,
                userId: reminder.user_id,
                personaId: reminder.persona_id,
                category: reminder.reminder_type === 'STREAK_CHECK' ? 'STREAK_RISK' : 'MOTIVATION_BOOST',
                content: reminder.context?.message || 'Time for your focus session!',
                deliveryMethod: 'PUSH',
                priority: 7,
                status: 'SENT',
                createdAt: Date.now(),
                scheduledFor: null,
                deliveredAt: null,
                readAt: null,
                dismissedAt: null,
                actionTaken: null,
                actionTakenAt: null,
              }),
              { maxAttempts: 3 },
              'send-push-reminder'
            );
          }

          return notificationId;
        });

        // Mark reminder as delivered
        await io.runTask(`mark-delivered-${reminder.id}`, async () => {
          return supabase
            .from('reminder_plans')
            .update({
              status: 'DELIVERED',
              delivered_at: Date.now(),
            })
            .eq('id', reminder.id);
        });

        delivered++;
      } catch (error) {
        await io.runTask(`mark-failed-${reminder.id}`, async () => {
          return supabase
            .from('reminder_plans')
            .update({
              status: 'FAILED',
              error_message: error instanceof Error ? error.message : 'Unknown error',
            })
            .eq('id', reminder.id);
        });
      }
    }

    return { delivered, skipped, total: dueReminders.data.length };
  },
});

// ============================================================================
// Batch Reminder Scheduler Job
// ============================================================================

export const coachReminderSchedulerJob = job({
  id: 'coach-reminder-scheduler',
  name: 'Coach Reminder Scheduler',
  version: '1.0.0',
  // Run once per hour
  cron: '0 * * * *',

  run: async (payload, io) => {
    const supabase = getSupabaseClient();

    // Find users who need reminders
    const { data: usersNeedingReminders, error } = await io.runTask(
      'find-users-needing-reminders',
      async () => {
        // Users with active streaks at risk
        return supabase
          .from('coach_states')
          .select(`
            user_id,
            current_state,
            interventions_today,
            streaks!inner(*)
          `)
          .eq('current_state', 'STREAK_AT_RISK')
          .lt('interventions_today', 3)
          .gte('streaks.current_streak', 3);
      }
    );

    if (error || !usersNeedingReminders?.data) {
      return { scheduled: 0 };
    }

    let scheduled = 0;

    for (const state of usersNeedingReminders.data) {
      try {
        // Check if reminder already scheduled
        const { data: existingReminder } = await io.runTask(
          `check-existing-${state.user_id}`,
          async () => {
            return supabase
              .from('reminder_plans')
              .select('id')
              .eq('user_id', state.user_id)
              .eq('status', 'SCHEDULED')
              .gte('scheduled_for', Date.now())
              .single();
          }
        );

        if (existingReminder?.data) {
          continue;
        }

        // Schedule new reminder
        const userTimezone = getUserTimezone(state.user_id);
        const optimalTimes = getOptimalReminderTimes('morning', userTimezone);
        const nextReminderTime = optimalTimes.find(t => t > Date.now());

        if (!nextReminderTime) {
          continue;
        }

        await io.runTask(`schedule-${state.user_id}`, async () => {
          return supabase
            .from('reminder_plans')
            .insert({
              user_id: state.user_id,
              persona_id: state.persona_id,
              reminder_type: 'STREAK_CHECK',
              scheduled_for: nextReminderTime,
              delivery_method: 'BOTH',
              status: 'SCHEDULED',
              context: {
                current_streak: state.streaks?.current_streak,
                message: 'Your streak is at risk! Time to save it with a quick session.',
              },
              created_at: Date.now(),
            });
        });

        scheduled++;
      } catch (error) {
        console.error(`Failed to schedule reminder for ${state.user_id}:`, error);
      }
    }

    return { scheduled };
  },
});

// ============================================================================
// Helper Import (avoid circular dependency)
// ============================================================================
import { getOptimalReminderTimes } from '../../src/features/ai-coach/utils/timezone';
