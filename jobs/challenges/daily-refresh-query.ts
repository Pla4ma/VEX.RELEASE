/**
 * Daily Challenge Refresh - Query Helpers & Schemas
 *
 * Extracted from daily-refresh.ts to stay under 200-line limit.
 */

import { createHash } from 'node:crypto';
import { z } from 'zod';
import type { SupabaseClient } from '@supabase/supabase-js';

// ============================================================================
// Schemas
// ============================================================================

export const ChallengePoolItemSchema = z.object({
  id: z.string().min(1),
  category: z.enum(['MINUTES', 'SESSIONS', 'SOCIAL', 'STREAK', 'BOSS_DAMAGE', 'ACHIEVEMENT']),
  title: z.string().min(1),
  description: z.string().min(1),
  requiredCount: z.number().int().positive(),
  xpReward: z.number().int().nonnegative(),
  coinReward: z.number().int().nonnegative(),
  weight: z.number().positive(),
}).strict();

export type ChallengePoolItem = z.infer<typeof ChallengePoolItemSchema>;

// ============================================================================
// Challenge Pool Data
// ============================================================================

export const CHALLENGE_POOL: ChallengePoolItem[] = [
  { id: 'easy-15-minute-session', category: 'MINUTES', title: 'Complete a 15-min session', description: 'Finish one focused 15 minute session today.', requiredCount: 15, xpReward: 100, coinReward: 50, weight: 0.4 / 3 },
  { id: 'easy-log-mood', category: 'SOCIAL', title: 'Log a mood', description: 'Check in with how you are feeling today.', requiredCount: 1, xpReward: 100, coinReward: 50, weight: 0.4 / 3 },
  { id: 'easy-check-streak', category: 'STREAK', title: 'Check streak', description: 'Open your streak and make sure today is on track.', requiredCount: 1, xpReward: 100, coinReward: 50, weight: 0.4 / 3 },
  { id: 'medium-25-minute-session', category: 'MINUTES', title: 'Complete a 25-min session', description: 'Finish at least 25 focused minutes today.', requiredCount: 25, xpReward: 250, coinReward: 100, weight: 0.4 / 3 },
  { id: 'medium-two-sessions', category: 'SESSIONS', title: 'Complete 2 sessions today', description: 'Finish two separate focus sessions today.', requiredCount: 2, xpReward: 250, coinReward: 100, weight: 0.4 / 3 },
  { id: 'medium-purity', category: 'BOSS_DAMAGE', title: 'Achieve 80%+ purity', description: 'Record a focus session with at least 80% purity.', requiredCount: 1, xpReward: 250, coinReward: 100, weight: 0.4 / 3 },
  { id: 'hard-45-minute-session', category: 'MINUTES', title: 'Complete a 45-min session', description: 'Lock in for a full 45 minute session today.', requiredCount: 45, xpReward: 500, coinReward: 250, weight: 0.2 / 3 },
  { id: 'hard-three-sessions', category: 'SESSIONS', title: '3 sessions in one day', description: 'Finish three focus sessions before the day resets.', requiredCount: 3, xpReward: 500, coinReward: 250, weight: 0.2 / 3 },
  { id: 'hard-seven-day-streak', category: 'ACHIEVEMENT', title: '7-day streak', description: 'Reach or maintain a 7 day streak.', requiredCount: 7, xpReward: 500, coinReward: 250, weight: 0.2 / 3 },
].map((item) => ChallengePoolItemSchema.parse(item));

// ============================================================================
// Sampling & ID Helpers
// ============================================================================

export function weightedSample(count: number): ChallengePoolItem[] {
  const pool = [...CHALLENGE_POOL];
  const picked: ChallengePoolItem[] = [];
  while (picked.length < count && pool.length > 0) {
    const totalWeight = pool.reduce((sum, item) => sum + item.weight, 0);
    let cursor = Math.random() * totalWeight;
    const index = pool.findIndex((item) => {
      cursor -= item.weight;
      return cursor <= 0;
    });
    picked.push(pool.splice(index >= 0 ? index : 0, 1)[0]);
  }
  return picked;
}

export function toMidnightUtc(date: Date): Date {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate() + 1, 0, 0, 0, 0));
}

export function deterministicUuid(seed: string): string {
  const hash = createHash('sha1').update(seed).digest('hex');
  return `${hash.slice(0, 8)}-${hash.slice(8, 12)}-5${hash.slice(13, 16)}-a${hash.slice(17, 20)}-${hash.slice(20, 32)}`;
}

export function challengeIdFor(seasonId: string, dateKey: string, userId: string, templateId: string): string {
  return deterministicUuid(`${seasonId}:${dateKey}:${userId}:${templateId}`);
}

// ============================================================================
// Query Helpers
// ============================================================================

export async function listRecentlyActiveUsers(supabase: SupabaseClient, userIds?: string[]): Promise<string[]> {
  const cutoff = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const activeUsers: string[] = [];
  let page = 1;
  const perPage = 1000;
  while (true) {
    const { data, error } = await supabase.auth.admin.listUsers({ page, perPage });
    if (error) throw error;
    const users = data.users ?? [];
    for (const user of users) {
      if (!user.last_sign_in_at) continue;
      if (new Date(user.last_sign_in_at) < cutoff) continue;
      if (userIds && userIds.length > 0 && !userIds.includes(user.id)) continue;
      activeUsers.push(user.id);
    }
    if (users.length < perPage) break;
    page += 1;
  }
  return activeUsers;
}

export async function sendPushNotifications(supabase: SupabaseClient, userIds: string[]): Promise<number> {
  if (userIds.length === 0) return 0;
  const { data, error } = await supabase
    .from('push_tokens')
    .select('user_id, token')
    .in('user_id', userIds)
    .eq('is_active', true);
  if (error) throw error;
  const httpRequest = globalThis.fetch.bind(globalThis);
  let sent = 0;
  for (const row of data ?? []) {
    const token = (row as { token?: string }).token;
    if (!token) continue;
    const response = await httpRequest('https://exp.host/--/api/v2/push/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        to: token,
        title: 'Your daily challenges are live',
        body: "Keep your streak rolling. Today's daily challenges are ready when you are.",
        data: {
          type: 'daily_challenge_refresh',
        },
      }),
    });
    if (response.ok) sent += 1;
  }
  return sent;
}
