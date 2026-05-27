import type { WarRow, WarDamageRow, PushTokenRow } from './weekly-reset-types';
import { BOSS_ROTATION } from './weekly-reset-types';

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

export function readString(value: unknown): string | null {
  return typeof value === 'string' ? value : null;
}

export function readNumber(value: unknown): number | null {
  return typeof value === 'number' ? value : null;
}

export function toWarRow(value: unknown): WarRow | null {
  if (!isRecord(value)) return null;
  const id = readString(value.id);
  const squadId = readString(value.squad_id);
  const bossName = readString(value.boss_name);
  const weekStartsAt = readString(value.week_starts_at);
  const weekEndsAt = readString(value.week_ends_at);
  const maxHealth = readNumber(value.boss_max_health);
  const currentHealth = readNumber(value.boss_current_health);
  const rewardMultiplier = value.reward_multiplier === null ? null : readNumber(value.reward_multiplier);
  if (!id || !squadId || !bossName || !weekStartsAt || !weekEndsAt || maxHealth === null || currentHealth === null) {
    return null;
  }
  return {
    id,
    squad_id: squadId,
    boss_name: bossName,
    boss_max_health: maxHealth,
    boss_current_health: currentHealth,
    reward_multiplier: rewardMultiplier,
    week_starts_at: weekStartsAt,
    week_ends_at: weekEndsAt,
  };
}

export function toWarDamageRow(value: unknown): WarDamageRow | null {
  if (!isRecord(value)) return null;
  const userId = readString(value.user_id);
  const damage = readNumber(value.damage);
  if (!userId || damage === null) return null;
  const users = isRecord(value.users)
    ? {
        display_name: readString(value.users.display_name),
        username: readString(value.users.username),
      }
    : null;
  const sessionId = readString(value.session_id) ?? undefined;
  return { user_id: userId, damage, session_id: sessionId, users };
}

export function toPushTokenRow(value: unknown): PushTokenRow | null {
  if (!isRecord(value)) return null;
  const userId = readString(value.user_id);
  const token = readString(value.token);
  const platform = readString(value.platform);
  return userId && token && platform ? { user_id: userId, token, platform } : null;
}

export function parseArray<T>(data: unknown, operation: string, parseItem: (value: unknown) => T | null): T[] {
  if (data === null || data === undefined) return [];
  if (!Array.isArray(data)) {
    throw new Error(`${operation} expected an array response`);
  }
  return data.map(parseItem).filter((row): row is T => row !== null);
}

export function getWeekBoss(weekStartsAt: Date) {
  const weekSeed = Math.floor(weekStartsAt.getTime() / (7 * 24 * 60 * 60 * 1000));
  return BOSS_ROTATION[Math.abs(weekSeed) % BOSS_ROTATION.length];
}

export function getNextUtcWeekWindow(reference: Date): { start: Date; end: Date } {
  const start = new Date(reference);
  start.setUTCHours(0, 0, 0, 0);

  const day = start.getUTCDay();
  const daysUntilMonday = (8 - day) % 7 || 7;
  start.setUTCDate(start.getUTCDate() + daysUntilMonday);

  const end = new Date(start);
  end.setUTCDate(end.getUTCDate() + 7);
  end.setUTCMilliseconds(-1);

  return { start, end };
}

export function buildDisplayName(row: WarDamageRow): string {
  const displayName = row.users?.display_name?.trim();
  if (displayName) {
    return displayName;
  }

  const username = row.users?.username?.trim();
  return username || 'Squadmate';
}
