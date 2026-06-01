/**
 * Onboarding Repository
 *
 * Supabase CRUD for onboarding_profiles table.
 * Called by service.ts via dynamic import("./repository").
 */

import { z } from 'zod';
import { getSupabaseClient } from '../../config/supabase';
import { OnboardingProgressSchema } from './schemas';
import type { OnboardingProgress } from './schemas';

// ── DB row schema (snake_case) ──────────────────────────────────────────

const OnboardingProfileRowSchema = z
  .object({
    id: z.string().uuid(),
    user_id: z.string().uuid(),
    status: z.enum(['IN_PROGRESS', 'FIRST_SESSION_IN_PROGRESS', 'COMPLETED']),
    steps: z.object({
      profileStarted: z.boolean(),
      goalSelected: z.boolean(),
      firstSessionStarted: z.boolean(),
      firstSessionCompleted: z.boolean(),
      rewardSeen: z.boolean(),
    }),
    first_session: z.object({
      sessionId: z.string().uuid().optional(),
      startedAt: z.number().optional(),
      completedAt: z.number().optional(),
    }),
    permissions: z.object({
      notificationAsked: z.boolean(),
      notificationGranted: z.boolean(),
    }),
    goal: z.string().nullable(),
    focus_duration: z.number().int().nullable(),
    display_name: z.string().nullable(),
    persona: z.string().nullable(),
    element: z.string().nullable(),
    motivation_profile: z.unknown().nullable(),
    chosen_lane: z.string().nullable(),
    created_at: z.string().datetime(),
    updated_at: z.string().datetime(),
  })
  .strict();

type OnboardingProfileRow = z.infer<typeof OnboardingProfileRowSchema>;

// ── Error class ─────────────────────────────────────────────────────────

export class OnboardingRepositoryError extends Error {
  constructor(
    public readonly operation: string,
    public readonly cause?: unknown,
  ) {
    super(`OnboardingRepository ${operation} failed`);
    this.name = 'OnboardingRepositoryError';
  }
}

// ── Mapping helpers ─────────────────────────────────────────────────────

function rowToProgress(row: OnboardingProfileRow): OnboardingProgress {
  return OnboardingProgressSchema.parse({
    userId: row.user_id,
    status: row.status,
    steps: row.steps,
    firstSession: row.first_session,
    permissions: row.permissions,
  });
}

// ── Public API ──────────────────────────────────────────────────────────

async function getProgress(
  userId: string,
): Promise<OnboardingProgress | null> {
  try {
    const parsed = z.string().uuid().parse(userId);
    const { data, error } = await getSupabaseClient()
      .from('onboarding_profiles')
      .select('*')
      .eq('user_id', parsed)
      .maybeSingle();
    if (error) {
      throw new OnboardingRepositoryError('getProgress', error);
    }
    if (!data) {return null;}
    return rowToProgress(OnboardingProfileRowSchema.parse(data));
  } catch (error) {
    if (error instanceof OnboardingRepositoryError) {throw error;}
    throw new OnboardingRepositoryError('getProgress', error);
  }
}

async function saveProgress(
  userId: string,
  progress: OnboardingProgress,
): Promise<void> {
  try {
    const parsed = OnboardingProgressSchema.parse(progress);
    const { error } = await getSupabaseClient()
      .from('onboarding_profiles')
      .upsert(
        {
          user_id: z.string().uuid().parse(userId),
          status: parsed.status,
          steps: parsed.steps,
          first_session: parsed.firstSession,
          permissions: parsed.permissions,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'user_id' },
      );
    if (error) {
      throw new OnboardingRepositoryError('saveProgress', error);
    }
  } catch (error) {
    if (error instanceof OnboardingRepositoryError) {throw error;}
    throw new OnboardingRepositoryError('saveProgress', error);
  }
}

export const onboardingRepository = { getProgress, saveProgress } as const;
