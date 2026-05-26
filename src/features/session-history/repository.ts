import { z } from 'zod';
import { getSupabaseClient } from '../../config/supabase';
import {
  SupabaseSessionRowSchema,
  type SupabaseSessionRow,
} from './schemas';
import { createDebugger } from '../../utils/debug';

const debug = createDebugger('session-history:repository');

export class SessionHistoryRepositoryError extends Error {
  constructor(operation: string, cause: unknown) {
    const message = cause instanceof Error ? cause.message : String(cause);
    super(`Session history ${operation} failed: ${message}`);
    this.name = 'SessionHistoryRepositoryError';
  }
}

const CreateSessionInputSchema = z.object({
  sessionId: z.string().uuid(),
  userId: z.string().min(1),
  status: z.string().min(1),
  duration: z.number().int().min(0),
  effectiveDuration: z.number().int().min(0).nullable(),
  qualityScore: z.number().min(0).max(100).nullable(),
  mode: z.string().nullable(),
  difficulty: z.string().nullable(),
  metadata: z.unknown(),
  startedAt: z.string().nullable(),
  completedAt: z.string().nullable(),
  endedAt: z.string().nullable(),
});

type CreateSessionInput = z.infer<typeof CreateSessionInputSchema>;

function toSessionRow(input: CreateSessionInput): Record<string, unknown> {
  const now = new Date().toISOString();
  return {
    id: input.sessionId,
    user_id: input.userId,
    status: input.status,
    duration: input.duration,
    effective_duration: input.effectiveDuration,
    quality_score: input.qualityScore,
    mode: input.mode,
    difficulty: input.difficulty,
    metadata: input.metadata,
    started_at: input.startedAt ?? now,
    completed_at: input.completedAt,
    ended_at: input.endedAt,
    created_at: now,
    updated_at: now,
  };
}

export async function fetchSessionHistoryRows(
  userId: string,
  limit: number,
): Promise<SupabaseSessionRow[]> {
  const { data, error } = await getSupabaseClient()
    .from('sessions')
    .select(
      [
        'id',
        'user_id',
        'status',
        'duration',
        'effective_duration',
        'quality_score',
        'mode',
        'difficulty',
        'metadata',
        'started_at',
        'completed_at',
        'ended_at',
        'created_at',
        'updated_at',
      ].join(','),
    )
    .eq('user_id', userId)
    .order('started_at', { ascending: false })
    .limit(limit);

  if (error) {
    throw new SessionHistoryRepositoryError('fetch', error);
  }

  return SupabaseSessionRowSchema.array().parse(data ?? []);
}

export async function createSessionRecord(
  input: CreateSessionInput,
): Promise<SupabaseSessionRow> {
  const validated = CreateSessionInputSchema.parse(input);
  const supabase = getSupabaseClient();
  const row = toSessionRow(validated);

  const { data, error } = await supabase
    .from('sessions')
    .insert(row)
    .select('*')
    .single();

  if (error) {
    if (error.code === '23505' || error.code === '409') {
      const existing = await supabase
        .from('sessions')
        .select('*')
        .eq('id', validated.sessionId)
        .single();

      if (existing.data) {
        debug.info('Session record already exists: %s', validated.sessionId);
        return SupabaseSessionRowSchema.parse(existing.data);
      }
    }
    throw new SessionHistoryRepositoryError('create', error);
  }

  const parsed = SupabaseSessionRowSchema.safeParse(data);
  if (!parsed.success) {
    throw new SessionHistoryRepositoryError('create:invalid-response', parsed.error);
  }

  debug.info('Session record persisted: %s', parsed.data.id);
  return parsed.data;
}

export async function countCompletedSessions(userId: string): Promise<number> {
  const { count, error } = await getSupabaseClient()
    .from('sessions')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('status', 'COMPLETED');

  if (error) {
    throw new SessionHistoryRepositoryError('countCompletedSessions', error);
  }

  return count ?? 0;
}
