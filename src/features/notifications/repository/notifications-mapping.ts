import {
  NotificationCenterItemSchema,
  type NotificationCenterItem,
} from '../schemas';
import type { Database, Json } from '../../../types/supabase';

export type NotificationRow = Database['public']['Tables']['notifications']['Row'];

function getObjectField(data: Json, key: string): Json | undefined {
  if (data === null || Array.isArray(data) || typeof data !== 'object') {
    return undefined;
  }
  return data[key];
}

function getStringField(data: Json, key: string): string | undefined {
  const value = getObjectField(data, key);
  return typeof value === 'string' ? value : undefined;
}

function getObjectParamField(
  data: Json,
  key: string,
): Record<string, unknown> | undefined {
  const value = getObjectField(data, key);
  return value !== null && !Array.isArray(value) && typeof value === 'object'
    ? value
    : undefined;
}

export function mapNotificationRow(
  row: NotificationRow,
): NotificationCenterItem {
  const rawType = String(row.type || '').toUpperCase();
  const parsed = NotificationCenterItemSchema.shape.type.safeParse(rawType);
  return NotificationCenterItemSchema.parse({
    id: String(row.id),
    type: parsed.success ? parsed.data : 'COACH',
    title: String(row.title || ''),
    message: String(row.body || ''),
    timestamp: Date.parse(row.created_at),
    read: row.read,
    avatar: getStringField(row.data, 'avatar'),
    actionText: getStringField(row.data, 'actionText'),
    actionRoute: getStringField(row.data, 'actionRoute'),
    actionParams: getObjectParamField(row.data, 'actionParams'),
  });
}
