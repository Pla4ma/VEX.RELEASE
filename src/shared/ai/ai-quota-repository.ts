import { getDefaultStorageAdapter } from '../../persistence/MMKVStorageAdapter';
import { getSupabaseClient } from '../../config/supabase';
import type { AIRequestCategory, QuotaUsageRecord } from './ai-quota-types';
import { QuotaUsageRecordSchema } from './ai-quota-types';
import { HOURLY_WINDOW_MS, DAILY_WINDOW_MS } from './ai-quota-strategies';

const QUOTA_STORE_KEY = 'ai_quota_usage';
const MAX_STORED_RECORDS = 200;

function buildRecordKey(userId: string, category: AIRequestCategory): string {
  return `${QUOTA_STORE_KEY}:${userId}:${category}`;
}

function loadRecords(
  userId: string,
  category: AIRequestCategory,
): QuotaUsageRecord[] {
  try {
    const raw = getDefaultStorageAdapter().getItemSync(
      buildRecordKey(userId, category),
    );
    if (!raw) {return [];}
    const parsed = JSON.parse(raw) as unknown[];
    return parsed.map((r) => QuotaUsageRecordSchema.parse(r));
  } catch (error: unknown) {
    return [];
  }
}

function saveRecords(
  userId: string,
  category: AIRequestCategory,
  records: QuotaUsageRecord[],
): void {
  const trimmed = records.slice(-MAX_STORED_RECORDS);
  getDefaultStorageAdapter().setItemSync(
    buildRecordKey(userId, category),
    JSON.stringify(trimmed),
  );
}

export function recordUsage(record: QuotaUsageRecord): void {
  const records = loadRecords(record.userId, record.category);
  records.push(record);
  saveRecords(record.userId, record.category, records);
}

export function countUsageInWindow(
  userId: string,
  category: AIRequestCategory,
  windowStart: number,
): { count: number; tokenCount: number } {
  const records = loadRecords(userId, category);
  const inWindow = records.filter((r) => r.timestamp > windowStart);
  return {
    count: inWindow.length,
    tokenCount: inWindow.reduce((sum, r) => sum + r.tokenCount, 0),
  };
}

export function getHourlyUsage(
  userId: string,
  category: AIRequestCategory,
): { count: number; tokenCount: number } {
  const windowStart = Date.now() - HOURLY_WINDOW_MS;
  return countUsageInWindow(userId, category, windowStart);
}

export function getDailyUsage(
  userId: string,
  category: AIRequestCategory,
): { count: number; tokenCount: number } {
  const windowStart = Date.now() - DAILY_WINDOW_MS;
  return countUsageInWindow(userId, category, windowStart);
}

export function clearUsage(userId: string, category: AIRequestCategory): void {
  getDefaultStorageAdapter().removeItemSync(buildRecordKey(userId, category));
}

export async function syncQuotaToSupabase(
  userId: string,
  category: AIRequestCategory,
  record: QuotaUsageRecord,
): Promise<void> {
  try {
    const { error } = await getSupabaseClient()
      .from('ai_quota_log')
      .insert({
        user_id: userId,
        category,
        token_count: record.tokenCount,
        created_at: new Date(record.timestamp).toISOString(),
      });
    if (error) {
      // Non-blocking — client-side MMKV is the source of truth
    }
  } catch (error: unknown) {
    // Non-blocking
  }
}
