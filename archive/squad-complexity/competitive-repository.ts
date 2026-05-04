import { z } from 'zod';

import { getSupabaseClient, handleSupabaseError } from '../../config/supabase';

const supabase = getSupabaseClient();

const memberRowSchema = z.object({
  user_id: z.string(),
  users: z
    .object({
      username: z.string().optional().nullable(),
      first_name: z.string().optional().nullable(),
      avatar_url: z.string().optional().nullable(),
    })
    .optional()
    .nullable(),
});

const sessionRowSchema = z.object({
  user_id: z.string(),
  focus_minutes: z.number().optional().nullable(),
  duration_minutes: z.number().optional().nullable(),
  total_focus_time: z.number().optional().nullable(),
  focus_purity_score: z.number().optional().nullable(),
  focus_quality: z.number().optional().nullable(),
  completed_at: z.string().optional().nullable(),
  ended_at: z.string().optional().nullable(),
  started_at: z.string().optional().nullable(),
});

const contributionUpsertSchema = z.object({
  userId: z.string(),
  squadId: z.string(),
  date: z.string(),
  minutes: z.number().int().min(0),
  purityScore: z.number().min(0).max(100),
  streakMultiplier: z.number().min(0),
  contributionScore: z.number().int().min(0),
});

export type CompetitiveSquadMemberRow = z.infer<typeof memberRowSchema>;
export type CompetitiveSessionRow = z.infer<typeof sessionRowSchema>;

export async function fetchCompetitiveSquadMembers(
  squadId: string,
): Promise<CompetitiveSquadMemberRow[]> {
  const { data, error } = await supabase
    .from('squad_members')
    .select('user_id, users:user_id ( username, first_name, avatar_url )')
    .eq('squad_id', squadId)
    .eq('is_active', true);
  if (error) {throw handleSupabaseError(error);}
  return memberRowSchema.array().parse(data ?? []);
}

export async function fetchSessionsForMembers(
  memberIds: string[],
): Promise<CompetitiveSessionRow[]> {
  if (memberIds.length === 0) {return [];}
  const { data, error } = await supabase
    .from('sessions')
    .select(
      'user_id, focus_minutes, duration_minutes, total_focus_time, focus_purity_score, focus_quality, completed_at, ended_at, started_at',
    )
    .in('user_id', memberIds);
  if (error) {throw handleSupabaseError(error);}
  return sessionRowSchema.array().parse(data ?? []);
}

export async function upsertDailyContribution(input: z.infer<typeof contributionUpsertSchema>) {
  const payload = contributionUpsertSchema.parse(input);
  const { error } = await supabase.from('squad_daily_contributions').upsert(
    {
      user_id: payload.userId,
      squad_id: payload.squadId,
      contribution_date: payload.date,
      minutes_focused: payload.minutes,
      purity_score: payload.purityScore,
      streak_multiplier: payload.streakMultiplier,
      contribution_score: payload.contributionScore,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'user_id,squad_id,contribution_date' },
  );
  if (error) {throw handleSupabaseError(error);}
}
