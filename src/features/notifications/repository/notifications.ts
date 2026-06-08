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

/** Shape of a Supabase notifications row. */
interface NotificationRow {
  id?: string | number;
  type?: string;
  notification_type?: string;
  title?: string;
  message?: string;
  body?: string;
  created_at?: string | number;
  timestamp?: string | number;
  read?: boolean;
  is_read?: boolean;
  avatar?: string;
  action_text?: string;
  action_route?: string;
  action_params?: Record<string, unknown>;
  [key: string]: unknown;
}

function mapNotificationRow(
  row: NotificationRow,
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
        ? row.action_params
        : undefined,
  });
}

export async function fetchNotificationCenterItems(
  userId: string,
  cursor?: string,
): Promise<{ items: NotificationCenterItem[]; nextCursor: string | null }> {
  let query = supabase
    .from('notifications')
    .select('id,type,notification_type,title,message,body,created_at,timestamp,read,is_read,avatar,action_text,action_route,action_params')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (cursor) {
    query = query.lt('created_at', cursor);
  }

  const { data, error } = await query.limit(100);
  if (error) {
    throw new RepositoryError('fetchNotificationCenterItems', error);
  }
  const items = (data ?? []).map((row) =>
    mapNotificationRow(row as NotificationRow),
  );
  const nextCursor = items.length === 100
    ? (items[items.length - 1]?.timestamp?.toString() ?? null)
    : null;
  return { items, nextCursor };
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

/**
 * Tracks active notification channels to prevent duplicate subscriptions
 * for the same userId. Keyed by userId.
 */
const activeNotificationChannels = new Map<string, ReturnType<typeof supabase.channel>>();

export function subscribeToNotificationCenter(
  userId: string,
  onChange: () => void,
): () => void {
  // Return no-op cleanup if a channel for this user already exists
  if (activeNotificationChannels.has(userId)) {
    return () => {};
  }

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

  activeNotificationChannels.set(userId, channel);

  return () => {
    const activeChannel = activeNotificationChannels.get(userId);
    if (activeChannel) {
      activeChannel.unsubscribe();
      activeNotificationChannels.delete(userId);
    }
  };
}
