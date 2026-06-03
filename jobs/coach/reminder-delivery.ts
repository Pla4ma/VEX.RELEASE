/**
 * Coach Reminder Delivery Job
 *
 * Trigger.dev job for delivering scheduled coach reminders
 */

import { job } from '@trigger.dev/sdk';
import { Sentry, initJobSentry } from '../shared/sentry';
import { getUserTimezone, isQuietHours, getOptimalReminderTimes } from '../../src/features/ai-coach/utils/timezone';
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

    for (const reminder of dueReminders.data) {
      try {
        const userTimezone = getUserTimezone(reminder.user_id);
        if (isQuietHours(userTimezone)) {
          await io.runTask(`skip-quiet-hours-${reminder.id}`, () => rescheduleQuietHours(reminder.id));
          skipped++;
          continue;
        }

        await io.runTask(`deliver-${reminder.id}`, () => deliverReminderNotification(reminder));
        await io.runTask(`mark-delivered-${reminder.id}`, () => markReminderDelivered(reminder.id));

        delivered++;
      } catch (error) {
        await io.runTask(`mark-failed-${reminder.id}`, () => markReminderFailed(reminder.id, error));
      }
    }

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

    let scheduled = 0;

    for (const state of usersNeedingReminders.data) {
      try {
        const { data: existingReminder } = await io.runTask(
          `check-existing-${state.user_id}`,
          () => checkExistingReminder(state.user_id)
        );

        if (existingReminder?.data) {
          continue;
        }

        const userTimezone = getUserTimezone(state.user_id);
        const optimalTimes = getOptimalReminderTimes('morning', userTimezone);
        const nextReminderTime = optimalTimes.find(t => t > Date.now());

        if (!nextReminderTime) {
          continue;
        }

        await io.runTask(`schedule-${state.user_id}`, () => scheduleReminder(state, nextReminderTime));

        scheduled++;
      } catch (error) {
        Sentry.captureException(error, { tags: { job: 'coach-reminder-delivery', operation: 'schedule-reminder', userId: state.user_id } });
      }
    }

    return { scheduled };
  },
});
