import { getSupabaseClient } from '../../src/config/supabase';
import {
  scheduleLocalNotification,
  sendPushNotification,
  getPushToken,
} from '../../src/features/ai-coach/services/notification-service';
import { withRetry } from '../../src/features/ai-coach/utils/retry';

export async function fetchDueReminders() {
  const supabase = getSupabaseClient();
  const now = Date.now();
  return supabase
    .from('reminder_plans')
    .select('*')
    .eq('status', 'SCHEDULED')
    .lte('scheduled_for', now)
    .order('scheduled_for', { ascending: true });
}

export async function rescheduleQuietHours(reminderId: string) {
  const supabase = getSupabaseClient();
  const afterQuietHours = new Date();
  afterQuietHours.setHours(8, 0, 0, 0);
  if (afterQuietHours.getTime() < Date.now()) {
    afterQuietHours.setDate(afterQuietHours.getDate() + 1);
  }

  return supabase
    .from('reminder_plans')
    .update({ scheduled_for: afterQuietHours.getTime() })
    .eq('id', reminderId);
}

export async function deliverReminderNotification(reminder: {
  id: string;
  user_id: string;
  persona_id: string;
  reminder_type: string;
  context?: { message?: string };
  delivery_method: string;
  created_at: number;
  scheduled_for: number;
}) {
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
}

export async function markReminderDelivered(reminderId: string) {
  const supabase = getSupabaseClient();
  return supabase
    .from('reminder_plans')
    .update({
      status: 'DELIVERED',
      delivered_at: Date.now(),
    })
    .eq('id', reminderId);
}

export async function markReminderFailed(reminderId: string, error: unknown) {
  const supabase = getSupabaseClient();
  return supabase
    .from('reminder_plans')
    .update({
      status: 'FAILED',
      error_message: error instanceof Error ? error.message : 'Unknown error',
    })
    .eq('id', reminderId);
}

export async function findUsersNeedingReminders() {
  const supabase = getSupabaseClient();
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

export async function checkExistingReminder(userId: string) {
  const supabase = getSupabaseClient();
  return supabase
    .from('reminder_plans')
    .select('id')
    .eq('user_id', userId)
    .eq('status', 'SCHEDULED')
    .gte('scheduled_for', Date.now())
    .single();
}

export async function scheduleReminder(state: {
  user_id: string;
  persona_id?: string;
  streaks?: { current_streak?: number };
}, nextReminderTime: number) {
  const supabase = getSupabaseClient();
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
}
