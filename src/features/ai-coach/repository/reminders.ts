import { getSupabaseClient } from '../../../config/supabase';
import {
  ReminderPlanSchema,
  ComebackPlanSchema,
  type ReminderPlan,
  type ComebackPlan,
  type ComebackStatus,
} from '../schemas';
import { RepositoryError } from './error';

const supabase = getSupabaseClient();

export async function createReminderPlan(
  reminder: ReminderPlan,
): Promise<ReminderPlan> {
  const { data, error } = await supabase
    .from('reminder_plans')
    .insert({
      id: reminder.id,
      user_id: reminder.userId,
      reminder_type: reminder.reminderType,
      scheduled_for: reminder.scheduledFor,
      message_id: reminder.messageId,
      priority: reminder.priority,
      sent: reminder.sent,
      sent_at: reminder.sentAt,
      delivered: reminder.delivered,
      opened: reminder.opened,
    })
    .select()
    .single();
  if (error) {
    throw new RepositoryError('createReminderPlan', error);
  }
  return ReminderPlanSchema.parse(data);
}

export async function fetchPendingReminders(
  beforeTime: number,
): Promise<ReminderPlan[]> {
  const { data, error } = await supabase
    .from('reminder_plans')
    .select('*')
    .eq('sent', false)
    .lte('scheduled_for', beforeTime)
    .order('priority', { ascending: false })
    .order('scheduled_for', { ascending: true });
  if (error) {
    throw new RepositoryError('fetchPendingReminders', error);
  }
  return ReminderPlanSchema.array().parse(data || []);
}

export async function markReminderSent(
  reminderId: string,
  sentAt: number,
): Promise<ReminderPlan> {
  const { data, error } = await supabase
    .from('reminder_plans')
    .update({ sent: true, sent_at: sentAt })
    .eq('id', reminderId)
    .select()
    .single();
  if (error) {
    throw new RepositoryError('markReminderSent', error);
  }
  return ReminderPlanSchema.parse(data);
}

export async function updateReminderDelivery(
  reminderId: string,
  delivered: boolean,
  opened: boolean,
): Promise<ReminderPlan> {
  const { data, error } = await supabase
    .from('reminder_plans')
    .update({ delivered, opened })
    .eq('id', reminderId)
    .select()
    .single();
  if (error) {
    throw new RepositoryError('updateReminderDelivery', error);
  }
  return ReminderPlanSchema.parse(data);
}

export async function upsertComebackPlan(
  plan: ComebackPlan,
): Promise<ComebackPlan> {
  const { data, error } = await supabase
    .from('comeback_plans')
    .upsert({
      id: plan.id,
      user_id: plan.userId,
      previous_streak: plan.previousStreak,
      days_inactive: plan.daysInactive,
      status: plan.status,
      started_at: plan.startedAt,
      expires_at: plan.expiresAt,
      sessions_completed: plan.sessionsCompleted,
      target_sessions: plan.targetSessions,
      bonus_multiplier: plan.bonusMultiplier,
      messages: plan.messages,
    })
    .select()
    .single();
  if (error) {
    throw new RepositoryError('upsertComebackPlan', error);
  }
  return ComebackPlanSchema.parse(data);
}

export async function fetchActiveComebackPlan(
  userId: string,
): Promise<ComebackPlan | null> {
  const now = Date.now();
  const { data, error } = await supabase
    .from('comeback_plans')
    .select('*')
    .eq('user_id', userId)
    .in('status', ['OFFERED', 'ACTIVE'])
    .gt('expires_at', now)
    .order('started_at', { ascending: false })
    .limit(1)
    .single();
  if (error) {
    if (error.code === 'PGRST116') {
      return null;
    }
    throw new RepositoryError('fetchActiveComebackPlan', error);
  }
  return data ? ComebackPlanSchema.parse(data) : null;
}

export async function updateComebackPlanStatus(
  planId: string,
  status: ComebackStatus,
  sessionsCompleted?: number,
): Promise<ComebackPlan> {
  const updates: Record<string, unknown> = { status };
  if (sessionsCompleted !== undefined) {
    updates.sessions_completed = sessionsCompleted;
  }
  const { data, error } = await supabase
    .from('comeback_plans')
    .update(updates)
    .eq('id', planId)
    .select()
    .single();
  if (error) {
    throw new RepositoryError('updateComebackPlanStatus', error);
  }
  return ComebackPlanSchema.parse(data);
}
