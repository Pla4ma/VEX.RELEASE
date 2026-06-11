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
    timestamp: typeof row.created_at === 'string'
      ? Date.parse(row.created_at)
      : typeof row.timestamp === 'string'
        ? Date.parse(row.timestamp)
        : Number(row.created_at || row.timestamp || Date.now()),
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
  // Use raw DB created_at for cursor — it is an ISO timestamp string that
  // matches the .lt('created_at', cursor) filter. Using the mapped numeric
  // timestamp would produce a mismatched cursor.
  const lastRow = data?.[data.length - 1] as NotificationRow | undefined;
  const nextCursor = items.length === 100 && lastRow?.created_at != null
    ? String(lastRow.created_at)
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
 * Tracks active notification channels and subscriber counts per userId.
 * Keyed by userId, holds channel + subscriber count + callback set.
 */
interface NotificationChannelEntry {
  channel: ReturnType<typeof supabase.channel>;
  refCount: number;
  callbacks: Set<() => void>;
}

const activeNotificationChannels = new Map<string, NotificationChannelEntry>();

export function subscribeToNotificationCenter(
  userId: string,
  onChange: () => void,
): () => void {
  const existing = activeNotificationChannels.get(userId);

  if (existing) {
    // Channel already exists — add this subscriber's callback and bump ref
    existing.callbacks.add(onChange);
    existing.refCount++;
    return () => {
      existing.callbacks.delete(onChange);
      existing.refCount--;
      if (existing.refCount <= 0) {
        existing.channel.unsubscribe();
        activeNotificationChannels.delete(userId);
      }
    };
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
      () => {
        // Notify all active subscribers
        const entry = activeNotificationChannels.get(userId);
        if (entry) {
          entry.callbacks.forEach((cb) => cb());
        }
      },
    )
    .subscribe();

  activeNotificationChannels.set(userId, {
    channel,
    refCount: 1,
    callbacks: new Set([onChange]),
  });

  return () => {
    const entry = activeNotificationChannels.get(userId);
    if (!entry) {return;}
    entry.callbacks.delete(onChange);
    entry.refCount--;
    if (entry.refCount <= 0) {
      entry.channel.unsubscribe();
      activeNotificationChannels.delete(userId);
    }
  };
}
