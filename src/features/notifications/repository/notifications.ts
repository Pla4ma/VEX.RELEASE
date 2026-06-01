import { z } from 'zod';
import {
  NotificationCenterItemSchema,
  type NotificationCenterItem,
} from '../schemas';
import { RepositoryError, supabase } from './shared';

const UnreadNotificationsCountSchema = z.number().int().nonnegative();

export async function fetchUnreadNotificationsCount(
  userId: string,
): Promise<number> {
  const { count, error } = await supabase
    .from('notifications')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('read', false);
  if (error) {
    throw new RepositoryError('fetchUnreadNotificationsCount', error);
  }
  return UnreadNotificationsCountSchema.parse(count ?? 0);
}

function mapNotificationRow(
  row: Record<string, unknown>,
): NotificationCenterItem {
  const rawType = String(row.type || row.notification_type || '').toUpperCase();
  const parsed = NotificationCenterItemSchema.shape.type.safeParse(rawType);
  return NotificationCenterItemSchema.parse({
    id: String(row.id),
    type: parsed.success ? parsed.data : 'COACH',
    title: String(row.title || ''),
    message: String(row.message || row.body || ''),
    timestamp: Number(row.created_at || row.timestamp || Date.now()),
    read: Boolean(row.read || row.is_read || false),
    avatar: typeof row.avatar === 'string' ? row.avatar : undefined,
    actionText:
      typeof row.action_text === 'string' ? row.action_text : undefined,
    actionRoute:
      typeof row.action_route === 'string' ? row.action_route : undefined,
    actionParams:
      typeof row.action_params === 'object' && row.action_params !== null
        ? (row.action_params as Record<string, unknown>)
        : undefined,
  });
}

export async function fetchNotificationCenterItems(
  userId: string,
): Promise<NotificationCenterItem[]> {
  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(100);
  if (error) {
    throw new RepositoryError('fetchNotificationCenterItems', error);
  }
  return (data ?? []).map((row) =>
    mapNotificationRow(row as Record<string, unknown>),
  );
}

export async function markNotificationRead(
  userId: string,
  notificationId: string,
): Promise<void> {
  const { error } = await supabase
    .from('notifications')
    .update({ read: true, updated_at: new Date().toISOString() })
    .eq('id', notificationId)
    .eq('user_id', userId);
  if (error) {
    throw new RepositoryError('markNotificationRead', error);
  }
}

export async function markAllNotificationsRead(userId: string): Promise<void> {
  const { error } = await supabase
    .from('notifications')
    .update({ read: true, updated_at: new Date().toISOString() })
    .eq('user_id', userId)
    .eq('read', false);
  if (error) {
    throw new RepositoryError('markAllNotificationsRead', error);
  }
}

export function subscribeToNotificationCenter(
  userId: string,
  onChange: () => void,
): () => void {
  const channelName = `notifications-screen:${userId}`;
  const channel = supabase
    .channel(channelName)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'notifications',
        filter: `user_id=eq.${userId}`,
      },
      onChange,
    )
    .subscribe();
  return () => {
    void channel.unsubscribe();
  };
}
