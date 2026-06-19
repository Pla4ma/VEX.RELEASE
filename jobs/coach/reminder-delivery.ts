/**
 * Coach Reminder Delivery Job
 *
 * Trigger.dev job for delivering scheduled coach reminders
 */

import { job } from '@trigger.dev/sdk';
import { Sentry, initJobSentry } from '../shared/sentry';
import { getUserTimezone, getOptimalReminderTimes } from '../../src/features/ai-coach/utils/timezone';
import { isQuietHours } from '../../src/features/notifications/service-helpers';
import {
  fetchDueReminders,
  rescheduleQuietHours,
  deliverReminderNotification,
  markReminderDelivered,
  markReminderFailed,
  findUsersNeedingReminders,
  checkExistingReminder,
  scheduleReminder,
} from './reminder-delivery-query';

  initJobSentry();

export const coachReminderDeliveryJob = job({
  id: 'coach-reminder-delivery',
  name: 'Coach Reminder Delivery',
  version: '1.0.0',
  cron: '*/5 * * * *',

  run: async (payload, io) => {
    const { data: dueReminders, error: fetchError } = await io.runTask(
      'fetch-due-reminders',
      () => fetchDueReminders()
    );

    if (fetchError) {
      throw new Error(`Failed to fetch reminders: ${fetchError.message}`);
    }

    if (!dueReminders?.data || dueReminders.data.length === 0) {
      return { delivered: 0, skipped: 0 };
    }

    let delivered = 0;
    let skipped = 0;

    const reminderPromises = (dueReminders.data || []).map(async (reminder) => {
      try {
        const userTimezone = getUserTimezone(reminder.user_id);
        if (isQuietHours(userTimezone)) {
          await io.runTask(`skip-quiet-hours-${reminder.id}`, () => rescheduleQuietHours(reminder.id));
          return { type: 'skipped' as const };
        }

        await io.runTask(`deliver-${reminder.id}`, () => deliverReminderNotification(reminder));
        await io.runTask(`mark-delivered-${reminder.id}`, () => markReminderDelivered(reminder.id));

        return { type: 'delivered' as const };
      } catch (error) {
        await io.runTask(`mark-failed-${reminder.id}`, () => markReminderFailed(reminder.id, error));
        return { type: 'error' as const };
      }
    });

    const results = await Promise.all(reminderPromises);
    delivered = results.filter(r => r.type === 'delivered').length;
    skipped = results.filter(r => r.type === 'skipped').length;

    return { delivered, skipped, total: dueReminders.data.length };
  },
});

export const coachReminderSchedulerJob = job({
  id: 'coach-reminder-scheduler',
  name: 'Coach Reminder Scheduler',
  version: '1.0.0',
  cron: '0 * * * *',

  run: async (payload, io) => {
    const { data: usersNeedingReminders, error } = await io.runTask(
      'find-users-needing-reminders',
      () => findUsersNeedingReminders()
    );

    if (error || !usersNeedingReminders?.data) {
      return { scheduled: 0 };
    }

    const schedulePromises = usersNeedingReminders.data.map(async (state) => {
      try {
        const { data: existingReminder } = await io.runTask(
          `check-existing-${state.user_id}`,
          () => checkExistingReminder(state.user_id)
        );

        if (existingReminder?.data) {
          return { scheduled: false };
        }

        const userTimezone = getUserTimezone(state.user_id);
        const optimalTimes = getOptimalReminderTimes('morning', userTimezone);
        const nextReminderTime = optimalTimes.find(t => t > Date.now());

        if (!nextReminderTime) {
          return { scheduled: false };
        }

        await io.runTask(`schedule-${state.user_id}`, () => scheduleReminder(state, nextReminderTime));

        return { scheduled: true };
      } catch (error) {
        Sentry.captureException(error, { tags: { job: 'coach-reminder-delivery', operation: 'schedule-reminder', userId: state.user_id } });
        return { scheduled: false };
      }
    });

    const results = await Promise.all(schedulePromises);
    const scheduled = results.filter(r => r.scheduled).length;

    return { scheduled };
  },
});
