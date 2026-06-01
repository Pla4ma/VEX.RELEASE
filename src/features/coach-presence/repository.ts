import { z } from 'zod';
import { getSupabaseClient } from '../../config/supabase';
import {
  CoachPresenceMemorySummarySchema,
  type CoachPresenceMemorySummary,
} from './schemas';

const CoachMemorySummaryRowSchema = z
  .object({
    description: z.string().nullable(),
    title: z.string().nullable(),
  })
  .strict();

const CompanionMemorySummaryRowSchema = z
  .object({
    body: z.string().nullable(),
    title: z.string().nullable(),
  })
  .strict();

export class CoachPresenceRepositoryError extends Error {
  constructor(
    operation: string,
    public readonly cause?: unknown,
  ) {
    super(`CoachPresenceRepository ${operation} failed`);
    this.name = 'CoachPresenceRepositoryError';
  }
}

export async function fetchCoachPresenceMemorySummary(
  userId: string,
): Promise<CoachPresenceMemorySummary> {
  try {
    const parsedUserId = z.string().uuid().parse(userId);
    const [coachResult, companionResult] = await Promise.all([
      getSupabaseClient()
        .from('coach_memories')
        .select('title, description')
        .eq('user_id', parsedUserId)
        .order('occurred_at', { ascending: false })
        .limit(3),
      getSupabaseClient()
        .from('companion_memories')
        .select('title, body')
        .eq('user_id', parsedUserId)
        .order('created_at', { ascending: false })
        .limit(3),
    ]);

    if (coachResult.error) {
      throw new CoachPresenceRepositoryError(
        'fetchCoachMemories',
        coachResult.error,
      );
    }
    if (companionResult.error) {
      throw new CoachPresenceRepositoryError(
        'fetchCompanionMemories',
        companionResult.error,
      );
    }

    const coachRows = z
      .array(CoachMemorySummaryRowSchema)
      .parse(coachResult.data ?? []);
    const companionRows = z
      .array(CompanionMemorySummaryRowSchema)
      .parse(companionResult.data ?? []);
    const latestMemory =
      coachRows[0]?.description ??
      companionRows[0]?.body ??
      coachRows[0]?.title ??
      companionRows[0]?.title ??
      null;

    return CoachPresenceMemorySummarySchema.parse({
      coachMemoryCount: coachRows.length,
      companionMemoryCount: companionRows.length,
      latestMemory,
    });
  } catch (error) {
    if (error instanceof CoachPresenceRepositoryError) {
      throw error;
    }
    throw new CoachPresenceRepositoryError('fetchMemorySummary', error);
  }
}
