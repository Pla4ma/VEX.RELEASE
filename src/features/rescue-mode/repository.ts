import { getSupabaseClient } from '../../config/supabase';
import { createDebugger } from '../../utils/debug';
import { storage } from '../../store/mmkv-storage';
import {
  RescueCompletionRecordSchema,
  RescuePlanSchema,
  type RescueCompletionMemory,
  type RescueCompletionRecord,
  type RescuePlan,
} from './schemas';

const debug = createDebugger('rescue-mode:repository');

const ACTIVE_PLAN_KEY_PREFIX = 'rescue-mode:active:';

export class RescueRepositoryError extends Error {
  constructor(operation: string, cause: unknown) {
    const message = cause instanceof Error ? cause.message : String(cause);
    super(`Rescue mode ${operation} failed: ${message}`);
    this.name = 'RescueRepositoryError';
  }
}

export async function getActiveRescuePlan(
  userId: string,
): Promise<RescuePlan | null> {
  try {
    const raw = storage.getString(`${ACTIVE_PLAN_KEY_PREFIX}${userId}`);
    if (!raw) {return null;}
    return RescuePlanSchema.parse(JSON.parse(raw));
  } catch (error) {
    debug.info('getActiveRescuePlan failed: %s', String(error));
    return null;
  }
}

export async function saveActiveRescuePlan(
  plan: RescuePlan,
): Promise<RescuePlan> {
  const parsed = RescuePlanSchema.parse(plan);
  storage.set(
    `${ACTIVE_PLAN_KEY_PREFIX}${parsed.userId}`,
    JSON.stringify(parsed),
  );
  return parsed;
}

export async function clearActiveRescuePlan(userId: string): Promise<void> {
  storage.delete(`${ACTIVE_PLAN_KEY_PREFIX}${userId}`);
}

export async function saveRescueCompletion(
  record: RescueCompletionRecord,
): Promise<RescueCompletionRecord> {
  const parsed = RescueCompletionRecordSchema.parse(record);
  const db = getSupabaseClient();

  const { error } = await db.from('rescue_completions').insert({
    id: parsed.id,
    user_id: parsed.userId,
    plan_id: parsed.planId,
    reason: parsed.reason,
    lane: parsed.lane,
    duration_seconds: parsed.durationSeconds,
    outcome: parsed.outcome,
    worked: parsed.worked,
    next_recommendation: parsed.nextRecommendation,
    completed_at: new Date(parsed.completedAt).toISOString(),
  });

  if (error) {
    debug.info(
      'Failed to persist rescue completion, cached locally: %s',
      String(error),
    );
    const key = `rescue:completion:${parsed.id}`;
    storage.set(key, JSON.stringify(parsed));
  }

  return parsed;
}

export async function saveRescueMemory(
  memory: RescueCompletionMemory,
): Promise<void> {
  try {
    const db = getSupabaseClient();
    const { error } = await db.from('rescue_memories').insert({
      id: memory.id,
      source: memory.source,
      text: memory.text,
      confidence: memory.confidence,
      created_at: new Date().toISOString(),
    });

    if (error) {
      debug.info(
        'Failed to persist rescue memory, cached locally: %s',
        String(error),
      );
      const key = `rescue:memory:${memory.id}`;
      storage.set(key, JSON.stringify(memory));
    }
  } catch (err) {
    debug.info('Rescue memory save failed: %s', String(err));
  }
}

export async function getRescueCompletions(
  userId: string,
  limit?: number,
): Promise<RescueCompletionRecord[]> {
  const db = getSupabaseClient();

  const query = db
    .from('rescue_completions')
    .select('*')
    .eq('user_id', userId)
    .order('completed_at', { ascending: false });

  if (limit) {
    query.limit(limit);
  }

  const { data, error } = await query;

  if (error || !data) {
    debug.info('Failed to fetch rescue completions: %s', String(error));
    return [];
  }

  return data.map((row: Record<string, unknown>) =>
    RescueCompletionRecordSchema.parse({
      id: row.id,
      userId: row.user_id,
      planId: row.plan_id,
      reason: row.reason,
      lane: row.lane,
      durationSeconds: row.duration_seconds,
      outcome: row.outcome,
      worked: row.worked,
      nextRecommendation: row.next_recommendation,
      completedAt: new Date(row.completed_at as string).getTime(),
    }),
  );
}
