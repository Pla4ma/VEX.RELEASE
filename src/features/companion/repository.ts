/**
 * Companion Profile Repository
 *
 * Supabase CRUD for companion_profiles table.
 * Provides sync/backup for the MMKV-based companion state.
 */

import { z } from 'zod';
import { getSupabaseClient } from '../../config/supabase';

// ── Zod schemas ─────────────────────────────────────────────────────────

const CompanionElementEnum = z.enum([
  'FLAME',
  'WAVE',
  'TERRA',
  'ZEPHYR',
  'VOID',
  'LUMINA',
]);
const CompanionPhaseEnum = z.enum([
  'EGG',
  'HATCHING',
  'YOUNG',
  'MATURE',
  'AWAKENED',
  'TRANSCENDENT',
]);
const CompanionMoodEnum = z.enum([
  'SLEEPY',
  'CONTENT',
  'FOCUSED',
  'DETERMINED',
  'ECSTATIC',
  'STRUGGLING',
  'DANGER',
]);

export const CompanionProfileRowSchema = z
  .object({
    id: z.string().uuid(),
    user_id: z.string().uuid(),
    name: z.string().min(1),
    profile_type: z.string().min(1),
    phase: CompanionPhaseEnum,
    level: z.number().int().min(1),
    xp: z.number().int().min(0),
    total_focus_minutes: z.number().int().min(0),
    element: CompanionElementEnum,
    element_affinity: z.number().int().min(0).max(100),
    current_mood: CompanionMoodEnum,
    session_progress: z.number().int().min(0).max(100),
    purity_score: z.number().int().min(0).max(100),
    energy_level: z.number().int().min(0).max(100),
    visual_seed: z.number().int().min(0),
    color_hue: z.number().int().min(0).max(360),
    particle_density: z.number().min(0),
    session_count: z.number().int().min(0),
    perfect_sessions: z.number().int().min(0),
    longest_focus_streak: z.number().int().min(0),
    next_evolution_at: z.number().int().min(0),
    special_ability_charge: z.number().int().min(0).max(100),
    equipped_items: z.array(z.string()),
    unlocked_abilities: z.array(z.string()),
    last_fed_at: z.string().datetime(),
    last_petted_at: z.string().datetime().nullable(),
    created_at: z.string().datetime(),
    updated_at: z.string().datetime(),
  })
  .strict();

export type CompanionProfileRow = z.infer<typeof CompanionProfileRowSchema>;

export const CompanionProfileInsertSchema = CompanionProfileRowSchema.omit({
  id: true,
  created_at: true,
  updated_at: true,
}).strict();

export type CompanionProfileInsert = z.infer<
  typeof CompanionProfileInsertSchema
>;

// ── Error class ─────────────────────────────────────────────────────────

export class CompanionRepositoryError extends Error {
  constructor(
    public readonly operation: string,
    public readonly cause?: unknown,
  ) {
    super(`CompanionRepository ${operation} failed`);
    this.name = 'CompanionRepositoryError';
  }
}

// ── Public API ──────────────────────────────────────────────────────────

export async function getProfile(
  userId: string,
): Promise<CompanionProfileRow | null> {
  try {
    const parsed = z.string().uuid().parse(userId);
    const { data, error } = await getSupabaseClient()
      .from('companion_profiles')
      .select('*')
      .eq('user_id', parsed)
      .maybeSingle();
    if (error) {
      throw new CompanionRepositoryError('getProfile', error);
    }
    if (!data) {return null;}
    return CompanionProfileRowSchema.parse(data);
  } catch (error) {
    if (error instanceof CompanionRepositoryError) {throw error;}
    throw new CompanionRepositoryError('getProfile', error);
  }
}

export async function upsertProfile(
  profile: CompanionProfileInsert,
): Promise<CompanionProfileRow> {
  try {
    const parsed = CompanionProfileInsertSchema.parse(profile);
    const { data, error } = await getSupabaseClient()
      .from('companion_profiles')
      .upsert(parsed, { onConflict: 'user_id' })
      .select('*')
      .single();
    if (error) {
      throw new CompanionRepositoryError('upsertProfile', error);
    }
    return CompanionProfileRowSchema.parse(data);
  } catch (error) {
    if (error instanceof CompanionRepositoryError) {throw error;}
    throw new CompanionRepositoryError('upsertProfile', error);
  }
}

export async function deleteProfile(userId: string): Promise<void> {
  try {
    const parsed = z.string().uuid().parse(userId);
    const { error } = await getSupabaseClient()
      .from('companion_profiles')
      .delete()
      .eq('user_id', parsed);
    if (error) {
      throw new CompanionRepositoryError('deleteProfile', error);
    }
  } catch (error) {
    if (error instanceof CompanionRepositoryError) {throw error;}
    throw new CompanionRepositoryError('deleteProfile', error);
  }
}
